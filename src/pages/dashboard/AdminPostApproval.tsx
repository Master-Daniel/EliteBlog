import React, { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { getDataTableTheme } from "../../utils/dataTableThemes";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import axiosInstance from "../../api/axiosConfig";
import DataTableLoader from "../../components/DataTableLoader";
import toast from "react-hot-toast";
import usePageTitle from "../../hooks/usePageTitle";
import { sanitizeHtml } from "../../utils/sanitizeHtml";


interface Author {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
    email: string;
}

interface Category {
    id: string;
    name: string;
}

interface Post {
    id: string;
    title: string;
    slug: string;
    description: string;
    content: string;
    keywords: string[];
    tags: string[];
    featuredImage: string;
    status: string;
    author: Author | null;
    category: Category | null;
    created_at: string;
}

const AdminPostApprovalPage: React.FC = () => {
    usePageTitle("Post Approval");
    const { theme, userData } = useSelector((state: RootState) => state.global);
    const queryClient = useQueryClient();
    
    const [previewPost, setPreviewPost] = useState<Post | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectingPost, setRejectingPost] = useState<Post | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const { data: postsData, isLoading } = useQuery<{ posts: Post[] }>({
        queryKey: ["pending-posts"],
        queryFn: async () => {
            const response = await axiosInstance.get("/admin/posts/pending");
            return response.data;
        },
    });

    const approveMutation = useMutation({
        mutationFn: async (postId: string) => {
            const response = await axiosInstance.post("/admin/posts/approve", { postId });
            return response.data;
        },
        onSuccess: () => {
            toast.success("Post approved successfully! Author has been notified.");
            queryClient.invalidateQueries({ queryKey: ["pending-posts"] });
            setShowPreviewModal(false);
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message || "Failed to approve post");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ postId, reason }: { postId: string; reason: string }) => {
            const response = await axiosInstance.post("/admin/posts/reject", { postId, reason });
            return response.data;
        },
        onSuccess: () => {
            toast.success("Post rejected. Author has been notified with the reason.");
            queryClient.invalidateQueries({ queryKey: ["pending-posts"] });
            setShowRejectModal(false);
            setRejectingPost(null);
            setRejectReason("");
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message || "Failed to reject post");
        },
    });

    const handlePreview = (post: Post) => {
        setPreviewPost(post);
        setShowPreviewModal(true);
    };

    const handleApprove = (postId: string) => {
        approveMutation.mutate(postId);
    };

    const handleOpenRejectModal = (post: Post) => {
        setRejectingPost(post);
        setRejectReason("");
        setShowRejectModal(true);
    };

    const handleReject = () => {
        if (!rejectingPost) return;
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        rejectMutation.mutate({ postId: rejectingPost.id, reason: rejectReason });
    };

    const posts = postsData?.posts ?? [];

    const columns: TableColumn<Post>[] = [
        {
            name: "Title",
            cell: (row) => (
                <div className="py-2">
                    <p className="font-medium text-gray-900 dark:text-white">{row.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{row.description}</p>
                </div>
            ),
            grow: 2,
        },
        {
            name: "Author",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    {row.author?.avatarUrl && (
                        <img src={row.author.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">{row.author?.name || row.author?.username || "Unknown"}</span>
                </div>
            ),
            sortable: true,
        },
        {
            name: "Category",
            selector: (row) => row.category?.name || "Uncategorized",
            sortable: true,
        },
        {
            name: "Date",
            cell: (row) => (
                <span className="text-gray-600 dark:text-gray-400">
                    {new Date(row.created_at).toLocaleDateString()}
                </span>
            ),
            sortable: true,
        },
        {
            name: "Status",
            cell: (row) => (
                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
            ),
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="flex space-x-2">
                    <button 
                        onClick={() => handlePreview(row)} 
                        className="cursor-pointer p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Preview"
                    >
                        <VisibilityIcon />
                    </button>
                    <button 
                        onClick={() => handleApprove(row.id)} 
                        disabled={approveMutation.isPending}
                        className="cursor-pointer p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                        title="Approve"
                    >
                        <CheckCircleIcon />
                    </button>
                    <button 
                        onClick={() => handleOpenRejectModal(row)} 
                        className="cursor-pointer p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Reject"
                    >
                        <CancelIcon />
                    </button>
                </div>
            ),
        },
    ];

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
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Post Approval</h1>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {isLoading ? (
                            <div className="p-4">
                                <DataTableLoader text="Loading pending posts..." />
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={posts}
                                pagination
                                highlightOnHover
                                responsive
                                theme={getDataTableTheme(theme)}
                                noDataComponent={
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No pending posts to review
                                    </div>
                                }
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreviewModal && previewPost && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Preview Post</h2>
                            <button 
                                onClick={() => setShowPreviewModal(false)}
                                className="cursor-pointer p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                title="Close preview"
                                aria-label="Close preview"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Featured Image */}
                            {previewPost.featuredImage && (
                                <img 
                                    src={`${import.meta.env.VITE_API_URL}/uploads/feeds/${previewPost.featuredImage}`}
                                    alt={previewPost.title}
                                    className="w-full h-64 object-cover rounded-lg mb-6"
                                />
                            )}

                            {/* Title */}
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                {previewPost.title}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    {previewPost.author?.avatarUrl && (
                                        <img src={previewPost.author.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                                    )}
                                    <span>{previewPost.author?.name || previewPost.author?.username}</span>
                                </div>
                                <span>•</span>
                                <span>{previewPost.category?.name || "Uncategorized"}</span>
                                <span>•</span>
                                <span>{new Date(previewPost.created_at).toLocaleDateString()}</span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                                {previewPost.description}
                            </p>

                            {/* Tags/Keywords */}
                            {previewPost.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {previewPost.tags.map((tag, index) => (
                                        <span 
                                            key={index}
                                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Content */}
                            <div 
                                className="prose dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(previewPost.content) }}
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleOpenRejectModal(previewPost)}
                                className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleApprove(previewPost.id)}
                                disabled={approveMutation.isPending}
                                className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {approveMutation.isPending ? "Approving..." : "Approve"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && rejectingPost && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reject Post</h2>
                            <button 
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectingPost(null);
                                    setRejectReason("");
                                }}
                                className="cursor-pointer p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                title="Close"
                                aria-label="Close reject modal"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                You are about to reject <strong className="text-gray-900 dark:text-white">"{rejectingPost.title}"</strong> by {rejectingPost.author?.name || rejectingPost.author?.username}.
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                The author will receive an email with your feedback. Please provide a clear reason for rejection:
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter the reason for rejection (e.g., inappropriate content, needs more details, formatting issues, etc.)"
                                rows={5}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectingPost(null);
                                    setRejectReason("");
                                }}
                                className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={rejectMutation.isPending || !rejectReason.trim()}
                                className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {rejectMutation.isPending ? "Rejecting..." : "Reject Post"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPostApprovalPage;
