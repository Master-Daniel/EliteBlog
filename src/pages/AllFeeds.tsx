import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import PostCard from "../components/PostCard";
import NewsLetterSection from "../components/NewsLetterSection";
import Footer from "../components/Footer";
import { PageMeta } from "../components/Meta";
import axiosInstance from "../api/axiosConfig";
import { Feed } from "../utils/types";

const POSTS_PER_PAGE = 6;

const PostCardSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="block relative pt-[75%] bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="flex flex-wrap gap-3 items-center mt-6">
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded mt-4 w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-4 w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-2 w-2/3" />
    </div>
);

const AllFeeds: React.FC = () => {
    const [searchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    const { data, isLoading } = useQuery({
        queryKey: ["all-feeds"],
        queryFn: async () => {
            const response = await axiosInstance.get("/feed/fetch-all");
            return response.data;
        },
    });

    const { feeds = [], featured = [] } = data || {};
    const allPosts = [...featured, ...feeds];
    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const paginatedFeeds = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

    return (
        <>
            <PageMeta
                title={`All Posts${currentPage > 1 ? ` - Page ${currentPage}` : ""}`}
                description="Browse all articles on EliteBlog. Discover insights on productivity, tips, inspiration, and strategies for success."
            />
            <Header />
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 mt-20 text-black dark:text-white">
                <div className="mb-24 text-center max-w-screen-sm mx-auto">
                    <h1 className="text-3xl sm:text-5xl capitalize font-bold">All Posts</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        Discover insightful articles on productivity, tips, inspiration, and strategies for massive profits.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, index) => (
                            <PostCardSkeleton key={index} />
                        ))}
                    </div>
                ) : paginatedFeeds.length > 0 ? (
                    <>
                        <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {paginatedFeeds.map((feed: Feed) => (
                                <PostCard post={feed} key={feed.id} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-20 text-black dark:text-white">
                                {currentPage > 1 && (
                                    <Link
                                        className="p-2.5 border border-black rounded-full dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                                        aria-label={`Go to page ${currentPage - 1}`}
                                        to={currentPage === 2 ? "/all-posts" : `/all-posts?page=${currentPage - 1}`}
                                    >
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" className="w-4 h-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"></path>
                                        </svg>
                                    </Link>
                                )}
                                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                                {currentPage < totalPages && (
                                    <Link
                                        className="p-2.5 border border-black rounded-full dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                                        aria-label={`Go to page ${currentPage + 1}`}
                                        to={`/all-posts?page=${currentPage + 1}`}
                                    >
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" className="w-4 h-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"></path>
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Posts Yet</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Check back later for new content!
                        </p>
                        <Link
                            to="/"
                            className="inline-block px-6 py-3 bg-black dark:bg-white !text-white dark:!text-black rounded-full hover:opacity-80 transition-opacity"
                        >
                            Back to Home
                        </Link>
                    </div>
                )}
            </div>
            <NewsLetterSection />
            <Footer />
        </>
    );
};

export default AllFeeds;
