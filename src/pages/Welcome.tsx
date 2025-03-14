import React, { useEffect } from 'react'
import Header from '../components/Header'
import FeaturedSection from '../components/FeaturedSection'
import PostCard from '../components/PostCard'
import NewsLetterSection from '../components/NewsLetterSection'
import Footer from '../components/Footer'
import { useSearchParams } from 'react-router-dom'
import axiosInstance from '../api/axiosConfig'

const Welcome: React.FC = () => {

    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    useEffect(() => {
        if (code && state) {
            const storedState = sessionStorage.getItem('github_oauth_state');
            if (state !== storedState) {
                console.error('OAuth state mismatch!');
                return;
            }
            // Now, send the code to your backend to exchange for an access token.
            axiosInstance.post('https://github.com/login/oauth/access_token', {
                code: code,
                client_id: import.meta.env.VITE_GITHUB_CLIENT_ID,
                client_secret: state,
                redirect_uri: import.meta.env.VITE_GITHUB_REDIRECT_URI
            }, {
                headers: {
                    Accept: 'application/json', // Ensures GitHub responds with JSON instead of URL-encoded data
                },
            }).then((response) => {
                console.log('GitHub auth success:', response.data);
                // Handle the successful authentication, e.g., store tokens or update app state.
            }).catch((error) => {
                console.error('GitHub auth error:', error);
            });
        }
    }, [code, state]);

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
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 z-10 mt-20">
                <h1 className="text-3xl sm:text-6xl sm:leading-tight max-w-screen-xl font-normal"> <b> This is .....</b> A blog that covers productivity, tips, inspiration, and strategies for massive profits.</h1>
                <h2 className="mb-4 font-medium text-base uppercase tracking-wider mt-20">Featured Posts</h2>
                {/* featured section */}
                <FeaturedSection />
                <h2 className="mb-4 font-medium text-base uppercase tracking-wider mt-32">Latest Posts</h2>
                <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post, index) => (
                        <PostCard post={post} key={index} />
                    ))}
                </div>
                <div className="flex justify-center items-center gap-4 mt-20 text-black dark:text-white">
                    <span className="text-sm">Page 1 of 4</span>
                    <a className="p-2.5 border border-black rounded-full dark:border-white" aria-label="Go to page 2" href="blog/page/2.html">
                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" className="w-4 h-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"></path>
                        </svg>
                    </a>
                </div>
            </div>
            <NewsLetterSection />
            <Footer />
        </>
    )
}

export default Welcome