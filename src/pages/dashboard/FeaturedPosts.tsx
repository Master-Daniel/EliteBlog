import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosConfig";
import { Feed } from "../../utils/types";
import toast from "react-hot-toast";

interface FeaturedData {
    featured: string[];
    success: boolean;
}

const FeaturedPosts: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    const { data: allPosts, isLoading: postsLoading } = useQuery({
        queryKey: ["all-published-posts"],
        queryFn: async () => {
            const response = await axiosInstance.get("/feed/fetch-all");
            const { feeds = [], featured = [] } = response.data;
            return [...featured, ...feeds] as Feed[];
        },
    });

    const { data: featuredIds = [], isLoading: featuredLoading } = useQuery({
        queryKey: ["featured-post-ids"],
        queryFn: async () => {
            const response = await axiosInstance.get("/feed/featured/list");
            return response.data as string[];
        },
    });

    const addFeaturedMutation = useMutation({
        mutationFn: async (postId: string) => {
            const response = await axiosInstance.post(`/feed/featured/add/${postId}`);
            return response.data as FeaturedData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["featured-post-ids"] });
            queryClient.invalidateQueries({ queryKey: ["feeds"] });
            toast.success("Post added to featured");
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || "Failed to add featured post");
        },
    });

    const removeFeaturedMutation = useMutation({
        mutationFn: async (postId: string) => {
            const response = await axiosInstance.delete(`/feed/featured/remove/${postId}`);
            return response.data as FeaturedData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["featured-post-ids"] });
            queryClient.invalidateQueries({ queryKey: ["feeds"] });
            toast.success("Post removed from featured");
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || "Failed to remove featured post");
        },
    });

    const featuredPosts = allPosts?.filter((post) => featuredIds.includes(post.id)) || [];
    const availablePosts = allPosts?.filter((post) => !featuredIds.includes(post.id)) || [];

    const filteredAvailablePosts = searchTerm
        ? availablePosts.filter((post) =>
            post.title?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : availablePosts;

    if (postsLoading || featuredLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 text-gray-900 dark:text-white">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Manage Featured Posts</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Select up to 3 posts to feature on the home page. The first post will be displayed as the main featured post.
                </p>
            </div>

            {/* Current Featured Posts */}
            <div className="mb-10">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-yellow-500">★</span>
                    Featured Posts ({featuredPosts.length}/3)
                </h2>
                {featuredPosts.length === 0 ? (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            No featured posts selected. Add posts from below.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {featuredPosts.map((post, index) => (
                            <div
                                key={post.id}
                                className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${index === 0
                                    ? "border-yellow-500"
                                    : "border-gray-200 dark:border-gray-700"
                                    } overflow-hidden shadow-sm`}
                            >
                                {index === 0 && (
                                    <div className="bg-yellow-500 text-black text-xs font-bold px-3 py-1">
                                        MAIN FEATURED
                                    </div>
                                )}
                                <div className="relative h-32">
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}/uploads/feeds/${post.featuredImage}`}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium text-sm line-clamp-2 mb-2">{post.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {post.category?.name}
                                        </span>
                                        <button
                                            onClick={() => removeFeaturedMutation.mutate(post.id)}
                                            disabled={removeFeaturedMutation.isPending}
                                            className="text-red-500 hover:text-red-600 text-sm font-medium cursor-pointer disabled:opacity-50"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available Posts */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <h2 className="text-lg font-semibold">Available Posts</h2>
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                    />
                </div>
                {filteredAvailablePosts.length === 0 ? (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchTerm ? "No posts match your search." : "No available posts."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredAvailablePosts.slice(0, 20).map((post) => (
                            <div
                                key={post.id}
                                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="relative h-28">
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}/uploads/feeds/${post.featuredImage}`}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-medium text-sm line-clamp-2 mb-2">{post.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {post.category?.name}
                                        </span>
                                        <button
                                            onClick={() => addFeaturedMutation.mutate(post.id)}
                                            disabled={featuredIds.length >= 3 || addFeaturedMutation.isPending}
                                            className="text-blue-500 hover:text-blue-600 text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {featuredIds.length >= 3 ? "Max reached" : "Add"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {filteredAvailablePosts.length > 20 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-4 text-sm">
                        Showing first 20 posts. Use search to find more.
                    </p>
                )}
            </div>
        </div>
    );
};

export default FeaturedPosts;
