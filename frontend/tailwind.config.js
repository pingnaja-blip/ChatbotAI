/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'false',
  content: {
    relative: true,
    files: [
      "./src/components/**/*.{js,jsx}",
      "./src/hooks/**/*.js",
      "./src/models/**/*.js",
      "./src/pages/**/*.{js,jsx}",
      "./src/utils/**/*.js",
      "./src/*.jsx",
      "./index.html",
      './node_modules/@tremor/**/*.{js,ts,jsx,tsx}'
    ]
  },
  theme: {
    extend: {
      rotate: {
        "270": "270deg",
        "360": "360deg"
      },
      colors: {
        "black-900": "#1f2937",
        accent: "#4f46e5",
        "sidebar-button": "#e5e7eb",
        sidebar: "#f5f5f5",
        "historical-msg-system": "#f9fafb",
        "historical-msg-user": "#e5e7eb",
        outline: "#d1d5db",
        "theme-text": "#1f2937",
        "theme-text-muted": "#6b7280",
        "dropdown-bg": "#ffffff",
        "dropdown-border": "#d1d5db"
      },
      backgroundImage: {
        "preference-gradient":
          "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)",
        "chat-msg-user-gradient":
          "linear-gradient(180deg, #e5e7eb 0%, #f3f4f6 100%)",
        "selected-preference-gradient":
          "linear-gradient(180deg, #e0e7ff 0%, #c7d2fe 100%)",
        "main-gradient": "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
        "modal-gradient": "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
        "sidebar-gradient": "linear-gradient(90deg, #f0f0f0 0%, #f5f5f5 100%)",
        "login-gradient": "linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)",
        "menu-item-gradient":
          "linear-gradient(90deg, #f5f5f5 0%, #e5e7eb 100%)",
        "menu-item-selected-gradient":
          "linear-gradient(90deg, #e0e7ff 0%, #c7d2fe 100%)",
        "workspace-item-gradient":
          "linear-gradient(90deg, #f5f5f5 0%, #e5e7eb 100%)",
        "workspace-item-selected-gradient":
          "linear-gradient(90deg, #e0e7ff 0%, #c7d2fe 100%)",
        "switch-selected": "linear-gradient(146deg, #4f46e5 0%, #6366f1 100%)"
      },
      fontFamily: {
        sans: [
          "plus-jakarta-sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"'
        ]
      },
      animation: {
        sweep: "sweep 0.5s ease-in-out"
      },
      keyframes: {
        sweep: {
          "0%": { transform: "scaleX(0)", transformOrigin: "bottom left" },
          "100%": { transform: "scaleX(1)", transformOrigin: "bottom left" }
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 }
        },
        fadeOut: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 }
        }
      }
    }
  },
  // Required for rechart styles to show since they can be rendered dynamically and will be tree-shaken if not safe-listed.
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: []
}
