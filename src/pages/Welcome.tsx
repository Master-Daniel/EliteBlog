import React from "react";
import Header from "../components/Header";
import FeaturedSection from "../components/FeaturedSection";
import PostCard from "../components/PostCard";
import NewsLetterSection from "../components/NewsLetterSection";
import Footer from "../components/Footer";
import axiosInstance from "../api/axiosConfig";
import Pagination from "../components/Pagination";

import { useQuery } from "@tanstack/react-query";
import { Feed } from "../utils/types";
import { setFeeds } from "../redux/slices/globalSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Meta from "../components/Meta";

const Welcome: React.FC = () => {

    const dispatch = useDispatch()
    const { feeds: _feeds } = useSelector((state: RootState) => state.global)

    const { data } = useQuery({
        queryKey: ["feeds"],
        queryFn: async () => {
            const feeds = _feeds;
            const response = await axiosInstance.get("/feed/fetch-all");
            dispatch(setFeeds(response.data))
            return response?.data ?? feeds;
        },
    });

    // Destructure `feeds` and `featured`
    const { feeds = [], featured = [] } = data || {};

    // Fetch the actual featured posts from their IDs
    const { data: featuredPosts } = useQuery({
        queryKey: ["featured", featured],
        queryFn: async () => {
            if (featured.length === 0) return [];
            const response = await axiosInstance.post("/feed/fetch-featured", { ids: featured });
            return response.data;
        },
        enabled: featured.length > 0, // Only run if there are featured post IDs
    });

    // Remove featured posts from `feeds`
    const filteredFeeds = feeds.filter((feed: Feed) => !featured.includes(feed.id));

    const meta = {
        noIndex: false,
        title: 'Welcome',
        description: 'This is EliteBlog a blog that covers productivity, tips, inspiration, and strategies for massive profits.',
    }

    return (
        <>
            <Meta meta={meta} />
            <Header />
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 z-10 mt-20 text-black dark:text-white">
                <h1 className="text-3xl sm:text-6xl sm:leading-tight max-w-screen-xl font-normal">
                    <b> This is EliteBlog</b> a blog that covers productivity, tips, inspiration, and strategies for massive profits.
                </h1>
                {featuredPosts && <h2 className="mb-4 font-medium text-base uppercase tracking-wider mt-20">Featured Posts</h2>}
                <FeaturedSection feeds={featuredPosts} />
                {filteredFeeds?.length > 0 ? (
                    <>
                        <h2 className="mb-4 font-medium text-base uppercase tracking-wider mt-32">Latest Posts</h2>
                        <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {filteredFeeds.slice(0, 6).map((feed: Feed, index: number) => <PostCard post={feed} key={index} />)}
                        </div>
                    </>
                ) : <div className="text-center text-2xl font-bold p-12">No Post Yet</div>}
                {filteredFeeds?.length > 0 && <Pagination currentPage={1} totalPages={Math.ceil(feeds?.length / 6)} />}
            </div>
            <NewsLetterSection />
            <Footer />
        </>
    );
};

export default Welcome;
