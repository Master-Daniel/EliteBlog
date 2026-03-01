import React, { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosConfig";
import Header from "../../components/Header";
import SideBar from "../../components/dashboard/SideBar";
import { formatDate } from "../../utils/custom-functions";
import { calculateReadingTime, stripHtml } from "../../utils/seo";
import usePageTitle from "../../hooks/usePageTitle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface PostData {
    id: string;
    title: string;
    description: string;
    slug: string;
    content: string;
    featuredImage?: string;
    status: string;
    tags: string[];
    created_at: string;
    updated_at: string;
    category?: { id: string; name: string };
    author?: { id: string; name: string; username: string; avatarUrl?: string };
}

const PreviewPost: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    usePageTitle("Preview Post");

    const { data: post, isLoading, error } = useQuery<PostData>({
        queryKey: ["preview-post", id],
        queryFn: async () => {
            const response = await axiosInstance.get(`/feed/edit/${id}`);
            return response.data;
        },
        enabled: !!id,
    });

    const readingTime = useMemo(() => {
        if (post?.content) {
            return calculateReadingTime(stripHtml(post.content));
        }
        return 4;
    }, [post?.content]);

    const statusColors: Record<string, string> = {
        published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    if (isLoading) {
        return (
            <div className="flex h-screen overflow-hidden bg-white dark:bg-black">
                <SideBar />
                <div className="flex flex-col flex-1 min-h-0 bg-gray-50 dark:bg-black">
                    <Header />
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="max-w-4xl mx-auto animate-pulse">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex h-screen overflow-hidden bg-white dark:bg-black">
                <SideBar />
                <div className="flex flex-col flex-1 min-h-0 bg-gray-50 dark:bg-black">
                    <Header />
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Post Not Found
                            </h1>
                            <button
                                onClick={() => navigate("/dashboard/post-list")}
                                className="text-blue-600 hover:underline"
                            >
                                Back to Post List
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-black">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0 bg-gray-50 dark:bg-black">
                <Header />
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => navigate("/dashboard/post-list")}
                                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                            >
                                <ArrowBackIcon fontSize="small" />
                                Back to Posts
                            </button>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[post.status] || statusColors.draft}`}>
                                    {post.status.replace("_", " ").toUpperCase()}
                                </span>
                                <Link
                                    to={`/dashboard/edit-post/${post.id}`}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    Edit Post
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            {post.featuredImage && (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/uploads/feeds/${post.featuredImage}`}
                                    alt={post.title}
                                    className="w-full h-64 md:h-96 object-cover"
                                />
                            )}

                            <div className="p-6 md:p-10">
                                <div className="flex flex-wrap gap-3 items-center text-sm mb-4">
                                    {post.category && (
                                        <span className="text-xs font-medium uppercase rounded-full py-1.5 px-2.5 border border-blue-500 text-blue-500">
                                            {post.category.name}
                                        </span>
                                    )}
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {formatDate(post.created_at)}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {readingTime} min read
                                    </span>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    {post.title}
                                </h1>

                                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                                    {post.description}
                                </p>

                                {post.author && (
                                    <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                                        <img
                                            src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name || post.author.username)}&background=random`}
                                            alt={post.author.name || post.author.username}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {post.author.name || post.author.username}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                @{post.author.username}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div
                                    className="prose prose-lg dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />

                                {post.tags && post.tags.length > 0 && (
                                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                            Tags
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {post.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewPost;
