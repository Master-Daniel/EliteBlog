import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import DataTable from "react-data-table-component";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
import { Card, CardContent } from "@mui/material";
import axiosInstance from "../../api/axiosConfig";
import DataTableLoader from "../../components/DataTableLoader";

const CategoryPage: React.FC = () => {
    const [editingCategory, setEditingCategory] = useState<{ id: number; name: string } | null>(null);
    const queryClient = useQueryClient();

    // Fetch categories
    const { data: categories, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const response = await axiosInstance.get("/category/fetch-all");
            return response.data; // Assuming response.data is an array of categories
        },
    });

    // Mutation for adding a new category
    const addCategoryMutation = useMutation({
        mutationFn: async (newCategory: string) => {
            await axiosInstance.post("/category/create", { name: newCategory });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] }); // Refetch categories
        },
    });

    // Mutation for updating a category
    const updateCategoryMutation = useMutation({
        mutationFn: async ({ id, name }: { id: number; name: string }) => {
            await axiosInstance.patch(`/category/update/${id}`, { name });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setEditingCategory(null);
        },
    });

    // Mutation for deleting a category
    // const deleteCategoryMutation = useMutation({
    //     mutationFn: async (id: number) => {
    //         await axiosInstance.delete(`/category/delete/${id}`);
    //     },
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({ queryKey: ["categories"] });
    //     },
    // });

    // Validation Schema using Yup
    const validationSchema = Yup.object().shape({
        name: Yup.string().trim().required("Category name is required"),
    });

    // Columns for DataTable
    const columns = [
        {
            name: "Category Name",
            selector: (row: { name: string }) => row.name,
            sortable: true,
        },
        {
            name: "Actions",
            width: '350px',
            cell: (row: { id: number; name: string }) => (
                <div className="flex space-x-4 p-4">
                    {editingCategory && editingCategory.id === row.id ? (
                        <Formik
                            initialValues={{ name: row.name }} // Use row.name directly
                            validationSchema={validationSchema}
                            enableReinitialize // Ensures Formik updates when switching categories
                            onSubmit={(values, { resetForm }) => {
                                updateCategoryMutation.mutate(
                                    { id: row.id, name: values.name },
                                    {
                                        onSuccess: () => {
                                            setEditingCategory(null);
                                            resetForm();
                                        },
                                    }
                                );
                            }}
                        >
                            {({ handleSubmit }) => (
                                <Form className="flex space-x-2 items-center">
                                    <Field
                                        type="text"
                                        name="name"
                                        className="p-3 h-10 border border-gray-300 rounded-md"
                                    />
                                    <button
                                        type="submit"
                                        onClick={() => handleSubmit()} // Ensure form submits properly
                                        className="w-24 h-8 cursor-pointer shadow-2xl border rounded-md"
                                    >
                                        Save
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    ) : (
                        <button
                            type="button"
                            aria-label="edit"
                            onClick={() => setEditingCategory(row)}
                            className="text-blue-600 cursor-pointer hover:text-blue-800"
                        >
                            <EditIcon fontSize="small" />
                        </button>
                    )}
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];    

    return (
        <div className="flex h-screen overflow-hidden">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0">
                <Header />
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>

                    {/* Add Category Form */}
                    <Formik
                        initialValues={{ name: "" }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { resetForm }) => {
                            addCategoryMutation.mutate(values.name);
                            resetForm();
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="flex-col mb-6">
                                <div className="flex items-center space-x-4">
                                    <Field
                                        type="text"
                                        name="name"
                                        placeholder="Enter new category"
                                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-inherit dark:bg-white dark:text-black font-bold h-11 cursor-pointer border w-24 rounded-md"
                                    >
                                        Add
                                    </button>
                                </div>
                                <ErrorMessage name="name" component="div" className="text-red-600" />
                            </Form>
                        )}
                    </Formik>

                    {/* Category List Table */}
                    <div className="rounded-lg shadow-md">
                        <Card>
                            <CardContent>
                                {isLoading ? (
                                    <DataTableLoader text="Loading Categories..." />
                                ) : (
                                    <DataTable
                                        columns={columns}
                                        data={categories || []}
                                        highlightOnHover
                                        pagination
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
