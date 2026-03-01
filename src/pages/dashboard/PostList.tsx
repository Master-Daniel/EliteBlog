import React, { useState, useMemo } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { getDataTableTheme } from "../../utils/dataTableThemes";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import axiosInstance from "../../api/axiosConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import DataTableLoader from "../../components/DataTableLoader";
import usePageTitle from "../../hooks/usePageTitle";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


interface Post {
    id: string;
    title: string;
    slug: string;
    category: { id: string; name: string } | null;
    status: string;
    created_at: string;
    featuredImage?: string;
}

const PostListPage: React.FC = () => {
    usePageTitle("My Posts");
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { userData, theme } = useSelector((state: RootState) => state.global);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [deletingPost, setDeletingPost] = useState<Post | null>(null);

    const { data: feeds = [], isLoading } = useQuery<Post[]>({
        queryKey: ["feeds", userData?.id],
        queryFn: async () => {
            const response = await axiosInstance.get(`/feed/fetch-all/${userData?.id}`);
            return response.data;
        },
        enabled: !!userData?.id,
    });

    const deleteMutation = useMutation({
        mutationFn: async (postId: string) => {
            await axiosInstance.delete(`/feed/delete/${postId}/${userData?.id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feeds"] });
            setDeletingPost(null);
            toast.success("Post deleted successfully");
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message || "Failed to delete post");
            setDeletingPost(null);
        },
    });

    const filteredPosts = useMemo(() => {
        return feeds.filter((post) => {
            const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || post.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [feeds, searchTerm, statusFilter]);

    const getStatusBadge = (status: string) => {
        const statusStyles: Record<string, string> = {
            published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
            under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };
        
        const displayStatus = status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.draft}`}>
                {displayStatus}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const columns: TableColumn<Post>[] = [
        {
            name: "Title",
            selector: (row) => row.title,
            sortable: true,
            grow: 2,
            cell: (row) => (
                <div className="py-2">
                    <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{row.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">/{row.slug}</p>
                </div>
            ),
        },
        {
            name: "Category",
            selector: (row) => row.category?.name || "Uncategorized",
            sortable: true,
            cell: (row) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {row.category?.name || "Uncategorized"}
                </span>
            ),
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => getStatusBadge(row.status),
        },
        {
            name: "Date",
            selector: (row) => row.created_at,
            sortable: true,
            cell: (row) => (
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                    {formatDate(row.created_at)}
                </span>
            ),
        },
        {
            name: "Actions",
            width: "150px",
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <Link
                        to={`/dashboard/preview/${row.id}`}
                        className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Preview Post"
                    >
                        <VisibilityIcon fontSize="small" />
                    </Link>
                    <button
                        onClick={() => navigate(`/dashboard/edit-post/${row.id}`)}
                        className="cursor-pointer p-1.5 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Edit Post"
                    >
                        <EditIcon fontSize="small" />
                    </button>
                    <button
                        onClick={() => setDeletingPost(row)}
                        className="cursor-pointer p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Delete Post"
                    >
                        <DeleteIcon fontSize="small" />
                    </button>
                </div>
            ),
        },
    ];

    const statusOptions = [
        { value: "all", label: "All Status" },
        { value: "published", label: "Published" },
        { value: "draft", label: "Draft" },
        { value: "under_review", label: "Under Review" },
        { value: "pending", label: "Pending" },
        { value: "rejected", label: "Rejected" },
    ];

    return (
        <div className="flex h-screen overflow-hidden">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0">
                <Header />
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Posts</h1>
                        <Link
                            to="/dashboard/create-post"
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            + New Post
                        </Link>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" fontSize="small" />
                            <input
                                type="text"
                                placeholder="Search posts by title or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            title="Filter posts by status"
                            aria-label="Filter posts by status"
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{feeds.length}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Posts</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {feeds.filter(p => p.status === "published").length}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                {feeds.filter(p => p.status === "draft").length}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {feeds.filter(p => p.status === "under_review" || p.status === "pending").length}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        {isLoading ? (
                            <DataTableLoader text="Loading posts..." />
                        ) : filteredPosts.length === 0 ? (
                            <div className="p-8 text-center bg-white dark:bg-gray-800">
                                {feeds.length === 0 ? (
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't created any posts yet.</p>
                                        <Link
                                            to="/dashboard/create-post"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Create Your First Post
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">No posts match your search criteria.</p>
                                )}
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={filteredPosts}
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

            {/* Delete Confirmation Modal */}
            {deletingPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <DeleteIcon className="text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Post</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                            </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            Are you sure you want to delete <strong className="text-gray-900 dark:text-white">"{deletingPost.title}"</strong>? 
                            This will permanently remove the post and all associated data.
                        </p>
                        
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingPost(null)}
                                className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => deleteMutation.mutate(deletingPost.id)}
                                disabled={deleteMutation.isPending}
                                className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {deleteMutation.isPending ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostListPage;
