import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosConfig';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission | 'default';
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: 'default',
  });

  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      
      if (!isSupported) {
        setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
        return;
      }

      const permission = Notification.permission;
      
      // First set as supported so the button shows
      setState(prev => ({ ...prev, isSupported: true, isLoading: false, permission }));
      
      // Then check if already subscribed
      try {
        // Check if service worker is already registered
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          
          setState({
            isSupported: true,
            isSubscribed: !!subscription,
            isLoading: false,
            permission,
          });
        }
      } catch (err) {
        console.log('Service worker not ready yet:', err);
      }
    };

    checkSupport();
  }, []);

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported');
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    return registration;
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setState(prev => ({ ...prev, isLoading: false, permission }));
        return false;
      }

      const registration = await registerServiceWorker();
      
      const { data } = await axiosInstance.get('/push/vapid-public-key');
      const vapidPublicKey = data.publicKey;
      
      if (!vapidPublicKey) {
        console.error('VAPID public key not configured on server');
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const subscriptionJson = subscription.toJSON();
      
      await axiosInstance.post('/push/subscribe', {
        endpoint: subscriptionJson.endpoint,
        keys: {
          p256dh: subscriptionJson.keys?.p256dh,
          auth: subscriptionJson.keys?.auth,
        },
        userAgent: navigator.userAgent,
      });

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
        permission: 'granted',
      }));

      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [registerServiceWorker]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await axiosInstance.delete('/push/unsubscribe', {
          data: { endpoint: subscription.endpoint },
        });
        
        await subscription.unsubscribe();
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default usePushNotifications;
