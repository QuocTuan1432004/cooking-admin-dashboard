import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface RecipeStatusBadgeProps {
  status: "pending" | "approved" | "rejected";
}

export function RecipeStatusBadge({ status }: RecipeStatusBadgeProps) {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        >
          <Clock className="w-3 h-3 mr-1" />
          Chờ duyệt
        </Badge>
      );
    case "approved":
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Đã duyệt
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="secondary"
          className="bg-red-100 text-red-800 hover:bg-red-100"
        >
          <XCircle className="w-3 h-3 mr-1" />
          Bị từ chối
        </Badge>
      );
    default:
      return null;
  }
}
