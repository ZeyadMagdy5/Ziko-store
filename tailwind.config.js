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
                primary: "#1a1a1a",
                secondary: "#f5f5f5",
                accent: "#d4af37", // Gold/Luxury color
            },
            fontFamily: {
                sans: ['"Inter"', 'sans-serif'],
                heading: ['"Playfair Display"', 'serif'],
            }
        },
    },
    plugins: [],
}
