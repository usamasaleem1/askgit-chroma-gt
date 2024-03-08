"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { IoIosArrowDropdown } from "react-icons/io";
import { IoMdArrowDropdownCircle } from "react-icons/io";

import { UserAvatar } from "@/components/shared/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { CreditCard, LayoutDashboard, LogOut, Settings } from "lucide-react"
import type { User } from "next-auth"
import { useLogoutModal } from "@/hooks/use-signin-modal"

interface UserAccountNavProps extends React.HTMLAttributes<HTMLDivElement> {
  user: Pick<User, "name" | "image" | "email">
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const logoutModel = useLogoutModal();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2" style={{
          backgroundColor: "rgba(250, 250, 250, 0.05)",
          paddingLeft: "10px",
          paddingRight: "10px",
          paddingTop: "10px",
          paddingBottom: "10px",
          borderRadius: "20em",
          border: "none", // Hide the rectangular outline on click
          outline: "#FFFFFF22 solid 2px",
          marginRight: "1em"
        }}>
          <UserAvatar
            user={{ name: user?.name || null, image: user?.image || null }}
            className="size-8 outline outline-white/20" style={{
              outlineWidth: "2px",
              marginRight: "5px"
            }}
          />
          {user?.name && <span className="text-md font-semibold text-white text-opacity-80">{user?.name}</span>}
          <IoMdArrowDropdownCircle className="size-5 text-white" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" style={{
        marginTop: "10px",
        borderRadius: "20px",
        padding: "15px",
        backgroundColor: "rgba(250, 250, 250, 0.05)",
        outline: "solid 1px rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(15px)"
      }}>
        <div className="flex items-center justify-start gap-2 p-3" >
          <div className="flex flex-col space-y-1 leading-none">
            {user?.name && <p className="font-medium">{user?.name}</p>}
            {user?.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer" style={{
            marginTop: "15px",
            backgroundColor: "rgba(250, 250, 250, 0.05)",
            borderRadius: "20px",
            padding: "10px",
            outline: "solid 1px rgba(255, 255, 255, 0.2)",
          }}
          onSelect={(event) => {
            event.preventDefault()
            logoutModel.onOpen()
          }}
        >
          <div className="flex items-center space-x-2.5">
            <LogOut className="size-4" />
            <p className="text-sm">Log out</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
