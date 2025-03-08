import React, { useState, createContext, ReactNode } from "react";
import algoliasearch from "algoliasearch/lite";
import { InstantSearch } from "react-instantsearch-hooks-web";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Define Context Type
interface BlogContextType {
    theme: string;
    isModalOpen: boolean;
    setIsModalOpen: () => void; // Corrected type here
    updateTheme: (mode: "light" | "dark") => Promise<void>;
    searchClient: any;
}

// Create Context
// eslint-disable-next-line react-refresh/only-export-components
export const BlogContext = createContext<BlogContextType | undefined>(undefined);

// Define Provider Props
interface BlogProviderProps {
    children: ReactNode;
}

// Algolia Search Client
const searchClient = algoliasearch(import.meta.env.VITE_ALGOLIA_APP_ID, import.meta.env.VITE_ALGOLIA_API_KEY);
const GoogleOAuth: React.FC<{ clientId: string; children: React.ReactNode }> = GoogleOAuthProvider as any;

const BlogProvider: React.FC<BlogProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<string>("dark");
    const [isModalOpen, setModalOpen] = useState<boolean>(false);

    const setIsModalOpen = () => {
        setModalOpen(!isModalOpen);
    };

    const updateTheme = async (mode: "light" | "dark") => {
        const htmlElement = document.documentElement;
        htmlElement.classList.remove("light", "dark");
        htmlElement.classList.add(mode);
        htmlElement.style.colorScheme = mode;
        setTheme(mode);
    };

    return (
        <GoogleOAuth clientId={`${import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}`}>
            <BlogContext.Provider value={{ isModalOpen, theme, updateTheme, setIsModalOpen, searchClient }}>
                <InstantSearch searchClient={searchClient} indexName="YOUR_INDEX_NAME">
                    {children as ReactNode}
                </InstantSearch>
            </BlogContext.Provider>
        </GoogleOAuth>
    );
};

export default BlogProvider;