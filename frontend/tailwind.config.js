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
        "black-900": "#1B5E20",
        accent: "#81C784",
        "sidebar-button": "#A5D6A7",
        sidebar: "#C8E6C9",
        "historical-msg-system": "rgba(27, 94, 32, 0.08)",
        "historical-msg-user": "#DCEDC8",
        outline: "#66BB6A",
        "theme-text": "#1B5E20",
        "theme-text-muted": "#2E7D32",
        "dropdown-bg": "#F1F8E9",
        "dropdown-border": "#66BB6A"
      },
      backgroundImage: {
        "preference-gradient":
          "linear-gradient(180deg, #A5D6A7 0%, rgba(165, 214, 167, 0.4) 100%)",
        "chat-msg-user-gradient":
          "linear-gradient(180deg, #C8E6C9 0%, #DCEDC8 100%)",
        "selected-preference-gradient":
          "linear-gradient(180deg, #81C784 0%, rgba(129, 199, 132, 0.3) 100%)",
        "main-gradient": "linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%)",
        "modal-gradient": "linear-gradient(180deg, #F1F8E9 0%, #DCEDC8 100%)",
        "sidebar-gradient": "linear-gradient(90deg, #A5D6A7 0%, #C8E6C9 100%)",
        "login-gradient": "linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%)",
        "menu-item-gradient":
          "linear-gradient(90deg, #C8E6C9 0%, #DCEDC8 100%)",
        "menu-item-selected-gradient":
          "linear-gradient(90deg, #81C784 0%, #A5D6A7 100%)",
        "workspace-item-gradient":
          "linear-gradient(90deg, #C8E6C9 0%, #DCEDC8 100%)",
        "workspace-item-selected-gradient":
          "linear-gradient(90deg, #81C784 0%, #A5D6A7 100%)",
        "switch-selected": "linear-gradient(146deg, #66BB6A 0%, #81C784 100%)"
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
