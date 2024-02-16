"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from 'next-auth/react'
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { userAuthSchema } from "@/lib/validations/auth"
import { buttonVariants } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/shared/icons"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: string
}

type FormData = z.infer<typeof userAuthSchema>

export function UserAuthForm({ className, type, ...props }: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  })
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false)
  const searchParams = useSearchParams()

  async function onSubmit(data: FormData) {
    setIsLoading(true)

    const signInResult = await signIn("email", {
      email: data.email.toLowerCase(),
      redirect: false,
      callbackUrl: searchParams?.get("from") || "/dashboard",
    })

    setIsLoading(false)

    // TODO: replace shadcn toast by react-hot-toast
    // console.log("after login email",signInResult);
    if (!signInResult?.ok || signInResult?.error) {
      return toast({
        title: "Something went wrong.",
        description: "Your sign in request failed. Please try again.",
        variant: "destructive",
      })
    }

    return toast({
      title: "Check your email",
      description: "We sent you a login link. Be sure to check your spam too.",
    })
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }))}
        onClick={() => {
          signIn("github", { callbackUrl: '/dashboard' })
        }}
        disabled={isLoading || isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Icons.spinner className="mr-2 size-4 animate-spin" />
        ) : (
          <Icons.gitHub className="mr-2 size-4" />
        )}{" "}
        Login with Github
      </button>
    </div>
  )
}
