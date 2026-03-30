/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                headline: ['Manrope', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                label: ['Inter', 'sans-serif']
            },
            colors: {
                "on-background": "#e5e2e3",
                "background": "#131314",
                "outline": "#8c90a1",
                "surface-container-lowest": "#0e0e0f",
                "inverse-primary": "#0058ca",
                "on-secondary": "#480081",
                "on-primary": "#002d6e",
                "secondary-container": "#7701d0",
                "on-error": "#690005",
                "on-secondary-fixed-variant": "#6700b5",
                "tertiary": "#00dbe9",
                "on-secondary-fixed": "#2c0051",
                "primary-fixed-dim": "#b0c6ff",
                "error": "#ffb4ab",
                "on-tertiary-container": "#e3fdff",
                "primary-container": "#0a6bee",
                "on-primary-fixed": "#001944",
                "tertiary-container": "#007e86",
                "surface-container-highest": "#353436",
                "on-tertiary": "#00363a",
                "outline-variant": "#424656",
                "inverse-on-surface": "#313031",
                "on-surface-variant": "#c2c6d8",
                "secondary-fixed": "#efdbff",
                "on-secondary-container": "#dcb7ff",
                "error-container": "#93000a",
                "surface-container-low": "#1c1b1c",
                "on-surface": "#e5e2e3",
                "surface-dim": "#131314",
                "surface": "#131314",
                "on-tertiary-fixed": "#002022",
                "surface-container-high": "#2a2a2b",
                "on-primary-fixed-variant": "#00429b",
                "tertiary-fixed-dim": "#00dbe9",
                "surface-variant": "#353436",
                "surface-bright": "#39393a",
                "on-error-container": "#ffdad6",
                "tertiary-fixed": "#7df4ff",
                "on-tertiary-fixed-variant": "#004f54",
                "surface-container": "#201f20",
                "inverse-surface": "#e5e2e3",
                "surface-tint": "#b0c6ff",
                "primary-fixed": "#d9e2ff",
                "on-primary-container": "#f8f7ff",
                "secondary-fixed-dim": "#dcb8ff",
                "secondary": "#dcb8ff",
                "primary": "#b0c6ff",
                
                // Existing shadcn variables mapped roughly
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                foreground: "hsl(var(--foreground))",
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            animation: {
                "shimmer": "shimmer 2s linear infinite",
            },
            keyframes: {
                shimmer: {
                    from: { backgroundPosition: "200% 0" },
                    to: { backgroundPosition: "-200% 0" },
                },
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),
        require("@tailwindcss/typography")
    ],
}
