"use client"

import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiRequest } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, AlertTriangle } from "lucide-react"

export default function AdvancedSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    header_scripts: "",
    body_scripts: "",
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
          header_scripts: settingMap.header_scripts || "",
          body_scripts: settingMap.body_scripts || "",
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
      toast.success("Đã lưu cài đặt Scripts")
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
        <h3 className="text-lg font-medium">Nâng cao (Scripts)</h3>
        <p className="text-sm text-muted-foreground">
          Chèn mã tùy chỉnh vào trang web. Hãy cẩn trọng với mã bạn nhập vào đây.
        </p>
      </div>
      <Separator />

      <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Cảnh báo an toàn</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Việc chèn script tùy chỉnh có thể gây lỗi cho trang web hoặc tạo ra lỗ hổng bảo mật.
                Chỉ chèn mã từ các nguồn đáng tin cậy.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Header Scripts</CardTitle>
          <CardDescription>
            Mã sẽ được chèn vào trước thẻ {`</head>`}. Thường dùng cho Google Analytics, Facebook Pixel, CSS tùy chỉnh.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Textarea
              id="header_scripts"
              value={settings.header_scripts}
              onChange={(e) => setSettings({ ...settings, header_scripts: e.target.value })}
              placeholder="<script>...</script> hoặc <style>...</style>"
              rows={8}
              className="font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Body Scripts</CardTitle>
          <CardDescription>
            Mã sẽ được chèn vào trước thẻ {`</body>`}. Thường dùng cho các widget chat, tracking scripts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Textarea
              id="body_scripts"
              value={settings.body_scripts}
              onChange={(e) => setSettings({ ...settings, body_scripts: e.target.value })}
              placeholder="<script>...</script>"
              rows={8}
              className="font-mono text-xs"
            />
          </div>
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
