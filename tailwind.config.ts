import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

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
    plugins: [typography],
};

export default config;
