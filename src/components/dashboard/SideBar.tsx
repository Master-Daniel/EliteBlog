import React from 'react';
import {
    Home,
    Category,
    PostAdd,
    ListAlt,
    Comment,
    BarChart,
    ExitToApp,
    AdminPanelSettings,
    VerifiedUser,
    Settings,
    Person,
    Bookmark,
    Star
} from "@mui/icons-material";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { deleteCookie } from '../../utils/custom-functions';
import { setIsLoggedIn, setIsSidebarOpen, setUserData } from '../../redux/slices/globalSlice';

const SideBar: React.FC = () => {
    const { isSidebarOpen, userData } = useSelector((state: RootState) => state.global);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isAdmin = userData?.role === 'admin';

    const handleLogout = () => {
        deleteCookie('elite-blog');
        dispatch(setUserData({}));
        dispatch(setIsLoggedIn(false));
        navigate('/');
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 dark:bg-white/20 backdrop-blur-sm z-[45] transition-opacity ${isSidebarOpen ? "block" : "hidden"} md:hidden`}
                onClick={() => dispatch(setIsSidebarOpen(false))}
            />
            <aside
                className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-black shadow-lg p-5 flex flex-col justify-between transform transition-transform z-40  
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 md:w-64 md:h-screen z-50`}
            >
                <nav className="flex-1 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                        {isAdmin ? 'Admin Panel' : 'Blog Dashboard'}
                    </h2>
                    <ul className="space-y-4">
                        <li className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400">
                            <Link to="/dashboard" className="flex items-center space-x-2"><Home /> <span>Dashboard</span></Link>
                        </li>
                        <li className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400">
                            <Link to="/dashboard/categories" className="flex items-center space-x-2"><Category /> <span>Categories</span></Link>
                        </li>
                        <li className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400">
                            <Link to="/dashboard/create-post" className="flex items-center space-x-2"><PostAdd /> <span>Create Post</span></Link>
                        </li>
                        <li className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400">
                            <Link to="/dashboard/post-list" className="flex items-center space-x-2"><ListAlt /> <span>Post List</span></Link>
                        </li>
                        <li className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400">
                            <Link to="/dashboard/comment-management" className="flex items-center space-x-2"><Comment /> <span>Comments</span></Link>
                        </li>
                        <li className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400">
                            <Link to="/dashboard/analytics" className="flex items-center space-x-2"><BarChart /> <span>Analytics</span></Link>
                        </li>
                        <li className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400">
                            <Link to="/dashboard/bookmarks" className="flex items-center space-x-2"><Bookmark /> <span>Bookmarks</span></Link>
                        </li>
                        <li className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400">
                            <Link to="/dashboard/profile" className="flex items-center space-x-2"><Person /> <span>My Profile</span></Link>
                        </li>
                    </ul>

                    {/* Admin Only Section */}
                    {isAdmin && (
                        <>
                            <div className="mt-6 mb-2">
                                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                    Admin
                                </span>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400">
                                    <Link to="/dashboard/admin/verify-post" className="flex items-center space-x-2">
                                        <VerifiedUser /> <span>Approve Posts</span>
                                    </Link>
                                </li>
                                <li className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400">
                                    <Link to="/dashboard/admin/featured-posts" className="flex items-center space-x-2">
                                        <Star /> <span>Featured Posts</span>
                                    </Link>
                                </li>
                                <li className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400">
                                    <Link to="/dashboard/admin/users" className="flex items-center space-x-2">
                                        <AdminPanelSettings /> <span>Manage Users</span>
                                    </Link>
                                </li>
                                <li className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400">
                                    <Link to="/dashboard/admin/settings" className="flex items-center space-x-2">
                                        <Settings /> <span>Site Settings</span>
                                    </Link>
                                </li>
                            </ul>
                        </>
                    )}
                </nav>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    {isAdmin && (
                        <div className="mb-3 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs text-blue-700 dark:text-blue-300 text-center">
                            Admin Account
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex cursor-pointer items-center space-x-2 text-red-500 hover:text-red-600 w-full"
                    >
                        <ExitToApp /> <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default SideBar;
