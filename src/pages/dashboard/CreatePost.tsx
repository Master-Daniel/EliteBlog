import React, { useRef } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosConfig";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";
import TextEditor from "../../components/dashboard/TextEditor";
import KeywordInput from "../../components/Posts/KeywordInput";
import CategorySelect from "../../components/Posts/CategorySelect";
import SEOAnalysis from "../../components/Posts/SEOAnalysis";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import usePageTitle from "../../hooks/usePageTitle";

interface FormValues {
    user_id: string;
    title: string;
    description: string;
    keywords: string[];
    slug: string;
    canonicalUrl: string;
    schemaMarkup: string;
    category: string;
    tags: string[];
    featuredImage: File | null;
    content: string;
    status: "draft" | "under_review";
}

const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string()
        .required("Meta description is required")
        .max(160, "Meta description should be less than 160 characters"),
    keywords: Yup.array().of(Yup.string()),
    slug: Yup.string().required("Slug is required"),
    canonicalUrl: Yup.string().url("Enter a valid URL"),
    schemaMarkup: Yup.string(),
    category: Yup.string().required("Category is required"),
    tags: Yup.array().of(Yup.string()),
    content: Yup.string().required("Content cannot be empty"),
    status: Yup.string().oneOf(["draft", "under_review"]).required("Select a status"),
});

const initialValues: FormValues = {
    user_id: "",
    title: "",
    description: "",
    keywords: [],
    slug: "",
    canonicalUrl: "",
    schemaMarkup: "",
    category: "",
    tags: [],
    featuredImage: null,
    content: "",
    status: "draft",
};

const CreatePost: React.FC = () => {
    usePageTitle("Create Post");
    const { userData } = useSelector((state: RootState) => state.global)
    const contentRef = useRef<{ reset: () => void } | null>(null);

    // Fetch categories
    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const response = await axiosInstance.get("/category/fetch-all");
            return response.data; // Assuming response.data is an array of categories
        },
    });

    // Submit Post
    const handleSubmit = useMutation({
        mutationKey: ["submit-post"],
        mutationFn: async (postData: FormValues) => {
            const formData = new FormData();

            // Append all fields except the image
            Object.entries(postData).forEach(([key, value]) => {
                if (key !== "featuredImage" && value !== undefined && value !== null) {
                    formData.append(key, String(value)); // Convert non-file values to strings
                }
            });

            // Append the image file (if it exists)
            if (postData.featuredImage instanceof File) {
                formData.append("featuredImage", postData.featuredImage);
            }

            const response = await axiosInstance.post("/feed/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            console.error("Post submission error:", error);
            const errorData = error.response?.data;
            
            if (errorData?.message) {
                if (Array.isArray(errorData.message)) {
                    errorData.message.forEach((msg: string) => toast.error(msg));
                } else {
                    toast.error(errorData.message);
                }
            } else if (errorData?.errors) {
                errorData.errors.forEach((err: { message?: string; constraints?: Record<string, string> }) => {
                    if (err.constraints) {
                        Object.values(err.constraints).forEach((msg) => toast.error(msg));
                    } else if (err.message) {
                        toast.error(err.message);
                    }
                });
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error("Failed to submit post. Please try again.");
            }
        },
    });

    return (
        <div className="flex h-screen overflow-hidden">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0">
                <Header />
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create Post</h1>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values, { resetForm }) => {
                            values.user_id = userData?.id as string;
                            handleSubmit.mutate(values, {
                                onSuccess: () => {
                                    toast.success("Post submitted successfully!");
                                    resetForm();
                                    contentRef.current?.reset();
                                },
                            });
                        }}
                    >
                        {({ setFieldValue, values }) => (
                            <Form className="space-y-6">
                                <FormField
                                    label="Title"
                                    name="title"
                                    placeholder="Enter your post title"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const titleValue = e.target.value;
                                        const slug = titleValue
                                            .toLowerCase()
                                            .replace(/\s+/g, "-")
                                            .replace(/[^a-z0-9-]/g, "");
                                        setFieldValue("title", titleValue);
                                        setFieldValue("slug", slug);
                                        setFieldValue(
                                            "canonicalUrl",
                                            `https://elitecodec.com.ng/feed/${slug}`
                                        );
                                    }}
                                />
                                <FormField label="Slug / URL" name="slug" placeholder="e.g. my-awesome-post" />
                                <FormField label="Canonical URL" name="canonicalUrl" placeholder="https://yourdomain.com/my-post" />
                                <TextAreaField label="Meta Description" name="description" value={values.description} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <KeywordInputField label="Keywords" name="keywords" />
                                    <KeywordInputField label="Tags" name="tags" />
                                </div>

                                <CategorySelect name="category" categories={categories} />

                                <div className="p-4 border border-dashed border-gray-400 dark:border-gray-600 rounded-md">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Search Result Preview:</p>
                                    <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                        {values.title || "Post Title"}
                                    </h2>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {values.description || "Meta description will appear here..."}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {values.canonicalUrl || "https://yourdomain.com/your-post"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block font-medium text-gray-900 dark:text-white">Content</label>
                                    <TextEditor ref={contentRef} onChange={(content) => setFieldValue("content", content)} />
                                    <ErrorMessage name="content" component="div" className="text-red-500 text-sm" />
                                </div>

                                <FileUploadField name="featuredImage" label="Featured Image" setFieldValue={setFieldValue} />

                                <RadioGroupField
                                    label="Publishing Options"
                                    name="status"
                                    options={[
                                        { label: "Save as Draft", value: "draft" },
                                        { label: "Publish Now", value: "under_review" },
                                    ]}
                                />

                                <SEOAnalysis
                                    title={values.title}
                                    description={values.description}
                                    content={values.content}
                                    slug={values.slug}
                                    keywords={values.keywords}
                                    tags={values.tags}
                                    featuredImage={values.featuredImage}
                                />

                                <button
                                    type="submit"
                                    className="cursor-pointer w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"
                                >
                                    {values.status === "draft" ? "Save Draft" : "Publish Post"}
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;

/* -------------------- Reusable Components -------------------- */

interface FileUploadFieldProps {
    name: string;
    label: string;
    setFieldValue: (field: string, value: File | null) => void;
}

// Radio Group Field
interface RadioOption {
    label: string;
    value: string;
}

interface RadioGroupFieldProps {
    label: string;
    name: string;
    options: RadioOption[]; // Fix: `options` should be an array
}

interface FormFieldProps {
    label: string;
    name: string;
    placeholder: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Fix: Accepts event parameter
}

// Generic Input Field
const FormField: React.FC<FormFieldProps> = ({ label, name, placeholder, onChange }) => (
    <div className="space-y-2">
        <label htmlFor={name} className="block font-medium text-gray-900 dark:text-white">{label}</label>
        <Field
            id={name}
            name={name}
            placeholder={placeholder}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring focus:border-blue-300"
            onChange={onChange}
        />
        <ErrorMessage name={name} component="div" className="text-red-500 text-sm" />
    </div>
);

// TextArea Field
const TextAreaField = ({ label, name, value }: { label: string, name: string, value: string }) => (
    <div className="space-y-2">
        <label htmlFor={name} className="block font-medium text-gray-900 dark:text-white">{label}</label>
        <Field as="textarea" id={name} name={name} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" rows={3} />
        <div className="text-sm text-gray-500 dark:text-gray-400 flex justify-between">
            <span>Optimal: 150-160 characters</span>
            <span>{value.length} characters</span>
        </div>
        <ErrorMessage name={name} component="div" className="text-red-500 text-sm" />
    </div>
);

// Keyword Input Field
const KeywordInputField = ({ label, name }: { label: string, name: string }) => (
    <div className="space-y-2">
        <label htmlFor={name} className="block font-medium text-gray-900 dark:text-white">{label}</label>
        <KeywordInput name={name} />
    </div>
);

// File Upload Field
const FileUploadField: React.FC<FileUploadFieldProps> = ({ name, label, setFieldValue }) => (
    <div className="space-y-2">
        <label htmlFor={name} className="block font-medium text-gray-900 dark:text-white">{label}</label>
        <input
            id={name}
            type="file"
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFieldValue(name, e.currentTarget.files?.[0] || null)
            }
            className="border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
    </div>
);

const RadioGroupField: React.FC<RadioGroupFieldProps> = ({ label, name, options }) => (
    <div className="space-y-2">
        <p className="block font-medium text-gray-900 dark:text-white">{label}</p>
        <div className="flex items-center space-x-4">
            {options.map((option) => (
                <label key={option.value} className="inline-flex items-center text-gray-700 dark:text-gray-200">
                    <Field type="radio" name={name} value={option.value} className="form-radio text-blue-600" />
                    <span className="ml-2">{option.label}</span>
                </label>
            ))}
        </div>
        <ErrorMessage name={name} component="div" className="text-red-500 text-sm" />
    </div>
);