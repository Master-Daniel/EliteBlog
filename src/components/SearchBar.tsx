import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Link } from 'react-router-dom';

interface SearchBarProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onClose }) => {
    const [query, setQuery] = useState("");
    const { feeds } = useSelector((state: RootState) => state.global);

    // Combine featured and feeds into a single array
    const allPosts = [...(feeds?.featured || []), ...(feeds?.feeds || [])];

    // Filter posts based on the search query
    const filteredPosts = allPosts.filter(feed =>
        feed.title.toLowerCase().includes(query.toLowerCase()) ||
        feed.description.toLowerCase().includes(query.toLowerCase())
    );

    // Function to highlight search term in text
    const highlightText = (text: string) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, `<span class="text-primary underline !important">$1</span>`);
    };

    return (
        <div className="fixed inset-0 px-5 py-10 sm:py-[10vh] z-50 bg-black/20 dark:bg-white/20 backdrop-blur-sm">
            <div className="w-full max-w-lg max-h-full mx-auto bg-white dark:bg-black flex flex-col py-2 px-6 rounded-md shadow-md">
                <form className="flex items-center">
                    <label htmlFor="search-input" className="opacity-70 hover:opacity-100 dark:text-gray-500">
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="w-5 h-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path>
                        </svg>
                    </label>
                    <input
                        className="SearchBox block bg-transparent w-full px-4 h-14 focus:outline-0 no-outline dark:text-gray-500 dark:placeholder-gray-600"
                        autoFocus
                        id="search-input"
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        placeholder="Search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button aria-label="Close search" className="opacity-70 hover:opacity-100 cursor-pointer dark:text-gray-500" onClick={onClose}>
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" className="w-4 h-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M7.116 8l-4.558 4.558.884.884L8 8.884l4.558 4.558.884-.884L8.884 8l4.558-4.558-.884-.884L8 7.116 3.442 2.558l-.884.884L7.116 8z"></path>
                        </svg>
                    </button>
                </form>

                {/* Search result list */}
                {query.length > 0 && <div className="overflow-y-auto py-4">
                    {filteredPosts.length > 0 && (
                        filteredPosts.map(feed => (
                            <Link key={feed.slug} className="block px-4 py-4 hover:bg-gray-100 dark:hover:bg-white/5" to={`/feed/${feed.slug}`} onClick={onClose}>
                                <h3 className="text-base mb-1 text-black dark:text-white" dangerouslySetInnerHTML={{ __html: highlightText(feed.title) }}></h3>
                                <p className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: highlightText(feed.description.substring(0, 100)) }}></p>
                            </Link>
                        ))
                    )}
                    {filteredPosts.length == 0 && <p className='text-center dark:text-gray-500'>No results found</p>}
                </div>}
            </div>
        </div>
    );
};

export default SearchBar;
