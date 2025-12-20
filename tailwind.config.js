/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#27272a", // Zinc 800 - Softer dark for text
                secondary: "#f4f4f5", // Zinc 100 - Clean light background
                accent: "#ca8a04", // Darker Gold (Yellow 600) for better contrast
                muted: "#71717a", // Zinc 500 - Secondary text
            },
            fontFamily: {
                sans: ['"Inter"', 'sans-serif'],
                heading: ['"Playfair Display"', 'serif'],
            }
        },
    },
    plugins: [],
}
