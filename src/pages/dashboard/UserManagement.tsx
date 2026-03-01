import React from "react";
import Header from "../../components/Header";
import SideBar from "../../components/dashboard/SideBar";
import DataTable, { TableColumn } from "react-data-table-component";
import { getDataTableTheme } from "../../utils/dataTableThemes";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosConfig";
import DataTableLoader from "../../components/DataTableLoader";
import toast from "react-hot-toast";
import usePageTitle from "../../hooks/usePageTitle";


interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    avatarUrl: string;
    role: string;
    provider: string;
}

const UserManagement: React.FC = () => {
    usePageTitle("User Management");
    const { theme, userData } = useSelector((state: RootState) => state.global);
    const queryClient = useQueryClient();

    const { data: usersData, isLoading } = useQuery<{ users: { user: User }[] }>({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const response = await axiosInstance.get("/admin/users");
            return response.data;
        },
    });

    const promoteMutation = useMutation({
        mutationFn: async (userId: string) => {
            const response = await axiosInstance.post("/admin/promote", { userId });
            return response.data;
        },
        onSuccess: () => {
            toast.success("User promoted to admin");
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
        onError: () => {
            toast.error("Failed to promote user");
        },
    });

    const demoteMutation = useMutation({
        mutationFn: async (userId: string) => {
            const response = await axiosInstance.post("/admin/demote", { userId });
            return response.data;
        },
        onSuccess: () => {
            toast.success("User demoted to writer");
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || "Failed to demote user");
        },
    });

    const users = usersData?.users?.map(u => u.user) ?? [];

    const getProviderIcon = (provider: string) => {
        switch (provider?.toLowerCase()) {
            case 'github':
                return (
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span>GitHub</span>
                    </div>
                );
            case 'google':
                return (
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Google</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{provider || 'Unknown'}</span>
                    </div>
                );
        }
    };

    const columns: TableColumn<User>[] = [
        {
            name: "User",
            cell: (row) => (
                <div className="flex items-center gap-3 py-2">
                    <img 
                        src={row.avatarUrl || "/images/avatar.png"} 
                        alt={row.name || row.username} 
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">{row.name || row.username}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{row.username}</p>
                    </div>
                </div>
            ),
            grow: 2,
        },
        {
            name: "Email",
            selector: (row) => row.email,
            sortable: true,
        },
        {
            name: "Auth Method",
            cell: (row) => (
                <div className="text-gray-700 dark:text-gray-300">
                    {getProviderIcon(row.provider)}
                </div>
            ),
            sortable: true,
        },
        {
            name: "Role",
            cell: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                    row.role === 'admin' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                    {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
                </span>
            ),
            sortable: true,
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="flex gap-2">
                    {row.role === 'writer' ? (
                        <button
                            onClick={() => promoteMutation.mutate(row.id)}
                            disabled={promoteMutation.isPending}
                            className="cursor-pointer px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Make Admin
                        </button>
                    ) : row.id !== userData?.id ? (
                        <button
                            onClick={() => demoteMutation.mutate(row.id)}
                            disabled={demoteMutation.isPending}
                            className="cursor-pointer px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            Remove Admin
                        </button>
                    ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">You</span>
                    )}
                </div>
            ),
        },
    ];

    // Check if current user is admin
    if (userData?.role !== 'admin') {
        return (
            <div className="flex h-screen overflow-hidden">
                <SideBar />
                <div className="flex flex-col flex-1 min-h-0">
                    <Header />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
                            <p className="text-gray-600 dark:text-gray-400">You need admin privileges to access this page.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0">
                <Header />
                <div className="flex-1 overflow-y-auto p-6">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">User Management</h1>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {isLoading ? (
                            <div className="p-4">
                                <DataTableLoader text="Loading users..." />
                            </div>
                        ) : (
                            <DataTable 
                                columns={columns} 
                                data={users} 
                                pagination
                                theme={getDataTableTheme(theme)}
                                noDataComponent={
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No users found
                                    </div>
                                }
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
