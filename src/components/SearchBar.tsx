import React from 'react'

const SearchBar: React.FC = () => {
    return (
        <div className="fixed inset-0 px-5 py-10 sm:py-[10vh] z-50 bg-black/20 dark:bg-white/20">
            <div className="w-full max-w-lg max-h-full mx-auto bg-white dark:bg-dark flex flex-col py-2 px-6 rounded-md shadow-md">
                <form className="flex items-center">
                    <label htmlFor="search-input" className="opacity-70 hover:opacity-100">
                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" className="w-5 h-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path>
                        </svg>
                    </label>
                    <input className="SearchBox block bg-transparent w-full px-4 h-14 focus:outline-0 no-outline" type="search" id="search-input" autoComplete="off" autoCapitalize="off" spellCheck="false" placeholder="Search..." value="" />
                    <button aria-label="Close search" className="opacity-70 hover:opacity-100">
                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" className="w-4 h-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.116 8l-4.558 4.558.884.884L8 8.884l4.558 4.558.884-.884L8.884 8l4.558-4.558-.884-.884L8 7.116 3.442 2.558l-.884.884L7.116 8z"></path>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default SearchBar