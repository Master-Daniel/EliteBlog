import React from 'react';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import usePushNotifications from '../hooks/usePushNotifications';
import toast from 'react-hot-toast';

interface PushNotificationToggleProps {
  compact?: boolean;
}

const PushNotificationToggle: React.FC<PushNotificationToggleProps> = ({ compact = false }) => {
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) {
        toast.success('Push notifications disabled');
      } else {
        toast.error('Failed to disable notifications');
      }
    } else {
      if (permission === 'denied') {
        toast.error('Notifications are blocked. Please enable them in your browser settings.');
        return;
      }
      const success = await subscribe();
      if (success) {
        toast.success('Push notifications enabled! You\'ll be notified of new posts.');
      } else if (permission !== 'granted') {
        toast.error('Permission denied for notifications');
      } else {
        toast.error('Failed to enable notifications');
      }
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title={isSubscribed ? 'Disable notifications' : 'Enable notifications'}
        aria-label={isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : isSubscribed ? (
          <NotificationsActiveIcon className="text-blue-500" fontSize="small" />
        ) : (
          <NotificationsOffIcon className="text-gray-500 dark:text-gray-400" fontSize="small" />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        {isSubscribed ? (
          <NotificationsActiveIcon className="text-blue-500" />
        ) : (
          <NotificationsOffIcon className="text-gray-400" />
        )}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isSubscribed ? 'You\'ll receive notifications for new posts' : 'Get notified when new posts are published'}
          </p>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        aria-label={isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
        title={isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isSubscribed ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isSubscribed ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default PushNotificationToggle;
