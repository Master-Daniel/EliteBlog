import React from "react";
import Header from "../../components/Header";
import SideBar from "../../components/dashboard/SideBar";
import DataTable, { TableColumn } from "react-data-table-component";
import { getDataTableTheme } from "../../utils/dataTableThemes";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosConfig";
import DataTableLoader from "../../components/DataTableLoader";
import usePageTitle from "../../hooks/usePageTitle";


interface TopPost {
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

interface OverviewData {
    totalPosts: number;
    totalUsers: number;
    totalCategories: number;
    postsThisMonth: number;
    postsLastMonth: number;
    postGrowthPercentage: number;
}

const topPostsColumns: TableColumn<TopPost>[] = [
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
        name: "Author",
        selector: (row) => row.authorName,
        sortable: true,
    },
    {
        name: "Date",
        selector: (row) => new Date(row.createdAt).toLocaleDateString(),
        sortable: true,
    },
];

const StatCard: React.FC<{ title: string; value: string | number; change?: string; isPositive?: boolean; isLoading?: boolean }> = ({ 
    title, 
    value, 
    change, 
    isPositive = true,
    isLoading = false
}) => (
    <div className="w-full p-5 rounded-lg shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="flex items-end gap-2 mt-2">
            {isLoading ? (
                <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            ) : (
                <>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                    {change && (
                        <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? '↑' : '↓'} {change}
                        </span>
                    )}
                </>
            )}
        </div>
    </div>
);

const CategoryStatsCard: React.FC<{ categories: CategoryStat[]; isLoading: boolean }> = ({ categories, isLoading }) => (
    <div className="p-5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Posts by Category</h3>
        {isLoading ? (
            <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                ))}
            </div>
        ) : categories.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No categories found</p>
        ) : (
            <ul className="space-y-3">
                {categories.slice(0, 5).map((cat) => (
                    <li key={cat.id}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                            <span className="text-gray-500 dark:text-gray-400">{cat.postCount} posts ({cat.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${cat.percentage}%` }}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

interface UserAnalytics {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    categories: CategoryStat[];
    recentPosts: TopPost[];
}

const Analytics: React.FC = () => {
    usePageTitle("Analytics");
    const { theme, userData } = useSelector((state: RootState) => state.global);
    
    const isAdmin = userData?.role === 'admin';

    // Global analytics - only for admin
    const { data: overview, isLoading: overviewLoading } = useQuery<OverviewData>({
        queryKey: ["analytics-overview"],
        queryFn: async () => {
            const response = await axiosInstance.get("/analytics/overview");
            return response.data;
        },
        enabled: isAdmin,
    });

    // Global top posts - only for admin
    const { data: topPosts, isLoading: topPostsLoading } = useQuery<TopPost[]>({
        queryKey: ["analytics-top-posts"],
        queryFn: async () => {
            const response = await axiosInstance.get("/analytics/top-posts/10");
            return response.data;
        },
        enabled: isAdmin,
    });

    // Global category stats - only for admin
    const { data: categoryStats, isLoading: categoryStatsLoading } = useQuery<CategoryStat[]>({
        queryKey: ["analytics-categories"],
        queryFn: async () => {
            const response = await axiosInstance.get("/analytics/categories");
            return response.data;
        },
        enabled: isAdmin,
    });

    // User-specific analytics - for all users
    const { data: userAnalytics, isLoading: userAnalyticsLoading } = useQuery<UserAnalytics>({
        queryKey: ["analytics-user", userData?.id],
        queryFn: async () => {
            if (!userData?.id) return null;
            const response = await axiosInstance.get(`/analytics/user/${userData.id}`);
            return response.data;
        },
        enabled: !!userData?.id,
    });

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const userPostsColumns: TableColumn<TopPost>[] = [
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

    return (
        <div className="flex h-screen overflow-hidden">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0">
                <Header />
                <div className="flex-1 overflow-y-auto p-6">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                        {isAdmin ? 'Site Analytics' : 'My Analytics'}
                    </h1>
                    
                    {isAdmin ? (
                        <>
                            {/* Admin: Global Stats Overview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <StatCard 
                                    title="Total Posts" 
                                    value={overview?.totalPosts ?? 0} 
                                    isLoading={overviewLoading}
                                />
                                <StatCard 
                                    title="Total Users" 
                                    value={overview?.totalUsers ?? 0}
                                    isLoading={overviewLoading}
                                />
                                <StatCard 
                                    title="Total Categories" 
                                    value={overview?.totalCategories ?? 0}
                                    isLoading={overviewLoading}
                                />
                                <StatCard 
                                    title="Posts This Month" 
                                    value={overview?.postsThisMonth ?? 0}
                                    change={overview?.postGrowthPercentage ? `${Math.abs(overview.postGrowthPercentage)}%` : undefined}
                                    isPositive={(overview?.postGrowthPercentage ?? 0) >= 0}
                                    isLoading={overviewLoading}
                                />
                            </div>

                            {/* Admin: Category Stats & Monthly Summary */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <CategoryStatsCard 
                                    categories={categoryStats ?? []} 
                                    isLoading={categoryStatsLoading}
                                />
                                
                                <div className="p-5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Monthly Summary</h3>
                                    {overviewLoading ? (
                                        <div className="space-y-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                                            ))}
                                        </div>
                                    ) : (
                                        <ul className="space-y-2">
                                            <li className="flex justify-between text-sm">
                                                <span className="text-gray-700 dark:text-gray-300">Posts this month</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{overview?.postsThisMonth ?? 0}</span>
                                            </li>
                                            <li className="flex justify-between text-sm">
                                                <span className="text-gray-700 dark:text-gray-300">Posts last month</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{overview?.postsLastMonth ?? 0}</span>
                                            </li>
                                            <li className="flex justify-between text-sm">
                                                <span className="text-gray-700 dark:text-gray-300">Growth</span>
                                                <span className={`font-medium ${(overview?.postGrowthPercentage ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {(overview?.postGrowthPercentage ?? 0) >= 0 ? '+' : ''}{overview?.postGrowthPercentage ?? 0}%
                                                </span>
                                            </li>
                                            <li className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <span className="text-gray-700 dark:text-gray-300">Total posts</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{formatNumber(overview?.totalPosts ?? 0)}</span>
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Admin: All Recent Posts Table */}
                            <div className="rounded-lg w-full overflow-hidden">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Posts (All Users)</h2>
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    {topPostsLoading ? (
                                        <div className="p-4">
                                            <DataTableLoader text="Loading posts..." />
                                        </div>
                                    ) : (
                                        <DataTable 
                                            columns={topPostsColumns} 
                                            data={topPosts ?? []} 
                                            pagination
                                            theme={getDataTableTheme(theme)}
                                            noDataComponent={
                                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                    No posts found
                                                </div>
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Regular User: Personal Stats Overview */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <StatCard 
                                    title="Total Posts" 
                                    value={userAnalytics?.totalPosts ?? 0}
                                    isLoading={userAnalyticsLoading}
                                />
                                <StatCard 
                                    title="Published Posts" 
                                    value={userAnalytics?.publishedPosts ?? 0}
                                    isLoading={userAnalyticsLoading}
                                />
                                <StatCard 
                                    title="Draft Posts" 
                                    value={userAnalytics?.draftPosts ?? 0}
                                    isLoading={userAnalyticsLoading}
                                />
                            </div>

                            {/* Regular User: Personal Category Stats */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <CategoryStatsCard 
                                    categories={userAnalytics?.categories ?? []} 
                                    isLoading={userAnalyticsLoading}
                                />
                                
                                <div className="p-5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Your Summary</h3>
                                    {userAnalyticsLoading ? (
                                        <div className="space-y-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                                            ))}
                                        </div>
                                    ) : (
                                        <ul className="space-y-2">
                                            <li className="flex justify-between text-sm">
                                                <span className="text-gray-700 dark:text-gray-300">Total posts</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{userAnalytics?.totalPosts ?? 0}</span>
                                            </li>
                                            <li className="flex justify-between text-sm">
                                                <span className="text-gray-700 dark:text-gray-300">Published</span>
                                                <span className="text-green-500 font-medium">{userAnalytics?.publishedPosts ?? 0}</span>
                                            </li>
                                            <li className="flex justify-between text-sm">
                                                <span className="text-gray-700 dark:text-gray-300">Drafts</span>
                                                <span className="text-gray-500 font-medium">{userAnalytics?.draftPosts ?? 0}</span>
                                            </li>
                                            <li className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <span className="text-gray-700 dark:text-gray-300">Categories used</span>
                                                <span className="text-gray-900 dark:text-white font-medium">{userAnalytics?.categories?.length ?? 0}</span>
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Regular User: Personal Recent Posts Table */}
                            <div className="rounded-lg w-full overflow-hidden">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Your Recent Posts</h2>
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    {userAnalyticsLoading ? (
                                        <div className="p-4">
                                            <DataTableLoader text="Loading posts..." />
                                        </div>
                                    ) : (
                                        <DataTable 
                                            columns={userPostsColumns} 
                                            data={userAnalytics?.recentPosts ?? []} 
                                            pagination
                                            theme={getDataTableTheme(theme)}
                                            noDataComponent={
                                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                    You haven't created any posts yet
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

export default Analytics;
