import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class", // Ensures you have control over dark mode
    theme: {
        extend: {
            colors: {
                darkblack: "#000000", // Pure black for dark mode
            },
            fontFamily: {
                custom: ["CustomFont", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
