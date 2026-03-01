import { createBrowserRouter } from "react-router-dom";

import RootLayout from "../components/RootLayout";
import Welcome from "../pages/Welcome";
import Authors from "../pages/Authors";
import Author from "../pages/AuthorPage";
import Contact from "../pages/Contact";
import Layout from "../pages/dashboard/Layout";
import Dashboard from "../pages/dashboard/Welcome";
import CreatePost from "../pages/dashboard/CreatePost";
import EditPost from "../pages/dashboard/EditPost";
import PreviewPost from "../pages/dashboard/PreviewPost";
import ProfilePage from "../pages/dashboard/Profile";
import BookmarksPage from "../pages/dashboard/Bookmarks";
import CategoryPage from "../pages/dashboard/Category";
import PostListPage from "../pages/dashboard/PostList";
import CommentManagementPage from "../pages/dashboard/CommentManagement";
import GeneralSettingsPage from "../pages/dashboard/GeneralSettings";
import AdminLayout from "../pages/dashboard/AdminLayout";
import AdminPostApprovalPage from "../pages/dashboard/AdminPostApproval";
import Analytics from "../pages/dashboard/Analytics";
import AdminSetup from "../pages/dashboard/AdminSetup";
import UserManagement from "../pages/dashboard/UserManagement";
import FeaturedPosts from "../pages/dashboard/FeaturedPosts";
import FeedBody from "../pages/FeedBody";
import CategoryFeeds from "../pages/CategoryFeeds";
import TagFeeds from "../pages/TagFeeds";
import AllFeeds from "../pages/AllFeeds";
import NotFound from "../pages/NotFound";

const routes = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <Welcome /> },
            { path: 'authors', element: <Authors /> },
            { path: 'author/:id', element: <Author /> },
            { path: 'contact', element: <Contact /> },
            { path: 'feed/:slug', element: <FeedBody />},
            { path: 'feed/category/:categoryName', element: <CategoryFeeds />},
            { path: 'feed/tags/:tagName', element: <TagFeeds />},
            { path: 'all-posts', element: <AllFeeds />},
            { path: '/auth/github/callback', element: <Welcome /> },
            { path: 'admin-setup', element: <AdminSetup /> },
            {
                path: 'dashboard',
                element: <Layout />,
                children: [
                    { index: true, element: <Dashboard />},
                    { path: 'create-post', element: <CreatePost />},
                    { path: 'edit-post/:id', element: <EditPost />},
                    { path: 'preview/:id', element: <PreviewPost />},
                    { path: 'profile', element: <ProfilePage />},
                    { path: 'bookmarks', element: <BookmarksPage />},
                    { path: 'post-list', element: <PostListPage />},
                    { path: 'comment-management', element: <CommentManagementPage />},
                    { path: 'categories', element: <CategoryPage />},
                    { path: 'analytics', element: <Analytics />},
                    { 
                        path: 'admin', 
                        element: <AdminLayout />,
                        children: [
                            { index: true, element: <GeneralSettingsPage /> },
                            { path: 'verify-post', element: <AdminPostApprovalPage /> },
                            { path: 'featured-posts', element: <FeaturedPosts /> },
                            { path: 'users', element: <UserManagement /> },
                        ]
                    },
                ]
            },
            { path: "*", element: <NotFound /> },
        ],
    },
]);

export default routes;
