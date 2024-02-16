"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (process.env.NODE_ENV != "development" && typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST
  })
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}

export function PHProvider({ children }) {
  return process.env.NODE_ENV === "development" ?
    <>{children}</> : <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

