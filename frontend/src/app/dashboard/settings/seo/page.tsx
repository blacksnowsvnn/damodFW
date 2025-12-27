"use client"

import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"

export default function SeoSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    site_title: "",
    site_description: "",
    site_keywords: "",
    og_image: "",
    site_logo: "",
    site_logo_text: "",
    site_favicon: "",
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await apiRequest("/settings/")
        const settingMap: Record<string, string> = {}
        data.forEach((s: any) => {
          settingMap[s.key] = s.value
        })
        
        setSettings({
          site_title: settingMap.site_title || "",
          site_description: settingMap.site_description || "",
          site_keywords: settingMap.site_keywords || "",
          og_image: settingMap.og_image || "",
          site_logo: settingMap.site_logo || "",
          site_logo_text: settingMap.site_logo_text || "",
          site_favicon: settingMap.site_favicon || "",
        })
      } catch (error) {
        console.error("Failed to fetch settings:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiRequest("/settings/bulk", {
        method: "PUT",
        body: JSON.stringify({ settings }),
      })
      toast.success("Đã lưu cài đặt SEO & Thương hiệu")
    } catch (error: any) {
      toast.error(error.message || "Không thể lưu cài đặt")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">SEO & Thương hiệu</h3>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin SEO, logo và hình ảnh đại diện của trang web.
        </p>
      </div>
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Thương hiệu (Branding)</CardTitle>
          <CardDescription>
            Logo và biểu tượng hiển thị trên website.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUpload
            label="Logo Website"
            value={settings.site_logo}
            onChange={(url) => setSettings({ ...settings, site_logo: url })}
            onRemove={() => setSettings({ ...settings, site_logo: "" })}
          />
          
          <div className="grid gap-2">
            <Label htmlFor="site_logo_text">Logo Chữ (Text Logo)</Label>
            <Input
              id="site_logo_text"
              value={settings.site_logo_text}
              onChange={(e) => setSettings({ ...settings, site_logo_text: e.target.value })}
              placeholder="Nhập tên thương hiệu (hiển thị khi không có logo ảnh)"
            />
          </div>

          <ImageUpload
            label="Favicon (Icon trên tab trình duyệt)"
            value={settings.site_favicon}
            onChange={(url) => setSettings({ ...settings, site_favicon: url })}
            onRemove={() => setSettings({ ...settings, site_favicon: "" })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cơ bản</CardTitle>
          <CardDescription>
            Thông tin SEO cốt lõi của trang web.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="site_title">Tiêu đề trang (Title)</Label>
            <Input
              id="site_title"
              value={settings.site_title}
              onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
              placeholder="Ví dụ: DamodFW - Framework Quản trị"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="site_description">Mô tả (Description)</Label>
            <Textarea
              id="site_description"
              value={settings.site_description}
              onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
              placeholder="Nhập mô tả ngắn về trang web..."
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="site_keywords">Từ khóa (Keywords)</Label>
            <Input
              id="site_keywords"
              value={settings.site_keywords}
              onChange={(e) => setSettings({ ...settings, site_keywords: e.target.value })}
              placeholder="Ví dụ: firewall, admin, management, dashboard"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mạng xã hội (Open Graph)</CardTitle>
          <CardDescription>
            Hiển thị khi chia sẻ trang web lên Facebook, Zalo, Twitter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            label="URL Ảnh đại diện (OG Image)"
            value={settings.og_image}
            onChange={(url) => setSettings({ ...settings, og_image: url })}
            onRemove={() => setSettings({ ...settings, og_image: "" })}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu thay đổi
        </Button>
      </div>
    </div>
  )
}
