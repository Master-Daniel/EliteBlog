import React, { useState } from "react";
import DataTable from "react-data-table-component";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface Post {
    id: number;
    title: string;
    author: string;
    category: string;
    status: "Pending" | "Approved" | "Rejected";
}

const AdminPostApprovalPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([
        { id: 1, title: "AI Trends", author: "John Doe", category: "Technology", status: "Pending" },
        { id: 2, title: "Startup Growth", author: "Jane Smith", category: "Business", status: "Pending" },
    ]);

    const updatePostStatus = (id: number, status: "Approved" | "Rejected") => {
        setPosts(posts.map(post => (post.id === id ? { ...post, status } : post)));
    };

    const columns = [
        {
            name: "Title",
            selector: (row: Post) => row.title,
            sortable: true,
        },
        {
            name: "Author",
            selector: (row: Post) => row.author,
            sortable: true,
        },
        {
            name: "Category",
            selector: (row: Post) => row.category,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row: Post) => row.status,
            sortable: true,
            cell: (row: Post) => (
                <span className={`px-2 py-1 rounded text-white ${row.status === "Approved" ? "bg-green-600" : row.status === "Rejected" ? "bg-red-600" : "bg-yellow-500"}`}>
                    {row.status}
                </span>
            ),
        },
        {
            name: "Actions",
            cell: (row: Post) => (
                <div className="flex space-x-2">
                    <button onClick={() => updatePostStatus(row.id, "Approved")} className="text-green-600 hover:text-green-800">
                        <CheckCircleIcon />
                    </button>
                    <button onClick={() => updatePostStatus(row.id, "Rejected")} className="text-red-600 hover:text-red-800">
                        <CancelIcon />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-black">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0">
                <Header />
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <h1 className="text-2xl font-bold mb-6">Post Approval</h1>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                        <DataTable
                            columns={columns}
                            data={posts}
                            pagination
                            highlightOnHover
                            responsive
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPostApprovalPage;
