import React, { useState } from "react";
import DataTable from "react-data-table-component";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";

interface Comment {
    id: number;
    author: string;
    content: string;
    status: "Pending" | "Approved";
}

const CommentManagementPage: React.FC = () => {
    const [comments, setComments] = useState<Comment[]>([
        { id: 1, author: "John Doe", content: "Great article!", status: "Pending" },
        { id: 2, author: "Jane Smith", content: "Very informative, thanks!", status: "Approved" },
        { id: 3, author: "Mike Lee", content: "I disagree with this point...", status: "Pending" },
    ]);

    const approveComment = (id: number) => {
        setComments(comments.map(comment => 
            comment.id === id ? { ...comment, status: "Approved" } : comment
        ));
    };

    const deleteComment = (id: number) => {
        setComments(comments.filter(comment => comment.id !== id));
    };

    const columns = [
        {
            name: "Author",
            selector: (row: Comment) => row.author,
            sortable: true,
        },
        {
            name: "Comment",
            selector: (row: Comment) => row.content,
            sortable: false,
            wrap: true,
        },
        {
            name: "Status",
            selector: (row: Comment) => row.status,
            sortable: true,
            cell: (row: Comment) => (
                <span className={`px-2 py-1 rounded text-white ${row.status === "Approved" ? "bg-green-600" : "bg-yellow-500"}`}>
                    {row.status}
                </span>
            ),
        },
        {
            name: "Actions",
            cell: (row: Comment) => (
                <div className="flex space-x-2">
                    {row.status === "Pending" && (
                        <button onClick={() => approveComment(row.id)} className="text-green-600 hover:text-green-800">
                            <CheckIcon />
                        </button>
                    )}
                    <button onClick={() => deleteComment(row.id)} className="text-red-600 hover:text-red-800">
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
                    <h1 className="text-2xl font-bold mb-6">Comment Management</h1>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                        <DataTable
                            columns={columns}
                            data={comments}
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

export default CommentManagementPage;