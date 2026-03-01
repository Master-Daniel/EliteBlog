import React, { useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import SideBar from "../../components/dashboard/SideBar";
import Header from "../../components/Header";
import axiosInstance from "../../api/axiosConfig";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { setUserData } from "../../redux/slices/globalSlice";
import usePageTitle from "../../hooks/usePageTitle";
import GitHubIcon from "@mui/icons-material/GitHub";
import LanguageIcon from "@mui/icons-material/Language";
import TwitterIcon from "@mui/icons-material/Twitter";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

interface ProfileFormValues {
    name: string;
    bio: string;
    website: string;
    twitter: string;
    github: string;
}

interface Achievement {
    type: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    requiredPosts: number;
    earnedAt: string;
}

interface AchievementProgress {
    nextAchievement: {
        type: string;
        name: string;
        description: string;
        icon: string;
        requiredPosts: number;
        color: string;
    } | null;
    currentPosts: number;
    postsToNext: number;
    percentToNext: number;
}

const validationSchema = Yup.object({
    name: Yup.string().required("Name is required").max(100, "Name is too long"),
    bio: Yup.string().max(500, "Bio must be 500 characters or less"),
    website: Yup.string().url("Please enter a valid URL").nullable(),
    twitter: Yup.string().max(50, "Twitter handle is too long"),
    github: Yup.string().max(50, "GitHub username is too long"),
});

const ProfilePage: React.FC = () => {
    usePageTitle("Profile");
    const dispatch = useDispatch();
    const { userData } = useSelector((state: RootState) => state.global);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const { data: achievements = [] } = useQuery<Achievement[]>({
        queryKey: ["my-achievements"],
        queryFn: async () => {
            const response = await axiosInstance.get("/achievements/my");
            return response.data;
        },
        enabled: userData?.role !== "admin",
    });

    const { data: progress } = useQuery<AchievementProgress>({
        queryKey: ["my-achievements-progress"],
        queryFn: async () => {
            const response = await axiosInstance.get("/achievements/my/progress");
            return response.data;
        },
        enabled: userData?.role !== "admin",
    });

    const updateMutation = useMutation({
        mutationFn: async (values: ProfileFormValues) => {
            const response = await axiosInstance.patch("/user/profile", values);
            return response.data;
        },
        onSuccess: (data) => {
            dispatch(setUserData(data.user));
            toast.success("Profile updated successfully!");
        },
        onError: (error: { message?: string }) => {
            toast.error(error.message || "Failed to update profile");
        },
    });

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size must be less than 2MB");
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPEG, PNG, GIF, and WebP images are allowed");
            return;
        }

        setIsUploadingAvatar(true);
        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const response = await axiosInstance.post("/user/avatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            dispatch(setUserData(response.data.user));
            toast.success("Profile picture updated successfully!");
        } catch {
            toast.error("Failed to upload profile picture");
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const initialValues: ProfileFormValues = {
        name: userData?.name || "",
        bio: userData?.bio || "",
        website: userData?.website || "",
        twitter: userData?.twitter || "",
        github: userData?.github || "",
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <SideBar />
            <div className="flex flex-col flex-1 min-h-0">
                <Header />
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Profile</h1>

                    {/* Profile Header Card - Full Width */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="relative group">
                                <img
                                    src={userData?.avatarUrl?.startsWith('/uploads') 
                                        ? `${import.meta.env.VITE_API_URL}${userData.avatarUrl}`
                                        : userData?.avatarUrl || `https://ui-avatars.com/api/?name=${userData?.name || userData?.username}&background=random&size=128`}
                                    alt={userData?.name || userData?.username}
                                    className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover"
                                />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarChange}
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={handleAvatarClick}
                                    disabled={isUploadingAvatar}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isUploadingAvatar ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <CameraAltIcon className="text-white" />
                                    )}
                                </button>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {userData?.name || userData?.username}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">@{userData?.username}</p>
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{userData?.email}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        userData?.role === "admin" 
                                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                    }`}>
                                        {userData?.role?.charAt(0).toUpperCase() + userData?.role?.slice(1)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    Member since {formatDate(userData?.createdAt)}
                                </p>
                            </div>
                            {/* Stats inline with profile header on larger screens */}
                            <div className="hidden lg:flex gap-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userData?.feeds?.length || 0}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Posts</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {userData?.feeds?.filter((f: { status: string }) => f.status === "published").length || 0}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {userData?.feeds?.filter((f: { status: string }) => f.status === "draft").length || 0}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards - Only visible on smaller screens */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 lg:hidden">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{userData?.feeds?.length || 0}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Posts</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {userData?.feeds?.filter((f: { status: string }) => f.status === "published").length || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {userData?.feeds?.filter((f: { status: string }) => f.status === "draft").length || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {userData?.provider === "github" ? "GitHub" : userData?.provider === "google" ? "Google" : "OAuth"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Auth Method</p>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Left Column - Edit Profile Form */}
                        <div className="xl:col-span-2 space-y-6">
                            {/* Edit Profile Form */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Edit Profile</h3>
                                
                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={validationSchema}
                                    enableReinitialize
                                    onSubmit={(values) => updateMutation.mutate(values)}
                                >
                                    {() => (
                                        <Form className="space-y-6">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                    Display Name
                                                </label>
                                                <Field
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Your display name"
                                                />
                                                <ErrorMessage name="name" component="p" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            <div>
                                                <label htmlFor="bio" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                    Bio
                                                </label>
                                                <Field
                                                    as="textarea"
                                                    id="bio"
                                                    name="bio"
                                                    rows={4}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                    placeholder="Tell us about yourself..."
                                                />
                                                <ErrorMessage name="bio" component="p" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label htmlFor="website" className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        <LanguageIcon fontSize="small" />
                                                        Website
                                                    </label>
                                                    <Field
                                                        id="website"
                                                        name="website"
                                                        type="url"
                                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="https://yourwebsite.com"
                                                    />
                                                    <ErrorMessage name="website" component="p" className="text-red-500 text-sm mt-1" />
                                                </div>

                                                <div>
                                                    <label htmlFor="twitter" className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                        <TwitterIcon fontSize="small" />
                                                        Twitter
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">@</span>
                                                        <Field
                                                            id="twitter"
                                                            name="twitter"
                                                            type="text"
                                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="username"
                                                        />
                                                    </div>
                                                    <ErrorMessage name="twitter" component="p" className="text-red-500 text-sm mt-1" />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="github" className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                    <GitHubIcon fontSize="small" />
                                                    GitHub Username
                                                </label>
                                                <Field
                                                    id="github"
                                                    name="github"
                                                    type="text"
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="your-github-username"
                                                />
                                                <ErrorMessage name="github" component="p" className="text-red-500 text-sm mt-1" />
                                            </div>

                                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <button
                                                    type="submit"
                                                    disabled={updateMutation.isPending}
                                                    className="cursor-pointer w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                                </button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>

                            {/* Account Info (Read-only) */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    The following information is managed by your OAuth provider and cannot be changed here.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Email</span>
                                        <span className="text-gray-900 dark:text-white font-medium">{userData?.email}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Username</span>
                                        <span className="text-gray-900 dark:text-white font-medium">@{userData?.username}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Auth Provider</span>
                                        <span className="text-gray-900 dark:text-white font-medium capitalize">{userData?.provider}</span>
                                    </div>
                                    <div className="flex justify-between py-3">
                                        <span className="text-gray-600 dark:text-gray-400">Account Role</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            userData?.role === "admin" 
                                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                        }`}>
                                            {userData?.role?.charAt(0).toUpperCase() + userData?.role?.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Achievements */}
                        <div className="xl:col-span-1">
                            {/* Achievements Section - Only for non-admin users */}
                            {userData?.role !== "admin" && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 sticky top-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <EmojiEventsIcon className="text-yellow-500" />
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Achievements</h3>
                                    </div>

                                    {/* Progress to Next Achievement - Show first */}
                                    {progress?.nextAchievement && (
                                        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-3xl">{progress.nextAchievement.icon}</span>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                        Next: {progress.nextAchievement.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {progress.currentPosts}/{progress.nextAchievement.requiredPosts} posts
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${progress.percentToNext}%`,
                                                        backgroundColor: progress.nextAchievement.color
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                                {progress.postsToNext} more {progress.postsToNext === 1 ? 'post' : 'posts'} to unlock!
                                            </p>
                                        </div>
                                    )}

                                    {/* All achievements unlocked */}
                                    {!progress?.nextAchievement && achievements.length > 0 && (
                                        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 text-center">
                                            <p className="text-3xl mb-2">🏆</p>
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                All achievements unlocked!
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Legendary Author • {progress?.currentPosts || 0} posts
                                            </p>
                                        </div>
                                    )}

                                    {/* Earned Achievements */}
                                    {achievements.length > 0 ? (
                                        <div className="space-y-3">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Earned ({achievements.length})
                                            </p>
                                            {achievements.map((achievement) => (
                                                <div
                                                    key={achievement.type}
                                                    className="flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.02]"
                                                    style={{ 
                                                        borderColor: achievement.color,
                                                        backgroundColor: `${achievement.color}10`
                                                    }}
                                                >
                                                    <span className="text-2xl">{achievement.icon}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                                            {achievement.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(achievement.earnedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                            <p className="text-3xl mb-2">🎯</p>
                                            <p className="text-sm">No achievements yet</p>
                                            <p className="text-xs mt-1">Start publishing posts to earn badges!</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* For admins, show a placeholder or nothing */}
                            {userData?.role === "admin" && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin Account</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        As an admin, you have full access to manage the blog, including posts, users, comments, and settings.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
