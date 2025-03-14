import React, { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Post {
    id: number;
    title: string;
    category: string;
    status: "Published" | "Draft";
}

const PostListPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([
        { id: 1, title: "React Guide", category: "Technology", status: "Published" },
        { id: 2, title: "Business Strategies", category: "Business", status: "Draft" },
        { id: 3, title: "Healthy Lifestyle", category: "Health", status: "Published" },
    ]);

    const deletePost = (id: number) => {
        setPosts(posts.filter(post => post.id !== id));
    };

    const columns: TableColumn<Post>[] = [
        {
            name: "Title",
            selector: (row) => row.title,
            sortable: true,
        },
        {
            name: "Category",
            selector: (row) => row.category,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => (
                <span className={`px-2 py-1 rounded text-white ${row.status === "Published" ? "bg-green-600" : "bg-yellow-500"}`}>
                    {row.status}
                </span>
            ),
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                        <EditIcon />
                    </button>
                    <button onClick={() => deletePost(row.id)} className="text-red-600 hover:text-red-800">
                        <DeleteIcon />
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
                    <h1 className="text-2xl font-bold mb-6">Post List</h1>
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

export default PostListPage;
