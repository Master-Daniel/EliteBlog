import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";
import axiosInstance from "../../api/axiosConfig";
import usePageTitle from "../../hooks/usePageTitle";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface BookmarkedFeed {
    id: string;
    title: string;
    slug: string;
    description: string;
    featuredImage?: string;
    status: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
        username: string;
        avatarUrl: string;
    } | null;
    category: {
        id: string;
        name: string;
    } | null;
}

interface Bookmark {
    id: string;
    createdAt: string;
    feed: BookmarkedFeed;
}

const BookmarksPage: React.FC = () => {
    usePageTitle("Bookmarks");
    const queryClient = useQueryClient();
    const [removingId, setRemovingId] = useState<string | null>(null);

    const { data, isLoading, error } = useQuery<{ bookmarks: Bookmark[] }>({
        queryKey: ["bookmarks"],
        queryFn: async () => {
            const response = await axiosInstance.get("/bookmarks");
            return response.data;
        },
    });

    const removeMutation = useMutation({
        mutationFn: async (feedId: string) => {
            await axiosInstance.delete(`/bookmarks/${feedId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
            setRemovingId(null);
            toast.success("Bookmark removed");
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message || "Failed to remove bookmark");
            setRemovingId(null);
        },
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const bookmarks = data?.bookmarks || [];

    return (
        <div className="flex h-screen overflow-hidden">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0">
                <Header />
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <BookmarkIcon className="text-blue-600 dark:text-blue-400" fontSize="large" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookmarks</h1>
                    </div>

                    {isLoading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
                                    <div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="p-4">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-12">
                            <p className="text-red-500 dark:text-red-400">Failed to load bookmarks. Please try again.</p>
                        </div>
                    )}

                    {!isLoading && !error && bookmarks.length === 0 && (
                        <div className="text-center py-16">
                            <BookmarkBorderIcon className="text-gray-300 dark:text-gray-600 mb-4" style={{ fontSize: 80 }} />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No bookmarks yet</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Save posts you want to read later by clicking the bookmark icon.
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse Posts
                            </Link>
                        </div>
                    )}

                    {!isLoading && !error && bookmarks.length > 0 && (
                        <>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                {bookmarks.length} saved {bookmarks.length === 1 ? "post" : "posts"}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bookmarks.map((bookmark) => (
                                    <article
                                        key={bookmark.id}
                                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow group"
                                    >
                                        {bookmark.feed.featuredImage && (
                                            <Link to={`/feed/${bookmark.feed.slug}`}>
                                                <div className="relative h-40 overflow-hidden">
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL}/uploads/feeds/${bookmark.feed.featuredImage}`}
                                                        alt={bookmark.feed.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    {bookmark.feed.category && (
                                                        <span className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                                            {bookmark.feed.category.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        )}
                                        <div className="p-4">
                                            <Link to={`/feed/${bookmark.feed.slug}`}>
                                                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
                                                    {bookmark.feed.title}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                                {bookmark.feed.description}
                                            </p>
                                            
                                            {bookmark.feed.author && (
                                                <div className="flex items-center gap-2 mb-3">
                                                    <img
                                                        src={bookmark.feed.author.avatarUrl || `https://ui-avatars.com/api/?name=${bookmark.feed.author.name}&size=32`}
                                                        alt={bookmark.feed.author.name}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {bookmark.feed.author.name}
                                                    </span>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDate(bookmark.feed.createdAt)}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    Saved {formatDate(bookmark.createdAt)}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        to={`/feed/${bookmark.feed.slug}`}
                                                        className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                                        title="Read post"
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setRemovingId(bookmark.feed.id)}
                                                        className="cursor-pointer p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                                        title="Remove bookmark"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Remove Confirmation Modal */}
            {removingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                                <BookmarkBorderIcon className="text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Remove Bookmark?</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                This post will be removed from your saved items.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setRemovingId(null)}
                                    className="cursor-pointer flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => removeMutation.mutate(removingId)}
                                    disabled={removeMutation.isPending}
                                    className="cursor-pointer flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {removeMutation.isPending ? "Removing..." : "Remove"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookmarksPage;
