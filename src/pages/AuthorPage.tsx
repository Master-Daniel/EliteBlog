import React from 'react';
import Header from '../components/Header';
import PostCard from '../components/PostCard';
import NewsLetterSection from '../components/NewsLetterSection';
import Footer from '../components/Footer';

const Author: React.FC = () => {

    const posts = [
        {
            title: 'The chief enemy of creativity is good sense',
            slug: 'the-chief-enemy-of-creativity-is-good-sense',
            thumbnail: '/images/creativity.jpg',
            category: 'mind',
            date: 'Oct 28, 2022',
            readTime: '3 min read',
            author: [
                { name: 'Catherine Ryan', link: 'catherine', avatar: '/images/catherine.jpg' },
                { name: 'Dina Jerrie', link: 'dina', avatar: '/images/dina.jpg' }
            ]
        },
        {
            title: 'Exploring the Depths of Innovation',
            slug: 'exploring-the-depths-of-innovation',
            thumbnail: '/images/innovation.jpg',
            category: 'tech',
            date: 'Nov 10, 2023',
            readTime: '5 min read',
            author: [{ name: 'John Doe', link: 'john', avatar: '/images/john.jpg' }]
        },
        {
            title: 'The Future of AI and Creativity',
            slug: 'the-future-of-ai-and-creativity',
            thumbnail: '/images/ai.jpg',
            category: 'AI',
            date: 'Dec 15, 2023',
            readTime: '7 min read',
            author: [{ name: 'Sarah Smith', link: 'sarah', avatar: '/images/sarah.jpg' }]
        }
    ];

    return (
        <>
            <Header />
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8">
                <div className="max-w-[450px] text-center mx-auto mb-20">
                    <div className="rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 inline-block leading-[0] author-avatar">
                        <div className="pt-[100%] relative">
                            <img
                                alt="author avatar"
                                sizes="160px"
                                srcSet="/images/prince.jpg"
                                src="/images/prince.jpg"
                                decoding="async"
                                data-nimg="fill"
                                loading="lazy"
                            />
                        </div>
                    </div>
                    <h3 className="text-3xl my-3">Livia Brendan</h3>
                    <div className="mb-3">1 Posts</div>
                    <p>
                        Vivamus erat nibh, iaculis et imperdiet in, luctus vitae felis. Sed tincidunt hendrerit metus, sit amet molestie urna vestibulum sed.
                        Praesent accumsan leo at facilisis elementum.
                    </p>
                </div>
                <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post, index) => (
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
