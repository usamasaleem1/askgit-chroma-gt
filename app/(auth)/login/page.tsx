import { Metadata } from "next"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/shared/icons"
import { UserAuthForm } from "@/components/forms/user-auth-form"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default function LoginPage() {
  return (
    <>
      <div style={{
        backgroundImage: "linear-gradient(200deg, #171819, #1A1A1E, #45454F)",
        backgroundSize: "100% 100%",
        height: "100vh",
        backgroundPosition: "center",
      }}>
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <div className="flex justify-center items-center">
                <Icons.logo className="size-6" />
                <span style={{ fontSize: 'medium', fontWeight: 'bold', padding: "10px" }}>Hi there!</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome to AskGit
              </h1>
              <p className="text-sm text-muted-foreground">
                Start by logging in with your GitHub account.
              </p>
            </div>
            <UserAuthForm />
          </div>
        </div>
      </div>
    </>
  )
}
