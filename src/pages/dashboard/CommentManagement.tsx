import React, { useState, useMemo } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { getDataTableTheme } from "../../utils/dataTableThemes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import usePageTitle from "../../hooks/usePageTitle";
import axiosInstance from "../../api/axiosConfig";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Link } from "react-router-dom";
import DataTableLoader from "../../components/DataTableLoader";


interface Comment {
    id: string;
    authorName: string;
    authorEmail: string;
    content: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    feed: {
        id: string;
        title: string;
        slug: string;
    };
    user?: {
        id: string;
        name: string;
        username: string;
        avatarUrl: string;
    };
}

const CommentManagementPage: React.FC = () => {
    usePageTitle("Comments");
    const queryClient = useQueryClient();
    const { theme } = useSelector((state: RootState) => state.global);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [deletingComment, setDeletingComment] = useState<Comment | null>(null);
    const [viewingComment, setViewingComment] = useState<Comment | null>(null);

    const { data, isLoading } = useQuery<{ comments: Comment[] }>({
        queryKey: ["comments-management"],
        queryFn: async () => {
            const response = await axiosInstance.get("/comments/all");
            return response.data;
        },
    });

    const { data: pendingCountData } = useQuery<{ count: number }>({
        queryKey: ["pending-comments-count"],
        queryFn: async () => {
            const response = await axiosInstance.get("/comments/pending/count");
            return response.data;
        },
    });

    const approveMutation = useMutation({
        mutationFn: async (commentId: string) => {
            await axiosInstance.patch(`/comments/${commentId}/approve`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments-management"] });
            queryClient.invalidateQueries({ queryKey: ["pending-comments-count"] });
            toast.success("Comment approved");
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message || "Failed to approve comment");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async (commentId: string) => {
            await axiosInstance.patch(`/comments/${commentId}/reject`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments-management"] });
            queryClient.invalidateQueries({ queryKey: ["pending-comments-count"] });
            toast.success("Comment rejected");
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message || "Failed to reject comment");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (commentId: string) => {
            await axiosInstance.delete(`/comments/${commentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments-management"] });
            queryClient.invalidateQueries({ queryKey: ["pending-comments-count"] });
            setDeletingComment(null);
            toast.success("Comment deleted");
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message || "Failed to delete comment");
            setDeletingComment(null);
        },
    });

    const comments = data?.comments || [];

    const filteredComments = useMemo(() => {
        return comments.filter((comment) => {
            const matchesSearch =
                comment.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                comment.feed.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || comment.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [comments, searchTerm, statusFilter]);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };

        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || styles.pending}`}>
                {status}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const columns: TableColumn<Comment>[] = [
        {
            name: "Author",
            grow: 1,
            cell: (row) => (
                <div className="py-2">
                    <p className="font-medium text-gray-900 dark:text-white">{row.authorName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{row.authorEmail}</p>
                </div>
            ),
            sortable: true,
            selector: (row) => row.authorName,
        },
        {
            name: "Comment",
            grow: 2,
            cell: (row) => (
                <div className="py-2">
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{row.content}</p>
                    <Link
                        to={`/feed/${row.feed.slug}`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                    >
                        On: {row.feed.title}
                    </Link>
                </div>
            ),
        },
        {
            name: "Status",
            width: "120px",
            cell: (row) => getStatusBadge(row.status),
            sortable: true,
            selector: (row) => row.status,
        },
        {
            name: "Date",
            width: "150px",
            cell: (row) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(row.createdAt)}
                </span>
            ),
            sortable: true,
            selector: (row) => row.createdAt,
        },
        {
            name: "Actions",
            width: "180px",
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setViewingComment(row)}
                        className="cursor-pointer p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="View comment"
                    >
                        <VisibilityIcon fontSize="small" />
                    </button>
                    {row.status === "pending" && (
                        <>
                            <button
                                onClick={() => approveMutation.mutate(row.id)}
                                disabled={approveMutation.isPending}
                                className="cursor-pointer p-1.5 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                                title="Approve comment"
                            >
                                <CheckIcon fontSize="small" />
                            </button>
                            <button
                                onClick={() => rejectMutation.mutate(row.id)}
                                disabled={rejectMutation.isPending}
                                className="cursor-pointer p-1.5 text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                                title="Reject comment"
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setDeletingComment(row)}
                        className="cursor-pointer p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Delete comment"
                    >
                        <DeleteIcon fontSize="small" />
                    </button>
                </div>
            ),
        },
    ];

    const statusOptions = [
        { value: "all", label: "All Status" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
    ];

    return (
        <div className="flex h-screen overflow-hidden">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0">
                <Header />
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Comment Management</h1>
                            {pendingCountData && pendingCountData.count > 0 && (
                                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                                    {pendingCountData.count} comment{pendingCountData.count !== 1 ? "s" : ""} awaiting approval
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{comments.length}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Comments</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {comments.filter((c) => c.status === "pending").length}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {comments.filter((c) => c.status === "approved").length}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {comments.filter((c) => c.status === "rejected").length}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" fontSize="small" />
                            <input
                                type="text"
                                placeholder="Search by author, content, or post..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            title="Filter by status"
                            aria-label="Filter by status"
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Data Table */}
                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        {isLoading ? (
                            <DataTableLoader text="Loading comments..." />
                        ) : filteredComments.length === 0 ? (
                            <div className="p-8 text-center bg-white dark:bg-gray-800">
                                {comments.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400">No comments yet on your posts.</p>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">No comments match your search criteria.</p>
                                )}
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={filteredComments}
                                pagination
                                highlightOnHover
                                responsive
                                theme={getDataTableTheme(theme)}
                                customStyles={{
                                    headCells: {
                                        style: {
                                            fontWeight: '600',
                                            fontSize: '14px',
                                        },
                                    },
                                    cells: {
                                        style: {
                                            fontSize: '14px',
                                        },
                                    },
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* View Comment Modal */}
            {viewingComment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comment Details</h3>
                            <button
                                onClick={() => setViewingComment(null)}
                                className="cursor-pointer p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title="Close"
                                aria-label="Close modal"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Author</p>
                                <p className="font-medium text-gray-900 dark:text-white">{viewingComment.authorName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{viewingComment.authorEmail}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">On Post</p>
                                <Link
                                    to={`/feed/${viewingComment.feed.slug}`}
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {viewingComment.feed.title}
                                </Link>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Comment</p>
                                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{viewingComment.content}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                    {getStatusBadge(viewingComment.status)}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                                    <p className="text-gray-900 dark:text-white">{formatDate(viewingComment.createdAt)}</p>
                                </div>
                            </div>
                        </div>

                        {viewingComment.status === "pending" && (
                            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => {
                                        approveMutation.mutate(viewingComment.id);
                                        setViewingComment(null);
                                    }}
                                    className="cursor-pointer flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => {
                                        rejectMutation.mutate(viewingComment.id);
                                        setViewingComment(null);
                                    }}
                                    className="cursor-pointer flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingComment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                                <DeleteIcon className="text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Comment?</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                This will permanently delete the comment by <strong>{deletingComment.authorName}</strong>.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingComment(null)}
                                    className="cursor-pointer flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate(deletingComment.id)}
                                    disabled={deleteMutation.isPending}
                                    className="cursor-pointer flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentManagementPage;
