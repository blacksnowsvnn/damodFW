"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Chọn giao diện" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Sáng (Light)</SelectItem>
        <SelectItem value="dark">Tối (Dark)</SelectItem>
        <SelectItem value="system">Hệ thống (System)</SelectItem>
      </SelectContent>
    </Select>
  )
}
