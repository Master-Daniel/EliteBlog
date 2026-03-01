import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosConfig";
import Header from "../../components/Header";
import toast from "react-hot-toast";
import usePageTitle from "../../hooks/usePageTitle";

interface AdminStatus {
    hasAdmin: boolean;
}

const AdminSetup: React.FC = () => {
    usePageTitle("Admin Setup");
    const [username, setUsername] = useState("");
    const [setupKey, setSetupKey] = useState("");

    const { data: adminStatus, isLoading: statusLoading } = useQuery<AdminStatus>({
        queryKey: ["admin-status"],
        queryFn: async () => {
            const response = await axiosInstance.get("/admin/status");
            return response.data;
        },
    });

    const setupMutation = useMutation({
        mutationFn: async (data: { username: string; setupKey: string }) => {
            const response = await axiosInstance.post("/admin/setup", data);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || "Admin setup successful!");
            setUsername("");
            setSetupKey("");
            window.location.reload();
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message || "Setup failed. Please try again.");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !setupKey.trim()) {
            toast.error("Please fill in all fields");
            return;
        }
        setupMutation.mutate({ username: username.trim(), setupKey: setupKey.trim() });
    };

    if (statusLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-black">
                <Header />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (adminStatus?.hasAdmin) {
        return (
            <div className="min-h-screen bg-white dark:bg-black">
                <Header />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <div className="max-w-md w-full mx-4 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Already Configured</h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                An admin account has already been set up for this blog. 
                                Contact the existing admin to manage user roles.
                            </p>
                            <a 
                                href="/" 
                                className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Go to Homepage
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Header />
            <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                <div className="max-w-md w-full mx-4 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Setup</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Set up the first admin account for your blog. The user must have already logged in via GitHub.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                GitHub Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter GitHub username"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                The user must login via GitHub first before being promoted to admin.
                            </p>
                        </div>

                        <div>
                            <label htmlFor="setupKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Setup Key
                            </label>
                            <input
                                type="password"
                                id="setupKey"
                                value={setupKey}
                                onChange={(e) => setSetupKey(e.target.value)}
                                placeholder="Enter admin setup key"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                This is the ADMIN_SETUP_KEY from your backend .env file.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={setupMutation.isPending}
                            className="w-full py-3  cursor-pointer bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {setupMutation.isPending ? "Setting up..." : "Setup Admin"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminSetup;
