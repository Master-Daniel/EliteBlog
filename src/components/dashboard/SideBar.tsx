import React from 'react';
import {
    Home,
    Category,
    PostAdd,
    ListAlt,
    Comment,
    BarChart,
    ExitToApp
} from "@mui/icons-material";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { deleteCookie } from '../../utils/custom-functions';
import { setIsLoggedIn, setIsSidebarOpen, setUserData } from '../../redux/slices/globalSlice';

const SideBar: React.FC = () => {
    const isSidebarOpen = useSelector((state: RootState) => state.global.isSidebarOpen);
    const dispatch = useDispatch();
    const navigate = useNavigate();

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
                <nav>
                    <h2 className="text-xl font-bold mb-4">Blog Admin</h2>
                    <ul className="space-y-4">
                        <li className="flex items-center space-x-2 cursor-pointer hover:text-gray-500">
                            <Link to="/dashboard"><Home /> <span>Dashboard</span></Link>
                        </li>
                        <li className="flex items-center space-x-2 cursor-pointer hover:text-gray-500">
                            <Link to="/dashboard/categories"><Category /> <span>Categories</span></Link>
                        </li>
                        <li className="flex items-center space-x-2 cursor-pointer hover:text-gray-500">
                            <Link to="/dashboard/create-post"><PostAdd /> <span>Create Post</span></Link>
                        </li>
                        <li className="flex items-center space-x-2 cursor-pointer hover:text-gray-500">
                            <Link to="/dashboard/post-list"><ListAlt /> <span>Post List</span></Link>
                        </li>
                        <li className="flex items-center space-x-2 cursor-pointer hover:text-gray-500">
                            <Link to="/dashboard/comment-management"><Comment /> <span>Comment Management</span></Link>
                        </li>
                        <li className="flex items-center space-x-2 cursor-pointer hover:text-gray-500">
                            <Link to="/dashboard/analytics"><BarChart /> <span>Analytics</span></Link>
                        </li>
                    </ul>
                </nav>
                <button
                    onClick={handleLogout}
                    className="flex cursor-pointer items-center space-x-2 text-red-500 hover:text-red-600"
                >
                    <ExitToApp /> <span>Logout</span>
                </button>
            </aside>
        </>
    );
};

export default SideBar;
