"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BanUserDialogProps {
  userId: string;
  userName: string;
  onBanUser: (userId: string, action: 'ban', days: number) => Promise<void>;
  trigger: React.ReactNode;
}

export function BanUserDialog({ userId, userName, onBanUser, trigger }: BanUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [customDays, setCustomDays] = useState('');
  const [selectedDays, setSelectedDays] = useState('7');
  const [loading, setLoading] = useState(false);

  const predefinedDays = [
    { value: '1', label: '1 ngày' },
    { value: '3', label: '3 ngày' },
    { value: '7', label: '7 ngày' },
    { value: '14', label: '14 ngày' },
    { value: '30', label: '30 ngày' },
    { value: 'custom', label: 'Tùy chỉnh' },
  ];

  const handleBan = async () => {
    try {
      setLoading(true);
      
      let days: number;
      if (selectedDays === 'custom') {
        days = parseInt(customDays);
        if (isNaN(days) || days <= 0) {
          alert('Vui lòng nhập số ngày hợp lệ (1-365)');
          return;
        }
        if (days > 365) {
          alert('Số ngày không được vượt quá 365');
          return;
        }
      } else {
        days = parseInt(selectedDays);
      }
      
      await onBanUser(userId, 'ban', days);
      setOpen(false);
      
      // Reset form
      setSelectedDays('7');
      setCustomDays('');
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Có lỗi xảy ra khi khóa tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Khóa tài khoản</DialogTitle>
          <DialogDescription>
            Bạn đang khóa tài khoản: <strong>{userName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Days Selection */}
          <div>
            <Label className="text-base font-medium">Thời gian khóa</Label>
            <RadioGroup 
              value={selectedDays} 
              onValueChange={setSelectedDays}
              className="mt-2 grid grid-cols-2 gap-2"
            >
              {predefinedDays.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Custom days input */}
            {selectedDays === 'custom' && (
              <div className="mt-3">
                <Label htmlFor="custom-days">Số ngày (1-365)</Label>
                <Input
                  id="custom-days"
                  type="number"
                  placeholder="Nhập số ngày..."
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  min="1"
                  max="365"
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Warning message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Tài khoản sẽ bị khóa{' '}
              <strong>
                {selectedDays === 'custom' 
                  ? (customDays || '?') 
                  : selectedDays
                } ngày
              </strong>{' '}
              và tự động mở khóa sau thời gian này.
            </p>
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Hủy
          </Button>
          <Button 
            onClick={handleBan} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận khóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 