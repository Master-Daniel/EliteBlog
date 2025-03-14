import React from 'react'
import SignInModal from './SignInModal';

import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setIsModalOpen, setTheme } from '../redux/slices/globalSlice';
// import SearchBar from './SearchBar';

const Header: React.FC = () => {
    const { isModalOpen, theme, userData, isLoggedIn } = useSelector((state: RootState) => state.global);
    const dispatch = useDispatch()

    const updateTheme = (mode: "light" | "dark") => {
        const htmlElement = document.documentElement;
        dispatch(setTheme(mode));
        if (mode === "dark") {
            htmlElement.classList.add("dark");
            htmlElement.style.colorScheme = "dark";
        } else {
            htmlElement.classList.remove("dark");
            htmlElement.style.colorScheme = "light";
        }
    };

    return (
        <div className="sticky top-0 z-40 shadow-md bg-white dark:bg-black transition-colors">
            <header className="py-5 px-5 sm:px-8 flex items-center w-full text-black dark:text-white">
                <Link to="/" className="font-bold text-lg">EliteBlog</Link>
                <div className="flex gap-1 ml-auto">
                    <nav>
                        <ul className="heading-color gap-5 hidden lg:flex mr-1">
                            <li><Link className="nav__link" to="/">Home</Link></li>
                            <li><Link className="nav__link" to="#/web3">Web3</Link></li>
                            <li><Link className="nav__link" to="#/programming">Programming</Link></li>
                            <li><Link className="nav__link" to="/contact">Contact</Link></li>
                            <li><Link className="nav__link" to="/authors">Authors</Link></li>
                            {
                                isLoggedIn ? <li>
                                    <Link className="nav__link" to="/dashboard">
                                        <img
                                            src={userData?.avatarUrl || '/images/avatar.png'}
                                            alt="User Avatar"
                                            className="w-8 h-8 rounded-full"
                                        />
                                    </Link>
                                </li> : <li><Link className="nav__link" to="#" onClick={() => dispatch(setIsModalOpen(!isModalOpen))}>Signin</Link></li>
                            }
                        </ul>
                    </nav>
                    <button className="p-1.5 cursor-pointer" aria-label="Toggle light/dark themes" onClick={() => {
                        updateTheme(theme === 'light' ? 'dark' : 'light')
                    }}>
                        {
                            theme === 'light' ? <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" className="w-5 h-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                <desc></desc>
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path>
                            </svg> : <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" className="w-5 h-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                <path fill="none" d="M0 0h24v24H0V0z"></path>
                                <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79zM1 10.5h3v2H1zM11 .55h2V3.5h-2zm8.04 2.495l1.408 1.407-1.79 1.79-1.407-1.408zm-1.8 15.115l1.79 1.8 1.41-1.41-1.8-1.79zM20 10.5h3v2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm-1 4h2v2.95h-2zm-7.45-.96l1.41 1.41 1.79-1.8-1.41-1.41z"></path>
                            </svg>
                        }
                    </button>
                    <button className="p-1.5 cursor-pointer" aria-label="Search">
                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" className="w-5 h-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path>
                        </svg>
                    </button>
                    <nav className="lg:hidden relative">
                        <button className="p-1.5 cursor-pointer" aria-label="Nav">
                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" className="w-5 h-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 5H0V4h16v1zm0 8H0v-1h16v1zm0-4.008H0V8h16v.992z"></path>
                            </svg>
                        </button>
                        <button className="p-1.5 cursor-pointer hidden" aria-label="Nav">
                            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" className="w-5 h-auto" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.116 8l-4.558 4.558.884.884L8 8.884l4.558 4.558.884-.884L8.884 8l4.558-4.558-.884-.884L8 7.116 3.442 2.558l-.884.884L7.116 8z"></path>
                            </svg>
                        </button>
                    </nav>
                </div>
            </header>
            {/* Modal */}
            <SignInModal isOpen={isModalOpen} onClose={() => dispatch(setIsModalOpen(!isModalOpen))} />
            {/* <SearchBar /> */}
        </div>
    )
}

export default Header