import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";
import usePageTitle from "../../hooks/usePageTitle";

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
    usePageTitle("Settings");
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

    const inputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring focus:border-blue-300 dark:focus:border-blue-500";
    const labelClasses = "block font-medium text-gray-900 dark:text-white mb-1";
    const sectionHeadingClasses = "text-lg font-semibold mt-6 mb-3 text-gray-900 dark:text-white";

    return (
        <div className="flex h-screen overflow-hidden">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0">
                <Header />
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">General Settings</h1>

                    <div className="p-6 rounded-lg">
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ setFieldValue, }) => (
                                <Form className="space-y-4">
                                    {/* Site Name */}
                                    <div>
                                        <label className={labelClasses}>Site Name</label>
                                        <Field
                                            type="text"
                                            name="siteName"
                                            className={inputClasses}
                                        />
                                        <ErrorMessage name="siteName" component="p" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    {/* Site Description */}
                                    <div>
                                        <label className={labelClasses}>Site Description</label>
                                        <Field
                                            as="textarea"
                                            name="siteDescription"
                                            rows={3}
                                            className={inputClasses}
                                        />
                                        <ErrorMessage name="siteDescription" component="p" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    {/* Logo Upload */}
                                    <div>
                                        <label className={labelClasses}>Site Logo</label>
                                        <input
                                            aria-label="file"
                                            type="file"
                                            onChange={(event) => setFieldValue("siteLogo", event.target.files?.[0] || null)}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent text-gray-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                                        />
                                    </div>

                                    {/* SEO Settings */}
                                    <h2 className={sectionHeadingClasses}>SEO Settings</h2>

                                    <div>
                                        <label className={labelClasses}>Meta Title</label>
                                        <Field type="text" name="metaTitle" className={inputClasses} />
                                        <ErrorMessage name="metaTitle" component="p" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Meta Description</label>
                                        <Field as="textarea" name="metaDescription" rows={3} className={inputClasses} />
                                        <ErrorMessage name="metaDescription" component="p" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Meta Keywords</label>
                                        <Field type="text" name="metaKeywords" className={inputClasses} />
                                        <ErrorMessage name="metaKeywords" component="p" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    {/* Social Media Links */}
                                    <h2 className={sectionHeadingClasses}>Social Media Links</h2>

                                    {["facebook", "twitter", "instagram", "linkedin"].map((platform) => (
                                        <div key={platform}>
                                            <label className={labelClasses + " capitalize"}>{platform}</label>
                                            <Field type="url" name={platform} className={inputClasses} placeholder={`https://${platform}.com/...`} />
                                            <ErrorMessage name={platform} component="p" className="text-red-500 text-sm mt-1" />
                                        </div>
                                    ))}

                                    {/* Theme and Notifications */}
                                    <h2 className={sectionHeadingClasses}>Preferences</h2>

                                    <div className="flex flex-wrap items-center gap-6">
                                        <label className="flex items-center space-x-2 text-gray-900 dark:text-white cursor-pointer">
                                            <Field type="checkbox" name="darkMode" className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
                                            <span>Enable Dark Mode</span>
                                        </label>

                                        <label className="flex items-center space-x-2 text-gray-900 dark:text-white cursor-pointer">
                                            <Field type="checkbox" name="emailNotifications" className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
                                            <span>Enable Email Notifications</span>
                                        </label>
                                    </div>

                                    {/* Custom Scripts */}
                                    <h2 className={sectionHeadingClasses}>Custom Scripts</h2>

                                    <div>
                                        <label className={labelClasses}>Header Script</label>
                                        <Field as="textarea" name="headerScript" rows={4} className={inputClasses + " font-mono text-sm"} placeholder="<!-- Add custom header scripts here -->" />
                                    </div>

                                    <div>
                                        <label className={labelClasses}>Footer Script</label>
                                        <Field as="textarea" name="footerScript" rows={4} className={inputClasses + " font-mono text-sm"} placeholder="<!-- Add custom footer scripts here -->" />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <button type="submit" className="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                            Save Settings
                                        </button>
                                    </div>
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
