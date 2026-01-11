/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Custom colors can be added here if needed, 
                // using standard Tailwind colors for now as requested.
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'], // Modern font stack
            }
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
}
