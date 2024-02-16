"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/shared/icons"

export function ModeToggle({ initialTheme }) {
  const { theme, setTheme } = useTheme()
  const [isDarkMode, setIsDarkMode] = React.useState(initialTheme === 'dark')

  React.useEffect(() => {
    setIsDarkMode(theme === 'dark')
  }, [theme])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
    setTheme(isDarkMode ? "light" : "dark")
  }

  return (
    <Button variant="ghost" size="sm" className="size-8 px-0 hover:rounded-full" onClick={toggleTheme} style={{
      marginRight: "0.5rem",
      borderRadius: "100%",
    }}>
      {isDarkMode ? (
        <>
          <Icons.sun
            className={`rotate-0 scale-100 transition-all ${theme === 'light' ? 'text-gray-500' : ''}`} />
          <span className="sr-only">Switch to light mode</span>
        </>
      ) : (
        <>
          <Icons.moon className={`rotate-0 scale-100 transition-all ${theme === 'light' ? 'text-gray-500' : ''}`} style={{
            color: "rgba(0, 0, 0, 0.7)",
          }} />
          <span className="sr-only">Switch to dark mode</span>
        </>
      )}
    </Button>
  )
}
