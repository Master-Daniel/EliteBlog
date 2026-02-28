import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axiosInstance from "../api/axiosConfig";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import PersonIcon from "@mui/icons-material/Person";
import ReplyIcon from "@mui/icons-material/Reply";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

interface Comment {
    id: string;
    content: string;
    authorName: string;
    authorWebsite?: string;
    createdAt: string;
    user?: {
        id: string;
        name: string;
        username: string;
        avatarUrl: string;
    };
    replyCount?: number;
    parentCommentId?: string | null;
}

interface CommentFormValues {
    authorName: string;
    authorEmail: string;
    authorWebsite: string;
    content: string;
}

interface CommentsProps {
    feedId: string;
    feedTitle: string;
}

interface CommentsResponse {
    comments: Comment[];
    total: number;
    hasMore: boolean;
    page: number;
}

interface RepliesResponse {
    replies: Comment[];
    total: number;
    hasMore: boolean;
    page: number;
}

const validationSchema = Yup.object({
    authorName: Yup.string()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters"),
    authorEmail: Yup.string()
        .email("Please enter a valid email")
        .required("Email is required"),
    authorWebsite: Yup.string().url("Please enter a valid URL"),
    content: Yup.string()
        .required("Comment is required")
        .min(3, "Comment must be at least 3 characters")
        .max(2000, "Comment is too long"),
});

const Comments: React.FC<CommentsProps> = ({ feedId }) => {
    const queryClient = useQueryClient();
    const { userData, isLoggedIn } = useSelector((state: RootState) => state.global);
    const [showForm, setShowForm] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

    const {
        data: commentsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery<CommentsResponse>({
        queryKey: ["comments", feedId],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await axiosInstance.get(`/comments/feed/${feedId}?page=${pageParam}&limit=10`);
            return response.data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.hasMore) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        enabled: !!feedId,
    });

    const { data: countData } = useQuery<{ count: number }>({
        queryKey: ["comment-count", feedId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/comments/feed/${feedId}/count`);
            return response.data;
        },
        enabled: !!feedId,
    });

    const submitMutation = useMutation({
        mutationFn: async (values: CommentFormValues & { parentCommentId?: string }) => {
            const response = await axiosInstance.post("/comments", {
                ...values,
                feedId,
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", feedId] });
            queryClient.invalidateQueries({ queryKey: ["comment-count", feedId] });
            queryClient.invalidateQueries({ queryKey: ["replies"] });
            toast.success("Comment submitted! It will appear after approval.");
            setShowForm(false);
            setReplyingTo(null);
        },
        onError: (error: any) => {
            const errorData = error.response?.data;
            if (errorData?.message) {
                if (Array.isArray(errorData.message)) {
                    errorData.message.forEach((msg: string) => toast.error(msg));
                } else {
                    toast.error(errorData.message);
                }
            } else {
                toast.error(error.message || "Failed to submit comment");
            }
        },
    });

    const allComments = commentsData?.pages.flatMap((page) => page.comments) || [];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const toggleThread = (commentId: string) => {
        setExpandedThreads((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId);
            } else {
                newSet.add(commentId);
            }
            return newSet;
        });
    };

    const handleReply = (comment: Comment) => {
        setReplyingTo(comment);
        setShowForm(true);
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setShowForm(false);
    };

    const initialValues: CommentFormValues = {
        authorName: isLoggedIn ? (userData?.name || userData?.username || "") : "",
        authorEmail: isLoggedIn ? (userData?.email || "") : "",
        authorWebsite: "",
        content: "",
    };

    const InlineReplyForm = ({ parentComment, onCancel }: { parentComment: Comment; onCancel: () => void }) => (
        <div className="mt-3 ml-12 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Replying to</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">@{parentComment.authorName}</span>
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { resetForm }) => {
                    submitMutation.mutate(
                        {
                            ...values,
                            parentCommentId: parentComment.id,
                        },
                        {
                            onSuccess: () => {
                                resetForm();
                                onCancel();
                            },
                        }
                    );
                }}
            >
                {() => (
                    <Form className="space-y-3">
                        {!isLoggedIn && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Field
                                        type="text"
                                        name="authorName"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Your name *"
                                    />
                                    <ErrorMessage name="authorName" component="p" className="text-red-500 text-xs mt-1" />
                                </div>
                                <div>
                                    <Field
                                        type="email"
                                        name="authorEmail"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Email *"
                                    />
                                    <ErrorMessage name="authorEmail" component="p" className="text-red-500 text-xs mt-1" />
                                </div>
                            </div>
                        )}

                        <div>
                            <Field
                                as="textarea"
                                name="content"
                                rows={2}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Write your reply..."
                            />
                            <ErrorMessage name="content" component="p" className="text-red-500 text-xs mt-1" />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="cursor-pointer px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitMutation.isPending}
                                className="cursor-pointer px-4 py-1.5 text-sm bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitMutation.isPending ? "Posting..." : "Reply"}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );

    const CommentForm = () => (
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Leave a Comment
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Your email will not be published. Comments are moderated.
            </p>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { resetForm }) => {
                    submitMutation.mutate(values, {
                        onSuccess: () => resetForm(),
                    });
                }}
            >
                {() => (
                    <Form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="authorName" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                                    Name *
                                </label>
                                <Field
                                    type="text"
                                    id="authorName"
                                    name="authorName"
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Your name"
                                />
                                <ErrorMessage name="authorName" component="p" className="text-red-500 text-sm mt-1" />
                            </div>
                            <div>
                                <label htmlFor="authorEmail" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                                    Email *
                                </label>
                                <Field
                                    type="email"
                                    id="authorEmail"
                                    name="authorEmail"
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="your@email.com"
                                />
                                <ErrorMessage name="authorEmail" component="p" className="text-red-500 text-sm mt-1" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="authorWebsite" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                                Website (optional)
                            </label>
                            <Field
                                type="url"
                                id="authorWebsite"
                                name="authorWebsite"
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://yourwebsite.com"
                            />
                            <ErrorMessage name="authorWebsite" component="p" className="text-red-500 text-sm mt-1" />
                        </div>

                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                                Comment *
                            </label>
                            <Field
                                as="textarea"
                                id="content"
                                name="content"
                                rows={4}
                                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Write your comment..."
                            />
                            <ErrorMessage name="content" component="p" className="text-red-500 text-sm mt-1" />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="cursor-pointer px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitMutation.isPending}
                                className="cursor-pointer px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitMutation.isPending ? "Submitting..." : "Submit Comment"}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );

    const ThreadedReplies = ({ parentId, depth = 0 }: { parentId: string; depth?: number }) => {
        const maxDepth = 10;
        const isExpanded = expandedThreads.has(parentId);

        const {
            data: repliesData,
            fetchNextPage: fetchMoreReplies,
            hasNextPage: hasMoreReplies,
            isFetchingNextPage: isFetchingMoreReplies,
            isLoading: isLoadingReplies,
        } = useInfiniteQuery<RepliesResponse>({
            queryKey: ["replies", parentId],
            queryFn: async ({ pageParam = 1 }) => {
                const response = await axiosInstance.get(`/comments/${parentId}/replies?page=${pageParam}&limit=5`);
                return response.data;
            },
            getNextPageParam: (lastPage) => {
                if (lastPage.hasMore) {
                    return lastPage.page + 1;
                }
                return undefined;
            },
            initialPageParam: 1,
            enabled: isExpanded,
        });

        const replies = repliesData?.pages.flatMap((page) => page.replies) || [];

        if (!isExpanded) return null;

        if (isLoadingReplies) {
            return (
                <div className="ml-12 mt-3 space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse flex gap-3">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="ml-12 mt-2 border-l-2 border-gray-200 dark:border-gray-700">
                {replies.map((reply) => (
                    <ThreadedComment
                        key={reply.id}
                        comment={reply}
                        depth={depth + 1}
                        maxDepth={maxDepth}
                    />
                ))}

                {hasMoreReplies && (
                    <button
                        onClick={() => fetchMoreReplies()}
                        disabled={isFetchingMoreReplies}
                        className="cursor-pointer ml-4 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                    >
                        {isFetchingMoreReplies ? "Loading..." : "Show more replies"}
                    </button>
                )}
            </div>
        );
    };

    const ThreadedComment = ({ comment, depth = 0, maxDepth = 10 }: { comment: Comment; depth?: number; maxDepth?: number }) => {
        const isExpanded = expandedThreads.has(comment.id);
        const isReplyingToThis = replyingTo?.id === comment.id;
        const hasReplies = (comment.replyCount ?? 0) > 0;

        return (
            <div className={`${depth > 0 ? "pl-4 py-2" : "py-4"}`}>
                <article className="flex gap-3">
                    <div className="flex-shrink-0">
                        {comment.user?.avatarUrl ? (
                            <img
                                src={comment.user.avatarUrl}
                                alt={comment.authorName}
                                className={`rounded-full ${depth === 0 ? "w-10 h-10" : "w-8 h-8"}`}
                            />
                        ) : (
                            <div className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium ${depth === 0 ? "w-10 h-10" : "w-8 h-8 text-sm"}`}>
                                {comment.authorName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            {comment.authorWebsite ? (
                                <a
                                    href={comment.authorWebsite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                                >
                                    {comment.authorName}
                                </a>
                            ) : (
                                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {comment.authorName}
                                </span>
                            )}
                            {comment.user && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">@{comment.user.username}</span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">·</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(comment.createdAt)}
                            </span>
                        </div>

                        <p className="text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                            {comment.content}
                        </p>

                        <div className="flex items-center gap-4 mt-2">
                            {depth < maxDepth && (
                                <button
                                    onClick={() => handleReply(comment)}
                                    className="cursor-pointer flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    <ReplyIcon style={{ fontSize: 16 }} />
                                    Reply
                                </button>
                            )}

                            {hasReplies && (
                                <button
                                    onClick={() => toggleThread(comment.id)}
                                    className="cursor-pointer flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    <ChatBubbleOutlineIcon style={{ fontSize: 16 }} />
                                    {isExpanded ? "Hide" : "Show"} {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
                                </button>
                            )}
                        </div>
                    </div>
                </article>

                {isReplyingToThis && (
                    <InlineReplyForm parentComment={comment} onCancel={cancelReply} />
                )}

                {hasReplies && (
                    <ThreadedReplies parentId={comment.id} depth={depth} />
                )}
            </div>
        );
    };

    return (
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Comments {countData?.count ? `(${countData.count})` : ""}
                </h3>
                {!showForm && !replyingTo && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="cursor-pointer px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Leave a Comment
                    </button>
                )}
            </div>

            {showForm && !replyingTo && <CommentForm />}

            {isLoading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : allComments.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PersonIcon className="text-gray-400 dark:text-gray-600" style={{ fontSize: 32 }} />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No comments yet</h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Be the first to share your thoughts on this article!
                    </p>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="cursor-pointer px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Write a Comment
                        </button>
                    )}
                </div>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {allComments.map((comment) => (
                        <ThreadedComment key={comment.id} comment={comment} depth={0} />
                    ))}

                    {hasNextPage && (
                        <div className="text-center pt-6">
                            <button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="cursor-pointer px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                            >
                                {isFetchingNextPage ? "Loading..." : "Show more comments"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Comments;
