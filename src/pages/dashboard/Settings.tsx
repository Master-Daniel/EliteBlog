import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";
import axiosInstance from "../../api/axiosConfig";
import usePageTitle from "../../hooks/usePageTitle";
import toast from "react-hot-toast";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";
import LanguageIcon from "@mui/icons-material/Language";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface SiteSettings {
    siteName: string;
    siteDescription: string;
    logoUrl: string;
    faviconUrl: string;
    supportEmail: string;
    phone: string;
    address: string;
    twitterUrl: string;
    facebookUrl: string;
    instagramUrl: string;
    linkedinUrl: string;
    youtubeUrl: string;
    githubUrl: string;
    footerText: string;
    copyrightText: string;
}

const SettingsPage: React.FC = () => {
    usePageTitle("Site Settings");
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<SiteSettings>({
        siteName: '',
        siteDescription: '',
        logoUrl: '',
        faviconUrl: '',
        supportEmail: '',
        phone: '',
        address: '',
        twitterUrl: '',
        facebookUrl: '',
        instagramUrl: '',
        linkedinUrl: '',
        youtubeUrl: '',
        githubUrl: '',
        footerText: '',
        copyrightText: '',
    });

    const { data: settings, isLoading } = useQuery<SiteSettings>({
        queryKey: ["admin-settings"],
        queryFn: async () => {
            const response = await axiosInstance.get("/settings");
            return response.data;
        },
    });

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const updateMutation = useMutation({
        mutationFn: async (data: Partial<SiteSettings>) => {
            const response = await axiosInstance.put("/settings", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
            queryClient.invalidateQueries({ queryKey: ["public-settings"] });
            toast.success("Settings updated successfully!");
        },
        onError: (error: { message?: string }) => {
            console.error("Settings update error:", error);
            toast.error(error.message || "Failed to update settings");
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen overflow-hidden">
                <SideBar />
                <div className="flex flex-col flex-1 min-h-0">
                    <Header />
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0">
                <Header />
                <div className="flex-1 overflow-y-auto p-6 text-gray-900 dark:text-white">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <SettingsIcon className="text-3xl" />
                            <h1 className="text-2xl font-bold">Site Settings</h1>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* General Settings */}
                            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <LanguageIcon /> General Settings
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Site Name</label>
                                        <input
                                            type="text"
                                            name="siteName"
                                            value={formData.siteName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="EliteBlog"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Site Description</label>
                                        <input
                                            type="text"
                                            name="siteDescription"
                                            value={formData.siteDescription}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Tech, Programming & Lifestyle Blog"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Logo URL</label>
                                        <input
                                            type="text"
                                            name="logoUrl"
                                            value={formData.logoUrl}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="/logo.png"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Favicon URL</label>
                                        <input
                                            type="text"
                                            name="faviconUrl"
                                            value={formData.faviconUrl}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="/favicon.ico"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Contact Information */}
                            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <EmailIcon /> Contact Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                                            <EmailIcon fontSize="small" /> Support Email
                                        </label>
                                        <input
                                            type="email"
                                            name="supportEmail"
                                            value={formData.supportEmail}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="support@eliteblog.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                                            <PhoneIcon fontSize="small" /> Phone
                                        </label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                                            <LocationOnIcon fontSize="small" /> Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="123 Main Street, City, Country"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Social Media Links */}
                            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Social Media Links</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Twitter URL</label>
                                        <input
                                            type="url"
                                            name="twitterUrl"
                                            value={formData.twitterUrl}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="https://twitter.com/yourhandle"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Facebook URL</label>
                                        <input
                                            type="url"
                                            name="facebookUrl"
                                            value={formData.facebookUrl}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="https://facebook.com/yourpage"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Instagram URL</label>
                                        <input
                                            type="url"
                                            name="instagramUrl"
                                            value={formData.instagramUrl}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="https://instagram.com/yourhandle"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                                        <input
                                            type="url"
                                            name="linkedinUrl"
                                            value={formData.linkedinUrl}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="https://linkedin.com/in/yourprofile"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">YouTube URL</label>
                                        <input
                                            type="url"
                                            name="youtubeUrl"
                                            value={formData.youtubeUrl}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="https://youtube.com/@yourchannel"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">GitHub URL</label>
                                        <input
                                            type="url"
                                            name="githubUrl"
                                            value={formData.githubUrl}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="https://github.com/yourprofile"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Footer Settings */}
                            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                <h2 className="text-lg font-semibold mb-4">Footer Settings</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Footer Text</label>
                                        <textarea
                                            name="footerText"
                                            value={formData.footerText}
                                            onChange={handleChange}
                                            rows={2}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            placeholder="Your source for the latest in tech, programming, and lifestyle."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Copyright Text</label>
                                        <input
                                            type="text"
                                            name="copyrightText"
                                            value={formData.copyrightText}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="© 2026 EliteBlog. All rights reserved."
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 !text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <SaveIcon />
                                    {updateMutation.isPending ? "Saving..." : "Save Settings"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
