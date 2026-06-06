/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                headline: ['Inter', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                label: ['Inter', 'sans-serif'],
            },
            colors: {
                // Semantic light-theme tokens (OKLCH via CSS vars)
                canvas: "var(--canvas)",
                surface: {
                    DEFAULT: "var(--surface)",
                    2: "var(--surface-2)",
                    3: "var(--surface-3)",
                },
                ink: {
                    DEFAULT: "var(--ink)",
                    2: "var(--ink-2)",
                    3: "var(--ink-3)",
                    "on-accent": "var(--ink-on-accent)",
                },
                line: {
                    DEFAULT: "var(--line)",
                    strong: "var(--line-strong)",
                },
                brand: {
                    DEFAULT: "var(--accent)",
                    hover: "var(--accent-hover)",
                    press: "var(--accent-press)",
                    soft: "var(--accent-soft)",
                },
                success: { DEFAULT: "var(--success)", soft: "var(--success-soft)" },
                warning: { DEFAULT: "var(--warning)", soft: "var(--warning-soft)" },
                danger: { DEFAULT: "var(--danger)", soft: "var(--danger-soft)" },

                // shadcn-compat bridge (legacy utilities keep working)
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--ink-on-accent)",
                    container: "var(--accent-hover)",
                },
                "primary-foreground": "var(--ink-on-accent)",
                "primary-container": "var(--accent-hover)",
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent-compat))",
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
                xl: "calc(var(--radius) + 4px)",
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            boxShadow: {
                xs: "var(--shadow-xs)",
                card: "var(--shadow-sm)",
                pop: "var(--shadow-md)",
                float: "var(--shadow-lg)",
            },
            animation: {
                "shimmer": "shimmer 1.6s ease-in-out infinite",
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
        require("@tailwindcss/typography"),
    ],
}
