import React, { useState } from "react";
import { Card, CardContent } from "@mui/material";
import DataTable, { TableColumn } from "react-data-table-component";
import Header from "../../components/Header";
import SideBar from "../../components/dashboard/SideBar";

interface Post {
    id: number;
    title: string;
    views: string;
    comments: string;
    date: string;
}

const columns: TableColumn<Post>[] = [
    {
        name: "Title",
        selector: (row: Post) => row.title,
        sortable: true,
    },
    {
        name: "Views",
        selector: (row: Post) => row.views,
        sortable: true,
    },
    {
        name: "Comments",
        selector: (row: Post) => row.comments,
        sortable: true,
    },
    {
        name: "Date",
        selector: (row: Post) => row.date,
        sortable: true,
    },
];

const data: Post[] = [
    {
        id: 1,
        title: "Understanding React Hooks",
        views: "12.5K",
        comments: "340",
        date: "Mar 5, 2025",
    }
];

const Dashboard: React.FC = () => {

    return (
        <div className="flex h-screen">
            <SideBar />
            <div className="flex-1 w-full overflow-y-auto">
                <Header />
                <h1 className="text-2xl font-bold mb-6 mt-10 px-6">Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 px-6">
                    <Card className="w-full">
                        <CardContent>
                            <h3 className="text-lg font-semibold">Total Posts</h3>
                            <p className="text-2xl font-bold">120</p>
                        </CardContent>
                    </Card>
                    <Card className="w-full">
                        <CardContent>
                            <h3 className="text-lg font-semibold">Total Views</h3>
                            <p className="text-2xl font-bold">45.8K</p>
                        </CardContent>
                    </Card>
                    <Card className="w-full">
                        <CardContent>
                            <h3 className="text-lg font-semibold">Total Comments</h3>
                            <p className="text-2xl font-bold">3.2K</p>
                        </CardContent>
                    </Card>
                    <Card className="w-full">
                        <CardContent>
                            <h3 className="text-lg font-semibold">Loyalty Points</h3>
                            <p className="text-2xl font-bold">5,200</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Posts Table */}
                <div className="shadow-lg px-6 rounded-lg w-full overflow-x-auto pb-6">
                    <h2 className="text-lg font-semibold mb-4">Recent Posts</h2>
                    <Card className="w-full">
                        <CardContent>
                            <DataTable columns={columns} data={data} pagination />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
