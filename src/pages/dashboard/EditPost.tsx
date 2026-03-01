import React, { useRef, useEffect, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../api/axiosConfig";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";
import TextEditor from "../../components/dashboard/TextEditor";
import KeywordInput from "../../components/Posts/KeywordInput";
import CategorySelect from "../../components/Posts/CategorySelect";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import usePageTitle from "../../hooks/usePageTitle";
import { useParams, useNavigate, Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import SEOAnalysis from "../../components/Posts/SEOAnalysis";

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
    status: "draft" | "under_review" | "published" | "rejected";
}

interface PostData {
    id: string;
    title: string;
    description: string;
    keywords: string[];
    slug: string;
    canonicalUrl?: string;
    schemaMarkup?: string;
    category?: { id: string };
    tags: string[];
    featuredImage?: string;
    content: string;
    status: string;
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
    status: Yup.string().oneOf(["draft", "under_review", "published", "rejected"]).required("Select a status"),
});

const EditPost: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    usePageTitle("Edit Post");
    const { userData } = useSelector((state: RootState) => state.global);
    const contentRef = useRef<{ reset: () => void; setContent: (content: string) => void } | null>(null);
    const [newImage, setNewImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data: post, isLoading: postLoading, error: postError } = useQuery<PostData>({
        queryKey: ["post", id],
        queryFn: async () => {
            const response = await axiosInstance.get(`/feed/edit/${id}`);
            return response.data;
        },
        enabled: !!id,
    });

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const response = await axiosInstance.get("/category/fetch-all");
            return response.data;
        },
    });

    useEffect(() => {
        if (post?.content && contentRef.current) {
            contentRef.current.setContent(post.content);
        }
    }, [post?.content]);

    const updateMutation = useMutation({
        mutationKey: ["update-post"],
        mutationFn: async (postData: Partial<FormValues> & { newImage?: File | null }) => {
            const formData = new FormData();
            
            Object.entries(postData).forEach(([key, value]) => {
                if (key !== "newImage" && key !== "featuredImage" && value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        formData.append(key, value.join(","));
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });
            
            if (postData.newImage instanceof File) {
                formData.append("featuredImage", postData.newImage);
            }
            
            formData.append("user_id", userData?.id || "");
            
            const response = await axiosInstance.patch(`/feed/update/${post?.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success("Post updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["feeds"] });
            queryClient.invalidateQueries({ queryKey: ["post", id] });
            navigate("/dashboard/post-list");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.message || "Failed to update post. Please try again.";
            toast.error(errorMessage);
        },
    });

    if (postLoading) {
        return (
            <div className="flex h-screen overflow-hidden">
                <SideBar />
                <div className="flex flex-col flex-1 min-h-0">
                    <Header />
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 flex items-center justify-center">
                        <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading post...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (postError || !post) {
        return (
            <div className="flex h-screen overflow-hidden">
                <SideBar />
                <div className="flex flex-col flex-1 min-h-0">
                    <Header />
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Post not found</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">The post you're looking for doesn't exist.</p>
                            <Link to="/dashboard/post-list" className="text-blue-600 hover:underline">
                                Back to Post List
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const initialValues: FormValues = {
        user_id: userData?.id || "",
        title: post.title || "",
        description: post.description || "",
        keywords: Array.isArray(post.keywords) ? post.keywords : [],
        slug: post.slug || "",
        canonicalUrl: post.slug ? `https://elitecodec.com.ng/feed/${post.slug}` : "",
        schemaMarkup: post.schemaMarkup || "",
        category: post.category?.id || "",
        tags: Array.isArray(post.tags) ? post.tags : [],
        featuredImage: null,
        content: post.content || "",
        status: (post.status as FormValues["status"]) || "draft",
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0">
                <Header />
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                            title="Go back"
                        >
                            <ArrowBackIcon />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Post</h1>
                    </div>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        enableReinitialize
                        onSubmit={(values) => {
                            const updateData = {
                                title: values.title,
                                description: values.description,
                                keywords: values.keywords,
                                slug: values.slug,
                                canonicalUrl: values.canonicalUrl,
                                schemaMarkup: values.schemaMarkup,
                                category: values.category,
                                tags: values.tags,
                                content: values.content,
                                status: values.status,
                                newImage: newImage,
                            };
                            updateMutation.mutate(updateData);
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
                                    <TextEditor 
                                        ref={contentRef} 
                                        onChange={(content) => setFieldValue("content", content)}
                                        initialContent={post.content}
                                    />
                                    <ErrorMessage name="content" component="div" className="text-red-500 text-sm" />
                                </div>

                                {/* Featured Image Section */}
                                <div className="space-y-4">
                                    <label className="block font-medium text-gray-900 dark:text-white">Featured Image</label>
                                    
                                    {/* Current/Preview Image */}
                                    {(imagePreview || post.featuredImage) && (
                                        <div className="relative inline-block">
                                            <img
                                                src={imagePreview || `${import.meta.env.VITE_API_URL}/uploads/feeds/${post.featuredImage}`}
                                                alt="Featured"
                                                className="max-w-sm rounded-lg shadow-md"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                            {imagePreview && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setNewImage(null);
                                                        setImagePreview(null);
                                                    }}
                                                    className="cursor-pointer absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                    title="Remove new image"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </button>
                                            )}
                                            {!imagePreview && post.featuredImage && (
                                                <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                                                    Current Image
                                                </span>
                                            )}
                                            {imagePreview && (
                                                <span className="absolute bottom-2 left-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
                                                    New Image
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Upload New Image */}
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <CloudUploadIcon className="text-gray-500 dark:text-gray-400" />
                                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                                {imagePreview ? "Change Image" : post.featuredImage ? "Replace Image" : "Upload Image"}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 5 * 1024 * 1024) {
                                                            toast.error("Image must be less than 5MB");
                                                            return;
                                                        }
                                                        setNewImage(file);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setImagePreview(reader.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Max 5MB. Supported: JPEG, PNG, WebP
                                        </span>
                                    </div>
                                </div>

                                <RadioGroupField
                                    label="Publishing Options"
                                    name="status"
                                    options={[
                                        { label: "Save as Draft", value: "draft" },
                                        { label: "Submit for Review", value: "under_review" },
                                    ]}
                                />

                                <SEOAnalysis
                                    title={values.title}
                                    description={values.description}
                                    content={values.content}
                                    slug={values.slug}
                                    keywords={values.keywords}
                                    tags={values.tags}
                                    featuredImage={newImage}
                                />

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="cursor-pointer flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateMutation.isPending}
                                        className="cursor-pointer flex-1 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default EditPost;

interface FormFieldProps {
    label: string;
    name: string;
    placeholder: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

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

const TextAreaField = ({ label, name, value }: { label: string; name: string; value: string }) => (
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

const KeywordInputField = ({ label, name }: { label: string; name: string }) => (
    <div className="space-y-2">
        <label htmlFor={name} className="block font-medium text-gray-900 dark:text-white">{label}</label>
        <KeywordInput name={name} />
    </div>
);

interface RadioOption {
    label: string;
    value: string;
}

interface RadioGroupFieldProps {
    label: string;
    name: string;
    options: RadioOption[];
}

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
