import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
  file: z.any().optional(),
});

export function EditSubCategoryDialog({
  initialData,
  onSubmit,
  parentId,
}: {
  initialData: { id: string; name: string; image?: string };
  onSubmit: (formData: FormData) => Promise<void>;
  parentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData.name,
    },
  });

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("id", initialData.id);
    formData.append("name", values.name);
    formData.append("parentId", parentId);
    if (values.file instanceof File) {
      formData.append("file", values.file);
    }
    await onSubmit(formData);
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Chỉnh sửa</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật danh mục con</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục con</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình ảnh</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={loading}
                      onChange={e => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  {initialData.image && (
                    <img
                      src={initialData.image}
                      alt="Ảnh hiện tại"
                      className="mt-2 h-16 w-16 object-cover rounded"
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}