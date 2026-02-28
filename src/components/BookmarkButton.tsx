import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosConfig";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import toast from "react-hot-toast";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

interface BookmarkButtonProps {
    feedId: string;
    showCount?: boolean;
    className?: string;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ feedId, showCount = false, className = "" }) => {
    const queryClient = useQueryClient();
    const { isLoggedIn } = useSelector((state: RootState) => state.global);

    const { data: bookmarkStatus } = useQuery<{ isBookmarked: boolean }>({
        queryKey: ["bookmark-status", feedId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/bookmarks/check/${feedId}`);
            return response.data;
        },
        enabled: isLoggedIn,
    });

    const { data: countData } = useQuery<{ count: number }>({
        queryKey: ["bookmark-count", feedId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/bookmarks/count/${feedId}`);
            return response.data;
        },
        enabled: showCount,
    });

    const addBookmarkMutation = useMutation({
        mutationFn: async () => {
            await axiosInstance.post(`/bookmarks/${feedId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookmark-status", feedId] });
            queryClient.invalidateQueries({ queryKey: ["bookmark-count", feedId] });
            queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
            toast.success("Post saved to bookmarks");
        },
        onError: (error: { message?: string }) => {
            if (error.message?.includes("already bookmarked")) {
                toast.error("Already bookmarked");
            } else {
                toast.error(error.message || "Failed to bookmark");
            }
        },
    });

    const removeBookmarkMutation = useMutation({
        mutationFn: async () => {
            await axiosInstance.delete(`/bookmarks/${feedId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookmark-status", feedId] });
            queryClient.invalidateQueries({ queryKey: ["bookmark-count", feedId] });
            queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
            toast.success("Bookmark removed");
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message || "Failed to remove bookmark");
        },
    });

    const handleClick = () => {
        if (!isLoggedIn) {
            toast.error("Please sign in to bookmark posts");
            return;
        }

        if (bookmarkStatus?.isBookmarked) {
            removeBookmarkMutation.mutate();
        } else {
            addBookmarkMutation.mutate();
        }
    };

    const isLoading = addBookmarkMutation.isPending || removeBookmarkMutation.isPending;
    const isBookmarked = bookmarkStatus?.isBookmarked;

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                isBookmarked
                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            } ${className}`}
            title={isBookmarked ? "Remove bookmark" : "Save to bookmarks"}
        >
            {isBookmarked ? (
                <BookmarkIcon fontSize="small" />
            ) : (
                <BookmarkBorderIcon fontSize="small" />
            )}
            {showCount && countData && (
                <span className="text-sm font-medium">{countData.count}</span>
            )}
            {!showCount && (
                <span className="text-sm font-medium">
                    {isBookmarked ? "Saved" : "Save"}
                </span>
            )}
        </button>
    );
};

export default BookmarkButton;
