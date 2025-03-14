import React from 'react';
import Header from '../components/Header';
import AuthorCard from '../components/AuthorCard';
import NewsLetterSection from '../components/NewsLetterSection';
import Footer from '../components/Footer';
import useAuthors, { Author } from '../hooks/useAuthors';

const Authors: React.FC = () => {
    const { data: authors, error, isLoading } = useAuthors();

    // if (isLoading) return <div>Loading...</div>;
    // if (error) return <div>Error: {error.message}</div>;
    return (
        <>
            <Header />
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 mt-20">
                <div className="mb-24 text-center max-w-screen-sm mx-auto">
                    <h2 className="text-3xl sm:text-5xl capitalize">Get to Know Our Authors</h2>
                    <p className="mt-4 text-lg">
                        Get to know the talented writers who bring stories to life. Explore their insights, creativity, and passion for sharing knowledge.
                    </p>
                </div>
                <div className="grid grid-cols-4 gap-16 authors-grid">
                    {(authors as Author[])?.map((author, index: number) => (
                        <AuthorCard author={author} key={index} />
                    ))}
                </div>
                <NewsLetterSection />
                <Footer />
            </div>
        </>
    );
};

export default Authors;
