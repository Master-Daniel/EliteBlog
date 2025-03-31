import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import NewsLetterSection from '../components/NewsLetterSection'
import Footer from '../components/Footer'

const NotFound: React.FC = () => {
    return (
        <>
            <Header />
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 text-center my-52 text-black dark:text-white">
                <h2 className="text-6xl md:text-[100px]">404</h2>
                <p className="text-lg md:text-2xl mt-3">Page Not Found</p>
                <Link to="/">
                    <button className="btn cursor-pointer relative mt-6 text-white dark:text-black bg-black dark:bg-white">
                        <span className="">Back Home</span>
                    </button>
                </Link>
            </div>
            <NewsLetterSection />
            <Footer />
        </>
    )
}

export default NotFound