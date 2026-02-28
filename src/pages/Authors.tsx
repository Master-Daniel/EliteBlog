import React from 'react';
import Header from '../components/Header';
import AuthorCard from '../components/AuthorCard';
import NewsLetterSection from '../components/NewsLetterSection';
import Footer from '../components/Footer';
import useAuthors from '../hooks/useAuthors';
import { PageMeta } from '../components/Meta';

const AuthorSkeleton: React.FC = () => (
    <div className="text-center animate-pulse">
        <div 
            className="rounded-full bg-gray-200 dark:bg-gray-700 mx-auto"
            style={{ width: '180px', height: '180px' }}
        />
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded mt-4 mx-auto w-32" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mt-2 mx-auto w-16" />
    </div>
);

const Authors: React.FC = () => {
    const { data: authors, isLoading, isError } = useAuthors();

    return (
        <>
            <PageMeta
                title="Authors"
                description="Meet our talented authors who share insights on technology, programming, and lifestyle. Explore their articles and expertise."
            />
            <Header />
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 mt-20 text-black dark:text-white">
                <div className="mb-24 text-center max-w-screen-sm mx-auto">
                    <h2 className="text-3xl sm:text-5xl capitalize">Meet Our Authors</h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        Get to know the talented writers who bring stories to life. Explore their insights, creativity, and passion for sharing knowledge.
                    </p>
                </div>

                {isLoading ? (
                    <div 
                        className="grid gap-16"
                        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))' }}
                    >
                        {[...Array(8)].map((_, index) => (
                            <AuthorSkeleton key={index} />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-16">
                        <p className="text-red-500 dark:text-red-400 text-lg">
                            Failed to load authors. Please try again later.
                        </p>
                    </div>
                ) : authors && authors.length > 0 ? (
                    <div 
                        className="grid gap-16"
                        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))' }}
                    >
                        {authors.map((author) => (
                            <AuthorCard author={author} key={author.id} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            No authors found yet. Check back later!
                        </p>
                    </div>
                )}
            </div>
            <NewsLetterSection />
            <Footer />
        </>
    );
};

export default Authors;
