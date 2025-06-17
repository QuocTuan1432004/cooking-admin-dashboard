"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, Upload, X, Clock } from 'lucide-react'
import Image from "next/image"

export interface Instruction {
  step: number
  description: string
  time?: string
  image?: string
}

interface InstructionAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (instruction: Omit<Instruction, "step">) => void
  stepNumber: number
  editingInstruction?: Instruction
}

export function InstructionAddModal({
  isOpen,
  onClose,
  onSave,
  stepNumber,
  editingInstruction,
}: InstructionAddModalProps) {
  const [description, setDescription] = useState(editingInstruction?.description || "")
  const [time, setTime] = useState(editingInstruction?.time || "")
  const [image, setImage] = useState(editingInstruction?.image || "")
  const [imagePreview, setImagePreview] = useState<string | null>(editingInstruction?.image || null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dragActive, setDragActive] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!description.trim()) {
      newErrors.description = "Mô tả bước làm không được để trống"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      return
    }

    onSave({
      description: description.trim(),
      time: time.trim() || undefined,
      image: image || undefined,
    })

    // Reset form
    setDescription("")
    setTime("")
    setImage("")
    setImagePreview(null)
    setErrors({})
    onClose()
  }

  const handleCancel = () => {
    setDescription(editingInstruction?.description || "")
    setTime(editingInstruction?.time || "")
    setImage(editingInstruction?.image || "")
    setImagePreview(editingInstruction?.image || null)
    setErrors({})
    onClose()
  }

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        setImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files[0]) {
      handleImageUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "description") {
      setDescription(value)
    } else if (field === "time") {
      setTime(value)
    }

    // Xóa lỗi khi user bắt đầu nhập
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {editingInstruction ? `Chỉnh sửa bước ${editingInstruction.step}` : `Thêm bước ${stepNumber}`}
            </span>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="bg-green-500 hover:bg-green-600">
                <Save className="w-4 h-4 mr-2" />
                Lưu
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Number Display */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
              {stepNumber}
            </div>
            <div>
              <h3 className="font-semibold text-lg">Bước {stepNumber}</h3>
              <p className="text-sm text-gray-600">Nhập chi tiết cho bước này</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium">
              Mô tả bước làm <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`mt-1 ${errors.description ? "border-red-500" : ""}`}
              placeholder="Mô tả chi tiết cách thực hiện bước này..."
              rows={4}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Time */}
          <div>
            <Label className="text-sm font-medium">Thời gian thực hiện</Label>
            <div className="relative mt-1">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                className="pl-10"
                placeholder="VD: 5 phút, 30 giây..."
              />
            </div>
            <p className="text-gray-500 text-xs mt-1">Thời gian ước tính để hoàn thành bước này (không bắt buộc)</p>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium">Hình ảnh minh họa</Label>
            <div className="mt-2">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:border-orange-400"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      width={200}
                      height={150}
                      className="mx-auto rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-white"
                      onClick={() => {
                        setImagePreview(null)
                        setImage("")
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 mb-2">Kéo thả hình ảnh vào đây hoặc</p>
                    <label htmlFor="step-image-upload" className="cursor-pointer">
                      <span className="text-orange-600 hover:text-orange-700 font-medium">chọn file</span>
                      <input
                        id="step-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF (không bắt buộc)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Lưu ý:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Mô tả bước làm một cách chi tiết và dễ hiểu</li>
              <li>• Thời gian giúp người dùng ước tính thời gian thực hiện</li>
              <li>• Hình ảnh minh họa giúp người dùng hiểu rõ hơn về bước này</li>
              <li>• Chỉ có mô tả là bắt buộc, các thông tin khác là tùy chọn</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
