export interface Feed {
    id: string;
    title: string,
    slug: string,
    thumbnail: string,
    category: { name: string },
    description: string,
    featuredImage: string,
    date: string,
    readTime: string,
    author: { id: string, name: string, avatarUrl: string }
}

export interface UserData {
    id?: string;
    name?: string;
    username?: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
    isLoggedIn?: boolean;
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
    isModalOpen: boolean;
}