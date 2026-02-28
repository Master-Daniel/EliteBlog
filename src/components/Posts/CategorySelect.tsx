import { useState } from "react";
import CreatableSelect from "react-select/creatable";
import { useField, useFormikContext } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosConfig";
import toast from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

interface CategoryOption {
    value: string;
    label: string;
    __isNew__?: boolean;
}

interface CategorySelectProps {
    name: string;
    categories?: { id: string; name: string }[];
}

const CategorySelect: React.FC<CategorySelectProps> = ({ name, categories = [] }) => {
    const [field] = useField(name);
    const { setFieldValue } = useFormikContext();
    const queryClient = useQueryClient();
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const categoryOptions: CategoryOption[] = categories.map((category) => ({
        value: category.id,
        label: category.name,
    }));

    const createCategoryMutation = useMutation({
        mutationFn: async (categoryName: string) => {
            const response = await axiosInstance.post("/category/create", { name: categoryName });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            setFieldValue(name, data.id);
            setShowCreateModal(false);
            setNewCategoryName("");
            toast.success(`Category "${data.name}" created successfully!`);
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || "Failed to create category");
        },
    });

    const handleChange = (selectedOption: CategoryOption | null) => {
        if (selectedOption?.__isNew__) {
            setNewCategoryName(selectedOption.label);
            setShowCreateModal(true);
        } else {
            setFieldValue(name, selectedOption ? selectedOption.value : "");
        }
    };

    const handleCreateCategory = () => {
        if (!newCategoryName.trim()) {
            toast.error("Category name cannot be empty");
            return;
        }
        createCategoryMutation.mutate(newCategoryName.trim());
    };

    return (
        <>
            <div className="space-y-2">
                <label htmlFor={name} className="block font-medium text-gray-900 dark:text-white">
                    Category
                </label>
                <CreatableSelect
                    id={name}
                    name={name}
                    options={categoryOptions}
                    value={categoryOptions.find((option) => option.value === field.value) || null}
                    onChange={handleChange}
                    placeholder="Select or create a category"
                    isClearable
                    formatCreateLabel={(inputValue) => (
                        <span className="flex items-center gap-2">
                            <AddIcon fontSize="small" />
                            Create "{inputValue}"
                        </span>
                    )}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                        control: (base) => ({
                            ...base,
                            backgroundColor: "var(--select-bg, white)",
                            borderColor: "var(--select-border, #d1d5db)",
                        }),
                        menu: (base) => ({
                            ...base,
                            backgroundColor: "var(--select-bg, white)",
                        }),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused
                                ? "var(--select-option-hover, #f3f4f6)"
                                : "transparent",
                            color: "var(--select-text, #111827)",
                        }),
                        singleValue: (base) => ({
                            ...base,
                            color: "var(--select-text, #111827)",
                        }),
                        placeholder: (base) => ({
                            ...base,
                            color: "var(--select-placeholder, #9ca3af)",
                        }),
                        input: (base) => ({
                            ...base,
                            color: "var(--select-text, #111827)",
                        }),
                    }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Type to search or create a new category
                </p>
            </div>

            {/* Create Category Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <AddIcon className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Create New Category
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewCategoryName("");
                                }}
                                className="cursor-pointer p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                title="Close"
                                aria-label="Close modal"
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="new-category-name"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Category Name
                                </label>
                                <input
                                    id="new-category-name"
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Enter category name"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleCreateCategory();
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewCategoryName("");
                                    }}
                                    className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreateCategory}
                                    disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                                    className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {createCategoryMutation.isPending ? (
                                        <>
                                            <svg
                                                className="animate-spin h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <AddIcon fontSize="small" />
                                            Create Category
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CategorySelect;
