import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import PostCard from "../components/PostCard";
import NewsLetterSection from "../components/NewsLetterSection";
import Footer from "../components/Footer";
import { PageMeta } from "../components/Meta";
import axiosInstance from "../api/axiosConfig";
import { Feed } from "../utils/types";

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

const TagFeeds: React.FC = () => {
    const { tagName } = useParams<{ tagName: string }>();
    const decodedTagName = decodeURIComponent(tagName || "");

    const { data: feeds, isLoading, isError } = useQuery<Feed[]>({
        queryKey: ["tag-feeds", tagName],
        queryFn: async () => {
            const response = await axiosInstance.get(`/feed/tags/${tagName}`);
            return response.data;
        },
        enabled: !!tagName,
    });

    const capitalizedTag = decodedTagName.charAt(0).toUpperCase() + decodedTagName.slice(1);

    return (
        <>
            <PageMeta
                title={`#${capitalizedTag} Articles`}
                description={`Browse all articles tagged with #${capitalizedTag}. Discover related content and insights.`}
            />
            <Header />
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 mt-20 text-black dark:text-white">
                <div className="mb-16">
                    <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                        <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">
                            Home
                        </Link>
                        <span>/</span>
                        <span className="text-black dark:text-white">Tags</span>
                        <span>/</span>
                        <span className="text-black dark:text-white capitalize">{decodedTagName}</span>
                    </nav>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl text-gray-400">#</span>
                        <h1 className="text-3xl sm:text-5xl font-bold capitalize">{decodedTagName}</h1>
                    </div>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        {feeds?.length || 0} {feeds?.length === 1 ? "article" : "articles"} tagged with #{decodedTagName}
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, index) => (
                            <PostCardSkeleton key={index} />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            No Articles Found
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            No articles found with this tag.
                        </p>
                        <Link
                            to="/"
                            className="inline-block px-6 py-3 bg-black dark:bg-white !text-white dark:!text-black rounded-full hover:opacity-80 transition-opacity"
                        >
                            Back to Home
                        </Link>
                    </div>
                ) : feeds && feeds.length > 0 ? (
                    <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {feeds.map((feed) => (
                            <PostCard post={feed} key={feed.id} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            No posts found with this tag yet.
                        </p>
                        <Link
                            to="/"
                            className="inline-block mt-6 px-6 py-3 bg-black dark:bg-white !text-white dark:!text-black rounded-full hover:opacity-80 transition-opacity"
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

export default TagFeeds;
