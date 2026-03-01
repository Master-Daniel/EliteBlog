import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import FeaturedSection from "../components/FeaturedSection";
import PostCard from "../components/PostCard";
import NewsLetterSection from "../components/NewsLetterSection";
import Footer from "../components/Footer";
import axiosInstance from "../api/axiosConfig";

import { useQuery } from "@tanstack/react-query";
import { Feed } from "../utils/types";
import { setFeeds } from "../redux/slices/globalSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { PageMeta } from "../components/Meta";

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

const FeaturedSkeleton: React.FC = () => (
    <div className="animate-pulse flex flex-wrap xl:flex-nowrap gap-10">
        <div className="basis-full xl:basis-[65%] shrink-0">
            <div className="relative pt-[75%] bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="flex gap-3 items-center mt-8">
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mt-4 w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-4 w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-2 w-2/3" />
        </div>
        <div className="flex flex-col md:flex-row xl:flex-col gap-10 flex-1">
            {[1, 2].map((i) => (
                <div key={i} className="flex-1">
                    <div className="relative pt-[75%] bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="flex gap-3 items-center mt-6">
                        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded mt-3 w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-3 w-full" />
                </div>
            ))}
        </div>
    </div>
);

const Welcome: React.FC = () => {

    const dispatch = useDispatch()
    const { feeds: _feeds } = useSelector((state: RootState) => state.global)

    const { data, isLoading } = useQuery({
        queryKey: ["feeds"],
        queryFn: async () => {
            const response = await axiosInstance.get("/feed/fetch-all");
            dispatch(setFeeds(response.data))
            return response?.data ?? _feeds;
        },
    });

    // Destructure `feeds` and `featured` from the API response
    const { feeds = [], featured = [] } = data || {};

    // Compute featured and latest posts
    const { featuredPosts, latestPosts } = useMemo(() => {
        const allPosts = [...featured, ...feeds];
        
        // If there are explicitly featured posts, use them
        if (featured.length > 0) {
            return {
                featuredPosts: featured.slice(0, 3),
                latestPosts: feeds,
            };
        }
        
        // If no featured posts, use the first 3 posts as featured
        if (allPosts.length >= 3) {
            return {
                featuredPosts: allPosts.slice(0, 3),
                latestPosts: allPosts.slice(3),
            };
        }
        
        // If less than 3 posts total, show them all as featured
        if (allPosts.length > 0) {
            return {
                featuredPosts: allPosts,
                latestPosts: [],
            };
        }
        
        return {
            featuredPosts: [],
            latestPosts: [],
        };
    }, [feeds, featured]);

    const hasAnyPosts = featuredPosts.length > 0 || latestPosts.length > 0;

    return (
        <>
            <PageMeta
                title="Home"
                description="Discover insightful articles on technology, programming tutorials, web development, and lifestyle tips. Join our community of developers and tech enthusiasts."
            />
            <Header />
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 z-10 mt-20 text-black dark:text-white">
                <h1 className="text-3xl sm:text-6xl sm:leading-tight max-w-screen-xl font-normal">
                    <b> This is EliteBlog</b> a blog that covers productivity, tips, inspiration, and strategies for massive profits.
                </h1>
                {isLoading ? (
                    <>
                        <h2 className="mb-4 font-medium text-base uppercase tracking-wider mt-20">Featured Posts</h2>
                        <FeaturedSkeleton />
                        <h2 className="mb-4 font-medium text-base uppercase tracking-wider mt-32">Latest Posts</h2>
                        <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, index) => (
                                <PostCardSkeleton key={index} />
                            ))}
                        </div>
                    </>
                ) : hasAnyPosts ? (
                    <>
                        {featuredPosts.length > 0 && (
                            <>
                                <h2 className="mb-4 font-medium text-base uppercase tracking-wider mt-20">Featured Posts</h2>
                                <FeaturedSection feeds={featuredPosts} />
                            </>
                        )}
                        {latestPosts.length > 0 && (
                            <>
                                <h2 className="mb-4 font-medium text-base uppercase tracking-wider mt-32">Latest Posts</h2>
                                <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {latestPosts.slice(0, 6).map((feed: Feed, index: number) => <PostCard post={feed} key={index} />)}
                                </div>
                                {latestPosts.length > 6 && (
                                    <div className="flex justify-center mt-16">
                                        <Link
                                            to="/all-posts"
                                            className="px-8 py-3 border border-black dark:border-white rounded-full text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors font-medium cursor-pointer"
                                        >
                                            View All Posts
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16 mt-20">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Posts Yet</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Check back later for new content!
                        </p>
                    </div>
                )}
            </div>
            <NewsLetterSection />
            <Footer />
        </>
    );
};

export default Welcome;
