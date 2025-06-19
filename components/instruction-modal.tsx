"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Upload, Save, X, Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import Image from "next/image"

interface DetailedInstruction {
  step: number
  description: string
  time?: string
  image?: string
  imageFile?: File
}

interface InstructionModalProps {
  isOpen: boolean
  onClose: () => void
  instructions?: string[] // Để tương thích với code cũ
  detailedInstructions?: DetailedInstruction[] // Thêm prop mới
  onSave: (instructions: DetailedInstruction[]) => void // Thay đổi type
}

export function InstructionModal({
  isOpen,
  onClose,
  instructions = [],
  detailedInstructions = [],
  onSave,
}: InstructionModalProps) {
  const [localDetailedInstructions, setLocalDetailedInstructions] = useState<DetailedInstruction[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newInstruction, setNewInstruction] = useState<DetailedInstruction>({
    step: 1,
    description: "",
    time: "",
    image: "",
  })
  const [dragActive, setDragActive] = useState(false)

  // Initialize detailed instructions
  useEffect(() => {
    if (isOpen) {
      // Ưu tiên sử dụng detailedInstructions nếu có
      if (detailedInstructions.length > 0) {
        // Chỉ update nếu khác với current state
        if (JSON.stringify(localDetailedInstructions) !== JSON.stringify(detailedInstructions)) {
          setLocalDetailedInstructions([...detailedInstructions])
        }
      } else if (instructions.length > 0) {
        // Fallback cho code cũ
        const detailed = instructions.map((instruction, index) => ({
          step: index + 1,
          description: instruction,
          time: "",
          image: "",
        }))
        // Chỉ update nếu khác với current state
        if (JSON.stringify(localDetailedInstructions) !== JSON.stringify(detailed)) {
          setLocalDetailedInstructions(detailed)
        }
      } else if (localDetailedInstructions.length > 0) {
        setLocalDetailedInstructions([])
      }

      // Reset các state khác chỉ khi cần thiết
      if (isAddingNew) setIsAddingNew(false)
      if (editingIndex !== null) setEditingIndex(null)

      // Reset newInstruction
      setNewInstruction({ step: localDetailedInstructions.length + 1, description: "", time: "", image: "" })
    }
  }, [isOpen]) // Chỉ depend vào isOpen

  // Separate useEffect for detailedInstructions changes
  useEffect(() => {
    if (isOpen && detailedInstructions.length > 0) {
      if (JSON.stringify(localDetailedInstructions) !== JSON.stringify(detailedInstructions)) {
        setLocalDetailedInstructions([...detailedInstructions])
      }
    }
  }, [detailedInstructions, isOpen])

  const handleImageUpload = (file: File, isNew = false) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (isNew) {
          setNewInstruction((prev) => ({
            ...prev,
            image: result,
            imageFile: file,
          }))
        } else if (editingIndex !== null) {
          const updated = [...localDetailedInstructions]
          updated[editingIndex] = {
            ...updated[editingIndex],
            image: result,
            imageFile: file,
          }
          setLocalDetailedInstructions(updated)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent, isNew = false) => {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (files[0]) {
      handleImageUpload(files[0], isNew)
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

  const handleAddNew = () => {
    setIsAddingNew(true)
    setEditingIndex(null)
    setNewInstruction({
      step: localDetailedInstructions.length + 1,
      description: "",
      time: "",
      image: "",
    })
  }

  const handleSaveNew = () => {
    if (!newInstruction.description.trim()) return

    const updated = [...localDetailedInstructions, { ...newInstruction, step: localDetailedInstructions.length + 1 }]
    setLocalDetailedInstructions(updated)
    setIsAddingNew(false)
    setNewInstruction({ step: 1, description: "", time: "", image: "" })
  }

  const handleCancelNew = () => {
    setIsAddingNew(false)
    setNewInstruction({ step: 1, description: "", time: "", image: "" })
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setIsAddingNew(false)
  }

  const handleSaveEdit = () => {
    setEditingIndex(null)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
  }

  const handleDelete = (index: number) => {
    const updated = localDetailedInstructions.filter((_, i) => i !== index)
    // Re-number steps
    const renumbered = updated.map((inst, i) => ({ ...inst, step: i + 1 }))
    setLocalDetailedInstructions(renumbered)
  }

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const updated = [...localDetailedInstructions]
      ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
      // Re-number steps
      const renumbered = updated.map((inst, i) => ({ ...inst, step: i + 1 }))
      setLocalDetailedInstructions(renumbered)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < localDetailedInstructions.length - 1) {
      const updated = [...localDetailedInstructions]
      ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
      // Re-number steps
      const renumbered = updated.map((inst, i) => ({ ...inst, step: i + 1 }))
      setLocalDetailedInstructions(renumbered)
    }
  }

  const handleSaveAll = () => {
    // Trả về detailed instructions thay vì chỉ string array
    const finalInstructions = localDetailedInstructions.filter((inst) => inst.description.trim())

    onSave(finalInstructions)
    onClose()
  }

  const handleCancel = () => {
    setLocalDetailedInstructions([])
    setIsAddingNew(false)
    setEditingIndex(null)
    setNewInstruction({ step: 1, description: "", time: "", image: "" })
    onClose()
  }

  const updateInstruction = (index: number, field: keyof DetailedInstruction, value: string) => {
    const updated = [...localDetailedInstructions]
    updated[index] = { ...updated[index], [field]: value }
    setLocalDetailedInstructions(updated)
  }

  const removeImage = (index: number) => {
    const updated = [...localDetailedInstructions]
    updated[index] = { ...updated[index], image: "", imageFile: undefined }
    setLocalDetailedInstructions(updated)
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chỉnh sửa hướng dẫn</span>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveAll} className="bg-green-500 hover:bg-green-600">
                <Save className="w-4 h-4 mr-2" />
                Lưu tất cả
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Button */}
          <div className="flex justify-start">
            <Button onClick={handleAddNew} className="bg-orange-500 hover:bg-orange-600" disabled={isAddingNew}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm bước mới
            </Button>
          </div>

          {/* Existing Instructions */}
          <div className="space-y-4">
            {localDetailedInstructions.map((instruction, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                {editingIndex === index ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {instruction.step}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Bước {instruction.step}</h3>
                        <p className="text-gray-600">Chỉnh sửa bước này</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Mô tả bước làm <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={instruction.description}
                        onChange={(e) => updateInstruction(index, "description", e.target.value)}
                        placeholder="Mô tả chi tiết cách thực hiện bước này..."
                        className="mt-1"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Thời gian thực hiện</Label>
                      <div className="relative mt-1">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          value={instruction.time || ""}
                          onChange={(e) => updateInstruction(index, "time", e.target.value)}
                          placeholder="VD: 5 phút, 30 giây..."
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Hình ảnh minh họa</Label>
                      <div className="mt-1">
                        <div
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            dragActive ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-orange-400"
                          }`}
                          onDrop={(e) => handleDrop(e, false)}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                        >
                          {instruction.image ? (
                            <div className="relative">
                              <Image
                                src={instruction.image || "/placeholder.svg"}
                                alt={`Bước ${instruction.step}`}
                                width={200}
                                height={150}
                                className="mx-auto rounded-lg object-cover"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2 bg-white"
                                onClick={() => removeImage(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-gray-600 mb-2">Kéo thả hình ảnh vào đây hoặc</p>
                              <label htmlFor={`edit-image-upload-${index}`} className="cursor-pointer">
                                <span className="text-orange-600 hover:text-orange-700 font-medium">chọn file</span>
                                <input
                                  id={`edit-image-upload-${index}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleImageUpload(file, false)
                                  }}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} className="bg-green-500 hover:bg-green-600">
                        <Save className="w-4 h-4 mr-2" />
                        Lưu
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                      {instruction.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">Bước {instruction.step}</h4>
                      <p className="text-gray-700 mb-2">{instruction.description}</p>
                      {instruction.time && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <Clock className="w-3 h-3" />
                          <span>{instruction.time}</span>
                        </div>
                      )}
                      {instruction.image && (
                        <Image
                          src={instruction.image || "/placeholder.svg"}
                          alt={`Bước ${instruction.step}`}
                          width={150}
                          height={100}
                          className="rounded object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="px-2"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === localDetailedInstructions.length - 1}
                          className="px-2"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(index)}
                          className="text-blue-600 hover:bg-blue-50 px-2"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(index)}
                          className="text-red-600 hover:bg-red-50 px-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add New Form */}
          {isAddingNew && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {newInstruction.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Bước {newInstruction.step}</h3>
                    <p className="text-gray-600">Nhập chi tiết cho bước mới</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Mô tả bước làm <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={newInstruction.description}
                    onChange={(e) => setNewInstruction((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả chi tiết cách thực hiện bước này..."
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Thời gian thực hiện</Label>
                  <div className="relative mt-1">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      value={newInstruction.time || ""}
                      onChange={(e) => setNewInstruction((prev) => ({ ...prev, time: e.target.value }))}
                      placeholder="VD: 5 phút, 30 giây..."
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Hình ảnh minh họa</Label>
                  <div className="mt-1">
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-orange-400"
                      }`}
                      onDrop={(e) => handleDrop(e, true)}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      {newInstruction.image ? (
                        <div className="relative">
                          <Image
                            src={newInstruction.image || "/placeholder.svg"}
                            alt={`Bước ${newInstruction.step}`}
                            width={200}
                            height={150}
                            className="mx-auto rounded-lg object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 bg-white"
                            onClick={() => setNewInstruction((prev) => ({ ...prev, image: "", imageFile: undefined }))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-600 mb-2">Kéo thả hình ảnh vào đây hoặc</p>
                          <label htmlFor="new-image-upload" className="cursor-pointer">
                            <span className="text-orange-600 hover:text-orange-700 font-medium">chọn file</span>
                            <input
                              id="new-image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file, true)
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveNew}
                    disabled={!newInstruction.description.trim()}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu bước
                  </Button>
                  <Button variant="outline" onClick={handleCancelNew}>
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {localDetailedInstructions.length === 0 && !isAddingNew && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có hướng dẫn nào</h3>
              <p className="text-gray-600 mb-4">Nhấn "Thêm bước mới" để bắt đầu tạo hướng dẫn</p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Nhấn "Thêm bước mới" để tạo bước hướng dẫn mới</li>
              <li>• Sử dụng nút mũi tên để thay đổi thứ tự các bước</li>
              <li>• Nhấn "Sửa" để chỉnh sửa nội dung bước</li>
              <li>• Có thể thêm hình ảnh minh họa cho từng bước</li>
              <li>• Thời gian thực hiện giúp người dùng ước tính thời gian</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
