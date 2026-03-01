import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import NewsLetterSection from '../components/NewsLetterSection'
import Footer from '../components/Footer'
import { PageMeta } from '../components/Meta'

const NotFound: React.FC = () => {
    return (
        <>
            <PageMeta
                title="Page Not Found"
                description="The page you are looking for doesn't exist or has been moved."
                noIndex={true}
            />
            <Header />
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 text-center my-52 text-black dark:text-white">
                <h2 className="text-6xl md:text-[100px]">404</h2>
                <p className="text-lg md:text-2xl mt-3">Page Not Found</p>
                <Link 
                    to="/"
                    className="inline-block mt-6 px-8 py-3 rounded-full font-semibold cursor-pointer bg-black !text-white dark:bg-white dark:!text-black hover:opacity-80 transition-opacity"
                >
                    Back Home
                </Link>
            </div>
            <NewsLetterSection />
            <Footer />
        </>
    )
}

export default NotFound