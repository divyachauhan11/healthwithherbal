import {
  AlertCircle,
  FileText,
  Layers,
  Package,
  Star,
  Tag,
} from "lucide-react";

/**
 * Kind icon component fallback when no image exists
 * @param {{kind: string}} props
 */
export function DeleteKindIcon({ kind }) {
  switch (kind) {
    case "products":
      return <Package size={22} />;
    case "categories":
      return <Layers size={22} />;
    case "brands":
    case "coupons":
      return <Tag size={22} />;
    case "reviews":
      return <Star size={22} />;
    case "blogs":
      return <FileText size={22} />;
    default:
      return <AlertCircle size={22} />;
  }
}
