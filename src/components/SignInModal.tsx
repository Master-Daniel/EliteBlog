import axiosInstance from "../api/axiosConfig";
import React, { useEffect, useCallback } from "react";

import { useGoogleLogin } from "@react-oauth/google";
import { setCookie } from "../utils/custom-functions";
import { useDispatch } from "react-redux";
import { setIsLoggedIn, setUserData } from "../redux/slices/globalSlice";

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {

    const dispatch = useDispatch()

    // Close modal when pressing Escape key
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        },
        [onClose]
    );

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (credentialResponse) => {
            try {
                const response = await axiosInstance.post("/auth/google/token", {
                    access_token: credentialResponse.access_token,
                });

                if (response.data && response.data.user) {
                    const { token, ...userData } = response.data.user;
                    setCookie("elite-blog-token", token, 1440);
                    dispatch(setUserData(userData));
                    dispatch(setIsLoggedIn(true));
                    onClose();
                }
            } catch (error) {
                console.error("Error authenticating with Google:", error);
            }
        },
        onError: () => {
            console.error("Google login failed");
        },
    });

    const handleGitHubLogin = () => {
        // Retrieve your GitHub OAuth settings from environment variables
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI; // e.g., https://your-app.com/github-callback
        const scope = "read:user user:email";
        // Generate a random state string for CSRF protection
        const state = Math.random().toString(36).substring(2);
        sessionStorage.setItem("github_oauth_state", state);

        // Construct the GitHub authorization URL
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
            redirectUri
        )}&scope=${encodeURIComponent(scope)}&state=${state}`;

        // Open a popup window instead of redirecting the main window
        const width = 600, height = 700;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;
        const popup = window.open(
            githubAuthUrl,
            "GitHub Auth",
            `width=${width},height=${height},top=${top},left=${left}`
        );

        // Listen for a message from the popup containing the GitHub code and state
        const messageHandler = async (event: MessageEvent) => {
            if (!event.data.user) return;

            // Check for the expected user data property
            if (event.data && event.data.user) {
                const { user } = event.data.user
                const { token, ...userData } = user;
                setCookie('elite-blog-token', token, 1440);
                dispatch(setUserData(userData))
                dispatch(setIsLoggedIn(true))
                onClose()
            } else {
                console.warn("No user data found in message");
            }

            window.removeEventListener("message", messageHandler);
            if (popup) popup.close();
        };

        window.addEventListener("message", messageHandler);
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
        } else {
            document.removeEventListener("keydown", handleKeyDown);
        }
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 dark:bg-white/20 backdrop-blur-sm z-50" onClick={onClose}>
            <div
                className="bg-white dark:bg-black p-6 sm:p-8 rounded-xl shadow-2xl w-[95%] max-w-md relative transition-transform transform scale-100"
                onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                    Sign In to Your Account
                </h2>

                <div className="space-y-4">
                    <button
                        onClick={() => handleGoogleLogin()}
                        className="w-full cursor-pointer py-3 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition focus:ring-2 focus:ring-red-400 !important"
                    >
                        <svg
                            role="img"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                        >
                            <title>Google</title>
                            <path
                                fill="currentColor"
                                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                            />
                        </svg>
                        Sign in with Google
                    </button>
                    <button
                        onClick={handleGitHubLogin}
                        className="w-full cursor-pointer py-3 flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition focus:ring-2 focus:ring-gray-600 dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-gray-900 dark:focus:ring-gray-400"
                    >
                        <svg
                            role="img"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                        >
                            <title>GitHub</title>
                            <path
                                fill="currentColor"
                                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.385.6.113.793-.258.793-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.24 1.84 1.24 1.07 1.835 2.809 1.305 3.494.998.108-.776.42-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.465-2.382 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.3-1.23 3.3-1.23.645 1.653.24 2.873.12 3.176.765.838 1.23 1.91 1.23 3.22 0 4.608-2.805 5.625-5.475 5.92.435.375.825 1.12.825 2.25 0 1.62-.015 2.935-.015 3.335 0 .315.195.69.795.57C20.565 22.092 24 17.595 24 12.297c0-6.627-5.373-12-12-12"
                            />
                        </svg>
                        Sign in with GitHub
                    </button>
                    <button className="w-full cursor-pointer py-3 flex items-center justify-center gap-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition focus:ring-2 focus:ring-sky-400">
                        <svg
                            role="img"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                        >
                            <title>X</title>
                            <path
                                fill="currentColor"
                                d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
                            />
                        </svg>
                        Sign in with Twitter
                    </button>
                    <button className="w-full cursor-pointer py-3 flex items-center justify-center gap-3 bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-lg transition focus:ring-2 focus:ring-blue-600">
                        <svg stroke="currentColor" role="img" fill="currentColor" className="w-5 h-5" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <title>LinkedIn</title>
                            <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"></path>
                        </svg>
                        Sign in with LinkedIn
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 text-gray-600 cursor-pointer dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 w-full text-center transition font-medium"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default SignInModal;
