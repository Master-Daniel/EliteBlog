import React from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { getDataTableTheme } from "../../utils/dataTableThemes";
import Header from "../../components/Header";
import SideBar from "../../components/dashboard/SideBar";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosConfig";
import DataTableLoader from "../../components/DataTableLoader";
import usePageTitle from "../../hooks/usePageTitle";
import { Link } from "react-router-dom";
import ArticleIcon from "@mui/icons-material/Article";
import PublishIcon from "@mui/icons-material/Publish";
import DraftsIcon from "@mui/icons-material/Drafts";
import PendingIcon from "@mui/icons-material/Pending";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CommentIcon from "@mui/icons-material/Comment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";

interface RecentPost {
    id: string;
    title: string;
    slug: string;
    createdAt: string;
    categoryName: string;
    authorName: string;
}

interface CategoryStat {
    id: string;
    name: string;
    postCount: number;
    percentage: number;
}

interface RecentUser {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
    role: string;
    createdAt: string;
}

interface UserDashboardStats {
    user: {
        totalPosts: number;
        publishedPosts: number;
        draftPosts: number;
        pendingPosts: number;
        rejectedPosts: number;
        totalBookmarks: number;
        totalComments: number;
        postsThisMonth: number;
        postsLastMonth: number;
        categories: CategoryStat[];
        recentPosts: RecentPost[];
    };
    overview: {
        totalPosts: number;
        totalUsers: number;
        totalCategories: number;
        postsThisMonth: number;
        postsLastMonth: number;
        postGrowthPercentage: number;
    };
}

interface AdminDashboardStats {
    overview: {
        totalPosts: number;
        totalUsers: number;
        totalCategories: number;
        postsThisMonth: number;
        postsLastMonth: number;
        postGrowthPercentage: number;
        totalBookmarks: number;
        totalComments: number;
        pendingPosts: number;
    };
    categoryStats: CategoryStat[];
    topPosts: RecentPost[];
    recentUsers: RecentUser[];
}

const columns: TableColumn<RecentPost>[] = [
    {
        name: "Title",
        selector: (row) => row.title,
        sortable: true,
        grow: 2,
    },
    {
        name: "Category",
        selector: (row) => row.categoryName,
        sortable: true,
    },
    {
        name: "Date",
        selector: (row) => new Date(row.createdAt).toLocaleDateString(),
        sortable: true,
    },
];


interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    change?: number;
    isLoading?: boolean;
    color?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
}

const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    gray: "bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400",
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, isLoading = false, color = "blue" }) => (
    <div className="w-full p-4 rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                {isLoading ? (
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-2"></div>
                ) : (
                    <div className="flex items-end gap-2 mt-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                        {change !== undefined && change !== 0 && (
                            <span className={`text-xs font-medium flex items-center ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {change > 0 ? <TrendingUpIcon fontSize="inherit" /> : <TrendingDownIcon fontSize="inherit" />}
                                {Math.abs(change)}%
                            </span>
                        )}
                    </div>
                )}
            </div>
            {icon && (
                <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
            )}
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    usePageTitle("Dashboard");
    const { theme, userData } = useSelector((state: RootState) => state.global);
    const isAdmin = userData?.role === 'admin';

    // Regular user dashboard stats
    const { data: userDashboardStats, isLoading: userLoading } = useQuery<UserDashboardStats>({
        queryKey: ["dashboard-stats", userData?.id],
        queryFn: async () => {
            if (!userData?.id) throw new Error("User not logged in");
            const response = await axiosInstance.get(`/analytics/dashboard/${userData.id}`);
            return response.data;
        },
        enabled: !!userData?.id && !isAdmin,
    });

    // Admin dashboard stats
    const { data: adminDashboardStats, isLoading: adminLoading } = useQuery<AdminDashboardStats>({
        queryKey: ["admin-dashboard-stats"],
        queryFn: async () => {
            const response = await axiosInstance.get(`/analytics/admin-dashboard`);
            return response.data;
        },
        enabled: isAdmin,
    });

    const isLoading = isAdmin ? adminLoading : userLoading;

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const userGrowth = userDashboardStats?.user?.postsLastMonth 
        ? Math.round(((userDashboardStats?.user?.postsThisMonth - userDashboardStats?.user?.postsLastMonth) / userDashboardStats?.user?.postsLastMonth) * 100)
        : userDashboardStats?.user?.postsThisMonth ? 100 : 0;

    return (
        <div className="flex h-screen overflow-hidden">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0">
                <Header />
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Welcome back, {userData?.name || userData?.username || 'User'}!
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                {isAdmin ? "Here's your site overview" : "Here's what's happening with your content"}
                            </p>
                        </div>
                        <Link 
                            to="/dashboard/create-post" 
                            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <ArticleIcon fontSize="small" />
                            New Post
                        </Link>
                    </div>

                    {isAdmin ? (
                        <>
                            {/* Admin Dashboard */}
                            {/* Main Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                                <StatCard 
                                    title="Total Posts" 
                                    value={formatNumber(adminDashboardStats?.overview?.totalPosts ?? 0)} 
                                    icon={<ArticleIcon />}
                                    color="blue"
                                    change={adminDashboardStats?.overview?.postGrowthPercentage}
                                    isLoading={isLoading}
                                />
                                <StatCard 
                                    title="Total Users" 
                                    value={formatNumber(adminDashboardStats?.overview?.totalUsers ?? 0)} 
                                    icon={<PeopleIcon />}
                                    color="green"
                                    isLoading={isLoading}
                                />
                                <StatCard 
                                    title="Categories" 
                                    value={formatNumber(adminDashboardStats?.overview?.totalCategories ?? 0)} 
                                    icon={<CategoryIcon />}
                                    color="purple"
                                    isLoading={isLoading}
                                />
                                <StatCard 
                                    title="Pending Approval" 
                                    value={formatNumber(adminDashboardStats?.overview?.pendingPosts ?? 0)} 
                                    icon={<PendingIcon />}
                                    color="yellow"
                                    isLoading={isLoading}
                                />
                                <StatCard 
                                    title="Total Bookmarks" 
                                    value={formatNumber(adminDashboardStats?.overview?.totalBookmarks ?? 0)} 
                                    icon={<BookmarkIcon />}
                                    color="purple"
                                    isLoading={isLoading}
                                />
                                <StatCard 
                                    title="Total Comments" 
                                    value={formatNumber(adminDashboardStats?.overview?.totalComments ?? 0)} 
                                    icon={<CommentIcon />}
                                    color="blue"
                                    isLoading={isLoading}
                                />
                            </div>

                            {/* Monthly Activity & Categories */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                {/* Monthly Activity */}
                                <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Site Activity</h3>
                                    {isLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Posts This Month</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {adminDashboardStats?.overview?.postsThisMonth ?? 0}
                                                    </span>
                                                    {(adminDashboardStats?.overview?.postGrowthPercentage ?? 0) !== 0 && (
                                                        <span className={`text-xs font-medium flex items-center ${(adminDashboardStats?.overview?.postGrowthPercentage ?? 0) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {(adminDashboardStats?.overview?.postGrowthPercentage ?? 0) > 0 ? <TrendingUpIcon fontSize="inherit" /> : <TrendingDownIcon fontSize="inherit" />}
                                                            {Math.abs(adminDashboardStats?.overview?.postGrowthPercentage ?? 0)}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Posts Last Month</span>
                                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {adminDashboardStats?.overview?.postsLastMonth ?? 0}
                                                </span>
                                            </div>
                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Categories</span>
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {adminDashboardStats?.overview?.totalCategories ?? 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Top Categories */}
                                <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Top Categories</h3>
                                    {isLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                                            ))}
                                        </div>
                                    ) : adminDashboardStats?.categoryStats?.length === 0 ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No categories yet</p>
                                    ) : (
                                        <ul className="space-y-3">
                                            {adminDashboardStats?.categoryStats?.slice(0, 4).map((cat) => (
                                                <li key={cat.id}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                                                        <span className="text-gray-500 dark:text-gray-400">{cat.postCount} posts</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                        <div 
                                                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                                                            style={{ width: `${cat.percentage}%` }}
                                                        />
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Quick Actions & Recent Users */}
                                <div className="space-y-4">
                                    <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Admin Actions</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link 
                                                to="/dashboard/admin/verify-post" 
                                                className="p-3 text-center bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-sm font-medium rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                                            >
                                                Verify Posts
                                            </Link>
                                            <Link 
                                                to="/dashboard/admin/users" 
                                                className="p-3 text-center bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                            >
                                                Manage Users
                                            </Link>
                                            <Link 
                                                to="/dashboard/categories" 
                                                className="p-3 text-center bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm font-medium rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                            >
                                                Categories
                                            </Link>
                                            <Link 
                                                to="/dashboard/analytics" 
                                                className="p-3 text-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                            >
                                                Analytics
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Recent Users */}
                                    <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Users</h3>
                                        {isLoading ? (
                                            <div className="space-y-2">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                                                ))}
                                            </div>
                                        ) : (
                                            <ul className="space-y-2">
                                                {adminDashboardStats?.recentUsers?.slice(0, 4).map((user) => (
                                                    <li key={user.id} className="flex items-center gap-2">
                                                        <img 
                                                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=random`}
                                                            alt={user.name || user.username}
                                                            className="w-7 h-7 rounded-full object-cover"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                {user.name || user.username}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                            {user.role}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Posts Table - All Users */}
                            <div className="rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Posts (All Users)</h2>
                                    <Link to="/dashboard/admin/verify-post" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                        Manage posts →
                                    </Link>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    {isLoading ? (
                                        <div className="p-4">
                                            <DataTableLoader text="Loading posts..." />
                                        </div>
                                    ) : (
                                        <DataTable 
                                            columns={columns} 
                                            data={adminDashboardStats?.topPosts ?? []} 
                                            pagination 
                                            theme={getDataTableTheme(theme)}
                                            noDataComponent={
                                                <div className="p-8 text-center">
                                                    <p className="text-gray-500 dark:text-gray-400">No posts found.</p>
                                                </div>
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Regular User Dashboard */}
                            {/* Main Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                                <StatCard 
                                    title="Total Posts" 
                                    value={formatNumber(userDashboardStats?.user?.totalPosts ?? 0)} 
                                    icon={<ArticleIcon />}
                                    color="blue"
                                    isLoading={isLoading}
                                />
                                <StatCard 
                                    title="Published" 
                                    value={formatNumber(userDashboardStats?.user?.publishedPosts ?? 0)} 
                                    icon={<PublishIcon />}
                                    color="green"
                                    isLoading={isLoading}
                                />
                                <StatCard 
                                    title="Drafts" 
                                    value={formatNumber(userDashboardStats?.user?.draftPosts ?? 0)} 
                                    icon={<DraftsIcon />}
                                    color="gray"
                                    isLoading={isLoading}
                                />
                                <StatCard 
                                    title="Pending Review" 
                                    value={formatNumber(userDashboardStats?.user?.pendingPosts ?? 0)} 
                                    icon={<PendingIcon />}
                                    color="yellow"
                                    isLoading={isLoading}
                                />
                                <StatCard 
                                    title="Bookmarks" 
                                    value={formatNumber(userDashboardStats?.user?.totalBookmarks ?? 0)} 
                                    icon={<BookmarkIcon />}
                                    color="purple"
                                    isLoading={isLoading}
                                />
                                <StatCard 
                                    title="Comments" 
                                    value={formatNumber(userDashboardStats?.user?.totalComments ?? 0)} 
                                    icon={<CommentIcon />}
                                    color="blue"
                                    isLoading={isLoading}
                                />
                            </div>

                            {/* Monthly Activity & Categories */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                {/* Monthly Activity */}
                                <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Your Activity</h3>
                                    {isLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Posts This Month</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {userDashboardStats?.user?.postsThisMonth ?? 0}
                                                    </span>
                                                    {userGrowth !== 0 && (
                                                        <span className={`text-xs font-medium flex items-center ${userGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {userGrowth > 0 ? <TrendingUpIcon fontSize="inherit" /> : <TrendingDownIcon fontSize="inherit" />}
                                                            {Math.abs(userGrowth)}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Posts Last Month</span>
                                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                    {userDashboardStats?.user?.postsLastMonth ?? 0}
                                                </span>
                                            </div>
                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Categories Used</span>
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {userDashboardStats?.user?.categories?.length ?? 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Your Categories */}
                                <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Your Top Categories</h3>
                                    {isLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                                            ))}
                                        </div>
                                    ) : userDashboardStats?.user?.categories?.length === 0 ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No posts in any category yet</p>
                                    ) : (
                                        <ul className="space-y-3">
                                            {userDashboardStats?.user?.categories?.slice(0, 4).map((cat) => (
                                                <li key={cat.id}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                                                        <span className="text-gray-500 dark:text-gray-400">{cat.postCount} posts</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                        <div 
                                                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                                                            style={{ width: `${cat.percentage}%` }}
                                                        />
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link 
                                            to="/dashboard/create-post" 
                                            className="p-3 text-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                        >
                                            New Post
                                        </Link>
                                        <Link 
                                            to="/dashboard/post-list" 
                                            className="p-3 text-center bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            My Posts
                                        </Link>
                                        <Link 
                                            to="/dashboard/bookmarks" 
                                            className="p-3 text-center bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm font-medium rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                        >
                                            Bookmarks
                                        </Link>
                                        <Link 
                                            to="/dashboard/analytics" 
                                            className="p-3 text-center bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                        >
                                            Analytics
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Posts Table */}
                            <div className="rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Recent Posts</h2>
                                    <Link to="/dashboard/post-list" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                        View all →
                                    </Link>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    {isLoading ? (
                                        <div className="p-4">
                                            <DataTableLoader text="Loading your posts..." />
                                        </div>
                                    ) : (
                                        <DataTable 
                                            columns={columns} 
                                            data={userDashboardStats?.user?.recentPosts ?? []} 
                                            pagination 
                                            theme={getDataTableTheme(theme)}
                                            noDataComponent={
                                                <div className="p-8 text-center">
                                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                        <ArticleIcon className="text-gray-400 dark:text-gray-500" fontSize="large" />
                                                    </div>
                                                    <p className="text-gray-500 dark:text-gray-400 mb-2">You haven't created any posts yet.</p>
                                                    <Link 
                                                        to="/dashboard/create-post" 
                                                        className="text-blue-500 hover:underline inline-block"
                                                    >
                                                        Create your first post
                                                    </Link>
                                                </div>
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
