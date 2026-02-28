import React from "react";
import { Link } from "react-router-dom";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath?: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, basePath = "/all-posts" }) => {
    if (totalPages <= 1) return null;

    const getPrevUrl = () => {
        if (currentPage <= 1) return "";
        if (currentPage === 2) return basePath;
        return `${basePath}?page=${currentPage - 1}`;
    };

    const getNextUrl = () => {
        if (currentPage >= totalPages) return "";
        return `${basePath}?page=${currentPage + 1}`;
    };

    return (
        <div className="flex justify-center items-center gap-4 mt-20 text-black dark:text-white">
            {currentPage > 1 && (
                <Link
                    className="p-2.5 border border-black rounded-full dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    aria-label={`Go to page ${currentPage - 1}`}
                    to={getPrevUrl()}
                >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" className="w-4 h-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"></path>
                    </svg>
                </Link>
            )}
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            {currentPage < totalPages && (
                <Link
                    className="p-2.5 border border-black rounded-full dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    aria-label={`Go to page ${currentPage + 1}`}
                    to={getNextUrl()}
                >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" className="w-4 h-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"></path>
                    </svg>
                </Link>
            )}
        </div>
    );
};

export default Pagination;
