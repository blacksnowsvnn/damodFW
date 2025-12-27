"use client"

import Link from "next/link"
import { LayoutGrid, LogOut, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { removeToken, apiRequest } from "@/lib/api"
import { useEffect, useState } from "react"

export function UserNav() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; full_name?: string; rank: number } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiRequest("/members/me")
        setUser(data)
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Lỗi logout:", error)
    } finally {
      removeToken()
      router.push("/login")
    }
  }

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="Avatar" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Hồ sơ</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.full_name || user?.email?.split("@")[0]}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {user && user.rank < 5 && (
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center">
                <LayoutGrid className="mr-3 h-4 w-4 text-muted-foreground" />
                Dashboard
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/dashboard/account" className="flex items-center">
              <User className="mr-3 h-4 w-4 text-muted-foreground" />
              Tài khoản
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:bg-red-50" onClick={handleLogout}>
          <LogOut className="mr-3 h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
