"use client"

import * as React from "react"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiRequest } from "@/lib/api"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  onRemove: () => void
  label?: string
  disabled?: boolean
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label,
  disabled,
  className,
}: ImageUploadProps) {
  const [loading, setLoading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh hợp lệ")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await apiRequest("/upload/", {
        method: "POST",
        body: formData,
      })

      onChange(res.url)
      toast.success("Tải ảnh lên thành công")
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Lỗi khi tải ảnh")
    } finally {
      setLoading(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  return (
    <div className={`space-y-4 w-full ${className}`}>
      {label && <Label>{label}</Label>}
      
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative aspect-video w-40 overflow-hidden rounded-md border bg-muted">
            <Image
              src={value}
              alt="Upload"
              fill
              className="object-cover"
              unoptimized
            />
            <Button
              type="button"
              onClick={onRemove}
              variant="destructive"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex aspect-video w-40 items-center justify-center rounded-md border border-dashed bg-muted text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={disabled || loading}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={disabled || loading}
            onClick={() => inputRef.current?.click()}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Tải ảnh lên
          </Button>
          <p className="text-xs text-muted-foreground">
            Hỗ trợ JPG, PNG, WEBP.
          </p>
        </div>
      </div>
    </div>
  )
}
