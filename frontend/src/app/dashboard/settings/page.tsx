"use client"

import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, Palette, CircleDot, Square } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"

// Định nghĩa các theme có sẵn với màu sắc
const BASE_THEMES = [
  { value: "neutral", label: "Neutral", color: "oklch(0.205 0 0)" },
  { value: "red", label: "Red", color: "oklch(0.627 0.194 27.392)" },
  { value: "blue", label: "Blue", color: "oklch(0.623 0.214 259.815)" },
  { value: "green", label: "Green", color: "oklch(0.723 0.219 149.579)" },
  { value: "violet", label: "Violet", color: "oklch(0.606 0.25 292.917)" },
  { value: "orange", label: "Orange", color: "oklch(0.705 0.191 70.445)" },
  { value: "yellow", label: "Yellow", color: "oklch(0.795 0.184 86.047)" },
  { value: "rose", label: "Rose", color: "oklch(0.645 0.246 16.439)" },
]

const RADIUS_OPTIONS = [
  { value: "0", label: "Không bo góc", preview: "0rem" },
  { value: "0.3", label: "Bo nhẹ", preview: "0.3rem" },
  { value: "0.5", label: "Bo vừa", preview: "0.5rem" },
  { value: "0.75", label: "Bo tròn", preview: "0.75rem" },
  { value: "1.0", label: "Bo rất tròn", preview: "1.0rem" },
]

export default function AppearanceSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [settings, setSettings] = useState({
    theme_primary_color: "",
    theme_radius: "0.625",
    theme_base_style: "neutral",
  })
  const [originalSettings, setOriginalSettings] = useState({
    theme_primary_color: "",
    theme_radius: "0.625",
    theme_base_style: "neutral",
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await apiRequest("/settings/")
        const settingMap: Record<string, string> = {}
        data.forEach((s: { key: string; value: string }) => {
          settingMap[s.key] = s.value
        })

        const loadedSettings = {
          theme_primary_color: settingMap.theme_primary_color || "",
          theme_radius: settingMap.theme_radius || "0.625",
          theme_base_style: settingMap.theme_base_style || "neutral",
        }
        setSettings(loadedSettings)
        setOriginalSettings(loadedSettings)
      } catch (error) {
        console.error("Failed to fetch settings:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  // Hàm cập nhật CSS variables động
  const applyThemeChanges = (newSettings: typeof settings) => {
    const root = document.documentElement
    const radiusValue = newSettings.theme_radius === "0" ? "0px" : `${newSettings.theme_radius}rem`

    // Cập nhật data-theme-base attribute
    root.setAttribute("data-theme-base", newSettings.theme_base_style)

    // Cập nhật CSS variables với !important
    root.style.setProperty("--radius", radiusValue, "important")

    // Cập nhật các biến radius phụ thuộc để đảm bảo được áp dụng ngay
    const radiusInRem = parseFloat(newSettings.theme_radius || "0.625")
    root.style.setProperty("--radius-sm", `${Math.max(0, radiusInRem - 0.25)}rem`, "important")
    root.style.setProperty("--radius-md", `${Math.max(0, radiusInRem - 0.125)}rem`, "important")
    root.style.setProperty("--radius-lg", radiusValue, "important")
    root.style.setProperty("--radius-xl", `${radiusInRem + 0.25}rem`, "important")
    root.style.setProperty("--radius-2xl", `${radiusInRem + 0.5}rem`, "important")
    root.style.setProperty("--radius-3xl", `${radiusInRem + 0.75}rem`, "important")
    root.style.setProperty("--radius-4xl", `${radiusInRem + 1}rem`, "important")

    if (newSettings.theme_primary_color) {
      root.style.setProperty("--primary", `oklch(${newSettings.theme_primary_color})`, "important")
    } else {
      root.style.removeProperty("--primary")
    }

    // Force browser repaint để áp dụng thay đổi ngay lập tức
    void root.offsetHeight
  }

  // Kiểm tra xem có thay đổi so với settings gốc không
  useEffect(() => {
    if (!loading) {
      const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings)
      setHasChanges(changed)
    }
  }, [settings, loading, originalSettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiRequest("/settings/bulk", {
        method: "PUT",
        body: JSON.stringify({ settings }),
      })

      // Áp dụng thay đổi sau khi lưu thành công
      applyThemeChanges(settings)
      setOriginalSettings(settings)
      setHasChanges(false)

      toast.success("✨ Đã lưu và áp dụng cài đặt giao diện", {
        description: "Thay đổi của bạn đã được áp dụng cho toàn bộ trang web"
      })
    } catch (error) {
      const err = error as { message?: string }
      toast.error(err.message || "Không thể lưu cài đặt")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={cn("flex h-[400px] items-center justify-center")}>
        <div className={cn("flex flex-col items-center gap-3")}>
          <Loader2 className={cn("h-8 w-8 animate-spin text-primary")} />
          <p className={cn("text-sm text-muted-foreground")}>Đang tải cài đặt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6 animate-in fade-in-50 duration-500")}>
      {/* Header */}
      <div className={cn("space-y-1")}>
        <div className={cn("flex items-center justify-between")}>
          <div className={cn("space-y-1")}>
            <h3 className={cn("text-2xl font-semibold tracking-tight")}>Giao diện</h3>
            <p className={cn("text-sm text-muted-foreground")}>
              Tùy chỉnh màu sắc, bo góc và phong cách thiết kế của toàn bộ trang web.
            </p>
          </div>
          {hasChanges && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20",
              "animate-in fade-in-50 zoom-in-95 duration-200"
            )}>
              <div className={cn("h-2 w-2 rounded-full bg-amber-500 animate-pulse")} />
              <span className={cn("text-xs font-medium text-amber-700 dark:text-amber-400")}>
                Chưa lưu
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator className={cn("my-6")} />

      {/* Chế độ sáng/tối */}
      <Card className={cn("border-border transition-all duration-300 hover:shadow-md")}>
        <CardHeader>
          <div className={cn("flex items-center gap-2")}>
            <Palette className={cn("h-5 w-5 text-primary")} />
            <CardTitle>Chế độ hiển thị</CardTitle>
          </div>
          <CardDescription>
            Chọn giao diện sáng hoặc tối cho ứng dụng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      {/* Phong cách cơ bản */}
      <Card className={cn("border-border transition-all duration-300 hover:shadow-md")}>
        <CardHeader>
          <div className={cn("flex items-center gap-2")}>
            <CircleDot className={cn("h-5 w-5 text-primary")} />
            <CardTitle>Phong cách màu sắc</CardTitle>
          </div>
          <CardDescription>
            Chọn bảng màu chủ đạo cho toàn bộ giao diện.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn("space-y-6")}>
          {/* Theme selector với preview */}
          <div className={cn("grid gap-3")}>
            <Label htmlFor="base-style" className={cn("text-sm font-medium")}>
              Bảng màu
            </Label>
            <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3")}>
              {BASE_THEMES.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => setSettings({ ...settings, theme_base_style: theme.value, theme_primary_color: "" })}
                  className={cn(
                    "group relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all duration-200",
                    "hover:scale-105 hover:shadow-lg",
                    settings.theme_base_style === theme.value
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full transition-transform duration-200",
                      "group-hover:scale-110",
                      settings.theme_base_style === theme.value && "ring-4 ring-primary/20"
                    )}
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    settings.theme_base_style === theme.value
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}>
                    {theme.label}
                  </span>
                  {settings.theme_base_style === theme.value && (
                    <div className={cn("absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center animate-in zoom-in-50 duration-200")}>
                      <svg className={cn("h-3 w-3 text-primary-foreground")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom color input */}
          <div className={cn("grid gap-3")}>
            <Label htmlFor="primary-color" className={cn("text-sm font-medium")}>
              Màu tùy chỉnh (Nâng cao)
            </Label>
            <div className={cn("flex gap-3")}>
              <div className={cn("relative flex-1")}>
                <Input
                  id="primary-color"
                  value={settings.theme_primary_color}
                  onChange={(e) => setSettings({ ...settings, theme_primary_color: e.target.value })}
                  placeholder="Ví dụ: 0.623 0.214 259.815"
                  className={cn("pr-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20")}
                />
                <div
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md border-2 border-border shadow-sm transition-all duration-200",
                    settings.theme_primary_color && "ring-2 ring-primary/30"
                  )}
                  style={{
                    backgroundColor: settings.theme_primary_color
                      ? `oklch(${settings.theme_primary_color})`
                      : 'transparent'
                  }}
                />
              </div>
              {settings.theme_primary_color && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSettings({ ...settings, theme_primary_color: "" })}
                  className={cn("shrink-0 transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground")}
                >
                  <svg className={cn("h-4 w-4")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>
            <p className={cn("text-xs text-muted-foreground")}>
              Nhập giá trị OKLCH để ghi đè màu của theme. Để trống để dùng màu mặc định của bảng màu đã chọn.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Độ bo góc */}
      <Card className={cn("border-border transition-all duration-300 hover:shadow-md")}>
        <CardHeader>
          <div className={cn("flex items-center gap-2")}>
            <Square className={cn("h-5 w-5 text-primary")} />
            <CardTitle>Độ bo góc</CardTitle>
          </div>
          <CardDescription>
            Điều chỉnh độ bo tròn của các góc trong giao diện.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn("space-y-4")}>
          <div className={cn("grid gap-3")}>
            <Label htmlFor="radius" className={cn("text-sm font-medium")}>
              Mức độ bo góc
            </Label>
            <div className={cn("grid grid-cols-5 gap-2")}>
              {RADIUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSettings({ ...settings, theme_radius: option.value })}
                  className={cn(
                    "group flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all duration-200",
                    "hover:scale-105 hover:shadow-md",
                    settings.theme_radius === option.value
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <div
                    className={cn(
                      "h-10 w-10 bg-primary/20 transition-all duration-200",
                      "group-hover:bg-primary/30",
                      settings.theme_radius === option.value && "bg-primary/40"
                    )}
                    style={{ borderRadius: option.preview }}
                  />
                  <span className={cn(
                    "text-[10px] font-medium text-center transition-colors",
                    settings.theme_radius === option.value
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className={cn("flex items-center justify-end gap-3 pt-4")}>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // Reset về settings ban đầu
            setSettings(originalSettings)
            setHasChanges(false)
            toast.info("Đã khôi phục về cài đặt đã lưu")
          }}
          disabled={saving || !hasChanges}
          className={cn("transition-all duration-200")}
        >
          Khôi phục
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={cn(
            "min-w-[120px] transition-all duration-200",
            "hover:scale-105 hover:shadow-lg",
            saving && "scale-95",
            hasChanges && "animate-pulse-glow"
          )}
        >
          {saving ? (
            <>
              <Loader2 className={cn("mr-2 h-4 w-4 animate-spin")} />
              Đang lưu...
            </>
          ) : (
            <>
              <svg className={cn("mr-2 h-4 w-4")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
