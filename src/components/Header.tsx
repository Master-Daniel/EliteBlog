import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setTheme } from "../redux/slices/globalSlice";
import SignInModal from "./SignInModal";
import SearchBar from "./SearchBar";

const navLinks = [
    { name: "Home", path: "/" },
    { name: "Web3", path: "/web3" },
    { name: "Programming", path: "/programming" },
    { name: "Contact", path: "/contact" },
    { name: "Authors", path: "/authors" },
];

const Header: React.FC = () => {
    const { theme, userData, isLoggedIn } = useSelector((state: RootState) => state.global);
    const dispatch = useDispatch();

    const [isAuthModal, setIsAuthModal] = useState(false);
    const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newTheme);
        dispatch(setTheme(newTheme));
    };

    const renderIcon = (type: "theme" | "search" | "menu" | "close") => {
        const icons = {
            theme: theme === "light" ? (
                <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path>
            ) : (
                <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79zM1 10.5h3v2H1zM11 .55h2V3.5h-2z"></path>
            ),
            search: <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8z"></path>,
            menu: <path d="M16 5H0V4h16v1zm0 8H0v-1h16v1zm0-4.008H0V8h16v.992z"></path>,
            close: <path d="M7.116 8l-4.558 4.558.884.884L8 8.884l4.558 4.558.884-.884L8.884 8l4.558-4.558-.884-.884L8 7.116 3.442 2.558l-.884.884L7.116 8z"></path>,
        };
        return <svg className="w-5 h-auto" viewBox="0 0 24 24">{icons[type]}</svg>;
    };

    return (
        <div className="sticky top-0 z-40 shadow-md bg-background transition-colors">
            <header className="py-5 px-5 sm:px-8 flex items-center w-full text-black dark:text-white">
                <Link to="/" className="font-bold text-lg">EliteBlog</Link>

                <nav className="ml-auto hidden lg:flex gap-5">
                    {navLinks.map((link) => (
                        <Link key={link.path} className="nav__link" to={link.path}>{link.name}</Link>
                    ))}
                    {isLoggedIn ? (
                        <Link to="/dashboard">
                            <img src={userData?.avatarUrl || "/images/avatar.png"} alt="User Avatar" className="w-8 h-8 rounded-full" />
                        </Link>
                    ) : (
                        <button onClick={() => setIsAuthModal(!isAuthModal)} className="nav__link">Signin</button>
                    )}
                </nav>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <button aria-label="Toggle Theme" onClick={toggleTheme} className="p-1.5">
                        {renderIcon("theme")}
                    </button>
                    <button aria-label="Search" onClick={() => setIsSearchBarOpen(!isSearchBarOpen)} className="p-1.5">
                        {renderIcon("search")}
                    </button>

                    {/* Mobile Menu */}
                    <div className="lg:hidden relative">
                        <button aria-label="Toggle Menu" className="p-1.5">{renderIcon("menu")}</button>
                        <ul className="absolute right-0 top-full w-[200px] bg-background border dark:border-gray-600 rounded-lg p-4 mt-2">
                            {navLinks.map((link) => (
                                <li key={link.path}>
                                    <Link className="nav__link" to={link.path}>{link.name}</Link>
                                </li>
                            ))}
                            {isLoggedIn ? (
                                <li>
                                    <Link to="/dashboard">
                                        <img src={userData?.avatarUrl || "/images/avatar.png"} alt="User Avatar" className="w-8 h-8 rounded-full" />
                                    </Link>
                                </li>
                            ) : (
                                <li>
                                    <button onClick={() => setIsAuthModal(!isAuthModal)} className="nav__link">Signin</button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </header>

            {/* Modals */}
            <SignInModal isOpen={isAuthModal} onClose={() => setIsAuthModal(false)} />
            {isSearchBarOpen && <SearchBar isOpen={isSearchBarOpen} onClose={() => setIsSearchBarOpen(false)} />}
        </div>
    );
};

export default Header;
