import { createBrowserRouter } from "react-router-dom";

import Welcome from "../pages/Welcome";
import Authors from "../pages/Authors";
import Author from "../pages/AuthorPage";
import Contact from "../pages/Contact";
import Layout from "../pages/dashboard/Layout";
import Dashboard from "../pages/dashboard/Welcome";
import CreatePost from "../pages/dashboard/CreatePost";
import CategoryPage from "../pages/dashboard/Category";
import PostListPage from "../pages/dashboard/PostList";
import CommentManagementPage from "../pages/dashboard/CommentManagement";
import GeneralSettingsPage from "../pages/dashboard/GeneralSettings";
import AdminLayout from "../pages/dashboard/AdminLayout";
import AdminPostApprovalPage from "../pages/dashboard/AdminPostApproval";
import FeedBody from "../pages/FeedBody";

const routes = createBrowserRouter([
    {
        path: "/",
        children: [
            { index: true, element: <Welcome /> },
            { path: 'authors', element: <Authors /> },
            { path: 'author/:id', element: <Author /> },
            { path: 'contact', element: <Contact /> },
            { path: 'feed/:slug', element: <FeedBody />},
            { path: '/auth/github/callback', element: <Welcome /> },
            {
                path: 'dashboard',
                element: <Layout />,
                children: [
                    { index: true, element: <Dashboard />},
                    { path: 'create-post', element: <CreatePost />},
                    { path: 'post-list', element: <PostListPage />},
                    { path: 'comment-management', element: <CommentManagementPage />},
                    { path: 'categories', element: <CategoryPage />},
                    { 
                        path: 'admin', 
                        element: <AdminLayout />,
                        children: [
                            { index: true, element: <GeneralSettingsPage /> },
                            { path: 'verify-post', element: <AdminPostApprovalPage /> },
                        ]
                    },
                ]
            }
            // { path: "*", element: <NotFound /> }, // Catch-all for unknown routes
        ],
    },
]);

export default routes;
