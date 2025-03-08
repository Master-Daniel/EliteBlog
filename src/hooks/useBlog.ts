import { useContext } from "react";
import { BlogContext } from "../context/provider";

export const useBlog = () => {
    const context = useContext(BlogContext);
    if (!context) {
        throw new Error("useBlog must be used within a Provider");
    }
    return context;
};
