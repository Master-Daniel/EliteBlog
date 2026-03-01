export interface Feed {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    category: { id?: string; name: string };
    description: string;
    featuredImage?: string;
    content?: string;
    created_at?: string;
    updated_at?: string;
    tags?: string[];
    keywords?: string[];
    status?: string;
    author: { id: string; name: string; username?: string; avatarUrl?: string };
}

export interface UserData {
    id?: string;
    name?: string;
    username?: string;
    email?: string;
    avatarUrl?: string;
    bio?: string;
    website?: string;
    twitter?: string;
    github?: string;
    provider?: string;
    role?: string;
    isLoggedIn?: boolean;
    createdAt?: string;
    feeds?: Array<{ status: string }>;
}

export interface GlobalState {
    isLoggedIn: boolean;
    isSidebarOpen: boolean;
    theme: string;
    userData?: UserData;
    feeds?: {
        featured: Feed[];
        feeds: Feed[];
    };
}