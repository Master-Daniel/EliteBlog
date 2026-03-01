import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
    plugins: [typography()],
};

export default config;
