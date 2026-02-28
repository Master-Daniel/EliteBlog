import React from 'react';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import NewsLetterSection from '../components/NewsLetterSection';
import Footer from '../components/Footer';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosConfig';
import { Feed } from '../utils/types';

const Author: React.FC = () => {
    const params = useParams();

    const { data: author, isLoading, isError } = useQuery({
        queryKey: ['author', params.id], // 🔥 Use params.id as dependency
        queryFn: async () => {
            const response = await axiosInstance.get(`/user/${params.id}`);
            return response.data;
        },
        enabled: !!params.id, // 🔥 Prevents unnecessary API calls when params.id is undefined
    });

    if (isLoading) return <div className="text-center mt-20">Loading...</div>;
    if (isError) return <div className="text-center mt-20 text-red-500">Error loading author data.</div>;

    return (
        <>
            <Header />
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 mt-20 text-black dark:text-white">
                <div className="max-w-[450px] text-center mx-auto mb-20">
                    <div className="rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 inline-block leading-[0] author-avatar">
                        <div className="pt-[100%] relative">
                            <img
                                alt={author?.user?.name || 'Author'}
                                sizes="160px"
                                srcSet={author?.user?.avatarUrl || '/default-avatar.png'}
                                src={author?.user?.avatarUrl || '/default-avatar.png'}
                                decoding="async"
                                data-nimg="fill"
                                loading="lazy"
                            />
                        </div>
                    </div>
                    <h3 className="text-3xl my-3">{author?.user?.name || 'Unknown Author'}</h3>
                    <div className="mb-3">{author?.user?.feeds?.length || 0} Posts</div>
                    {/* <p>{author?.user?.bio}</p> */}
                </div>
                <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {author?.user?.feeds?.map((post: Feed, index: number) => (
                        <PostCard post={post} key={index} />
                    ))}
                </div>
            </div>
            <NewsLetterSection />
            <Footer />
        </>
    );
};

export default Author;
