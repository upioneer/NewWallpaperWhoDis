"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md hover:bg-[var(--muted)]/50 transition-colors flex items-center justify-center"
            aria-label="Toggle theme"
        >
            <Sun size={20} className="hidden dark:block" />
            <Moon size={20} className="block dark:hidden" />
        </button>
    )
}
