import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosConfig";

// Define your Feed type/interface
export interface Feed {
    id: string;
    title: string;
    description: string;
    keywords: string[];
    slug: string;
    content?: string;
    created_at?: Date;
    updated_at?: Date;
    name: string;
    author?: {
        id: string;
        name?: string;
        username: string;
        avatarUrl?: string;
    } | null;
    category: { id: string; name: string };
    tags: string[];
    featuredImage: string;
    schema?: {
        "@context": string;
        "@type": string;
        headline: string,
        author: {
            '@type': string,
            name: string,
        },
        datePublished: string,
        dateModified: string,
        publisher: {
            '@type': string,
            name: string,
            logo: {
                '@type': string,
                url: string,
            },
        },
        mainEntityOfPage: {
            '@type': string,
            '@id': string,
        },
    };
}

// Async function to fetch feed using your axiosInstance
const fetchFeed = async (slug: string): Promise<Feed> => {
    const response = await axiosInstance.get<Feed>(`/feed/${slug}`);
    return response.data;
};

// Custom hook using react-query with the object syntax
const useFeed = (slug: string) => {
    return useQuery<Feed, Error>({
        queryKey: [`feed-${slug}`],
        queryFn: () => fetchFeed(slug),
    });
};

export default useFeed;
