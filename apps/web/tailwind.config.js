/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                apollo: {
                    dark: "#0b1220",
                    yellow: "#facc15",
                    indigo: "#4f46e5",
                }
            }
        },
    },
    plugins: [],
}
