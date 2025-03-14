import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";

// Interface for form values
interface GeneralSettingsFormValues {
    siteName: string;
    siteDescription: string;
    siteLogo: File | null;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    darkMode: boolean;
    emailNotifications: boolean;
    headerScript: string;
    footerScript: string;
}

// Validation schema using Yup
const validationSchema = Yup.object({
    siteName: Yup.string().required("Site name is required"),
    siteDescription: Yup.string().required("Description is required"),
    siteLogo: Yup.mixed().nullable(),
    metaTitle: Yup.string().required("Meta title is required"),
    metaDescription: Yup.string().required("Meta description is required"),
    metaKeywords: Yup.string().required("Meta keywords are required"),
    facebook: Yup.string().url("Enter a valid URL"),
    twitter: Yup.string().url("Enter a valid URL"),
    instagram: Yup.string().url("Enter a valid URL"),
    linkedin: Yup.string().url("Enter a valid URL"),
    headerScript: Yup.string(),
    footerScript: Yup.string(),
});

const GeneralSettingsPage: React.FC = () => {
    const initialValues: GeneralSettingsFormValues = {
        siteName: "",
        siteDescription: "",
        siteLogo: null,
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
        darkMode: false,
        emailNotifications: false,
        headerScript: "",
        footerScript: "",
    };

    const handleSubmit = (values: GeneralSettingsFormValues) => {
        console.log("Form submitted", values);
    };

    return (
        <div className="flex h-screen">
            <SideBar />
            <div className="flex flex-col flex-1 overflow-y-auto">
                <Header />
                <div className="flex-1 p-4 md:p-6">
                    <h1 className="text-2xl font-bold mb-6">General Settings</h1>

                    <div className="p-6 rounded-lg shadow-md">
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ setFieldValue, values }) => (
                                <Form className="space-y-4">
                                    {/* Site Name */}
                                    <div>
                                        <label className="block font-medium">Site Name</label>
                                        <Field
                                            type="text"
                                            name="siteName"
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                                        />
                                        <ErrorMessage name="siteName" component="p" className="text-red-500 text-sm" />
                                    </div>

                                    {/* Site Description */}
                                    <div>
                                        <label className="block font-medium">Site Description</label>
                                        <Field
                                            as="textarea"
                                            name="siteDescription"
                                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                                        />
                                        <ErrorMessage name="siteDescription" component="p" className="text-red-500 text-sm" />
                                    </div>

                                    {/* Logo Upload */}
                                    <div>
                                        <label className="block font-medium">Site Logo</label>
                                        <input
                                            type="file"
                                            onChange={(event) => setFieldValue("siteLogo", event.target.files?.[0] || null)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    {/* SEO Settings */}
                                    <h2 className="text-lg font-semibold mt-4">SEO Settings</h2>

                                    <div>
                                        <label className="block font-medium">Meta Title</label>
                                        <Field type="text" name="metaTitle" className="w-full p-2 border border-gray-300 rounded-md" />
                                        <ErrorMessage name="metaTitle" component="p" className="text-red-500 text-sm" />
                                    </div>

                                    <div>
                                        <label className="block font-medium">Meta Description</label>
                                        <Field as="textarea" name="metaDescription" className="w-full p-2 border border-gray-300 rounded-md" />
                                        <ErrorMessage name="metaDescription" component="p" className="text-red-500 text-sm" />
                                    </div>

                                    <div>
                                        <label className="block font-medium">Meta Keywords</label>
                                        <Field type="text" name="metaKeywords" className="w-full p-2 border border-gray-300 rounded-md" />
                                        <ErrorMessage name="metaKeywords" component="p" className="text-red-500 text-sm" />
                                    </div>

                                    {/* Social Media Links */}
                                    <h2 className="text-lg font-semibold mt-4">Social Media Links</h2>

                                    {["facebook", "twitter", "instagram", "linkedin"].map((platform) => (
                                        <div key={platform}>
                                            <label className="block font-medium capitalize">{platform}</label>
                                            <Field type="url" name={platform} className="w-full p-2 border border-gray-300 rounded-md" />
                                            <ErrorMessage name={platform} component="p" className="text-red-500 text-sm" />
                                        </div>
                                    ))}

                                    {/* Theme and Notifications */}
                                    <h2 className="text-lg font-semibold mt-4">Preferences</h2>

                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center space-x-2">
                                            <Field type="checkbox" name="darkMode" />
                                            <span>Enable Dark Mode</span>
                                        </label>

                                        <label className="flex items-center space-x-2">
                                            <Field type="checkbox" name="emailNotifications" />
                                            <span>Enable Email Notifications</span>
                                        </label>
                                    </div>

                                    {/* Custom Scripts */}
                                    <h2 className="text-lg font-semibold mt-4">Custom Scripts</h2>

                                    <div>
                                        <label className="block font-medium">Header Script</label>
                                        <Field as="textarea" name="headerScript" className="w-full p-2 border border-gray-300 rounded-md" />
                                    </div>

                                    <div>
                                        <label className="block font-medium">Footer Script</label>
                                        <Field as="textarea" name="footerScript" className="w-full p-2 border border-gray-300 rounded-md" />
                                    </div>

                                    {/* Submit Button */}
                                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                        Save Settings
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettingsPage;
