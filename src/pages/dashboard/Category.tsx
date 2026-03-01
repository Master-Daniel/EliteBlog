import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import DataTable from "react-data-table-component";
import { getDataTableTheme } from "../../utils/dataTableThemes";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../../api/axiosConfig";
import DataTableLoader from "../../components/DataTableLoader";
import usePageTitle from "../../hooks/usePageTitle";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";


const CategoryPage: React.FC = () => {
    usePageTitle("Categories");
    const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<{ id: string; name: string } | null>(null);
    const queryClient = useQueryClient();
    const { theme } = useSelector((state: RootState) => state.global);

    // Fetch categories
    const { data: categories, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const response = await axiosInstance.get("/category/fetch-all");
            return response.data;
        },
    });

    // Mutation for adding a new category
    const addCategoryMutation = useMutation({
        mutationFn: async (newCategory: string) => {
            await axiosInstance.post("/category/create", { name: newCategory });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Category added successfully");
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message || "Failed to add category");
        },
    });

    // Mutation for updating a category
    const updateCategoryMutation = useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            await axiosInstance.patch(`/category/update/${id}`, { name });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setEditingCategory(null);
            toast.success("Category updated successfully");
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message || "Failed to update category");
        },
    });

    // Mutation for deleting a category
    const deleteCategoryMutation = useMutation({
        mutationFn: async (id: string) => {
            await axiosInstance.delete(`/category/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setDeletingCategory(null);
            toast.success("Category deleted successfully");
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message || "Failed to delete category");
            setDeletingCategory(null);
        },
    });

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
            cell: (row: { name: string }) => (
                <span className="text-gray-900 dark:text-white font-medium">{row.name}</span>
            ),
        },
        {
            name: "Actions",
            width: '400px',
            cell: (row: { id: string; name: string }) => (
                <div className="flex space-x-3 p-2 items-center">
                    {editingCategory && editingCategory.id === row.id ? (
                        <Formik
                            initialValues={{ name: row.name }}
                            validationSchema={validationSchema}
                            enableReinitialize
                            onSubmit={(values) => {
                                updateCategoryMutation.mutate({ id: row.id, name: values.name });
                            }}
                        >
                            {() => (
                                <Form className="flex space-x-2 items-center">
                                    <Field
                                        type="text"
                                        name="name"
                                        className="px-3 py-2 h-9 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={updateCategoryMutation.isPending}
                                        className="px-4 h-9 cursor-pointer bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                                    >
                                        {updateCategoryMutation.isPending ? "..." : "Save"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingCategory(null)}
                                        className="cursor-pointer p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        title="Cancel"
                                    >
                                        <CloseIcon fontSize="small" />
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    ) : (
                        <>
                            <button
                                type="button"
                                aria-label="Edit category"
                                title="Edit"
                                onClick={() => setEditingCategory(row)}
                                className="cursor-pointer p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                            >
                                <EditIcon fontSize="small" />
                            </button>
                            <button
                                type="button"
                                aria-label="Delete category"
                                title="Delete"
                                onClick={() => setDeletingCategory(row)}
                                className="cursor-pointer p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            >
                                <DeleteIcon fontSize="small" />
                            </button>
                        </>
                    )}
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
        },
    ];    

    return (
        <div className="flex h-screen overflow-hidden">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0">
                <Header />
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Manage Categories</h1>

                    {/* Add Category Form */}
                    <Formik
                        initialValues={{ name: "" }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { resetForm }) => {
                            addCategoryMutation.mutate(values.name, {
                                onSuccess: () => resetForm(),
                            });
                        }}
                    >
                        {() => (
                            <Form className="mb-8">
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Add New Category
                                </label>
                                <div className="flex items-center gap-4">
                                    <Field
                                        type="text"
                                        name="name"
                                        placeholder="Enter category name..."
                                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        disabled={addCategoryMutation.isPending}
                                        className="cursor-pointer px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {addCategoryMutation.isPending ? "Adding..." : "Add Category"}
                                    </button>
                                </div>
                                <ErrorMessage name="name" component="div" className="text-red-500 dark:text-red-400 text-sm mt-2" />
                            </Form>
                        )}
                    </Formik>

                    {/* Category List Table */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            All Categories ({categories?.length || 0})
                        </h2>
                        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            {isLoading ? (
                                <DataTableLoader text="Loading Categories..." />
                            ) : categories?.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                                    <p>No categories found. Add your first category above.</p>
                                </div>
                            ) : (
                                <DataTable
                                    columns={columns}
                                    data={categories || []}
                                    highlightOnHover
                                    pagination
                                    theme={getDataTableTheme(theme)}
                                    customStyles={{
                                        headCells: {
                                            style: {
                                                fontWeight: '600',
                                                fontSize: '14px',
                                            },
                                        },
                                        cells: {
                                            style: {
                                                fontSize: '14px',
                                            },
                                        },
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deletingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <DeleteIcon className="text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Category</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                            </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            Are you sure you want to delete the category <strong className="text-gray-900 dark:text-white">"{deletingCategory.name}"</strong>? 
                            Posts in this category may become uncategorized.
                        </p>
                        
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingCategory(null)}
                                className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => deleteCategoryMutation.mutate(deletingCategory.id)}
                                disabled={deleteCategoryMutation.isPending}
                                className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
