import Link from "next/link";
import { Plus, Trash2, Edit, ArrowLeft } from "lucide-react";

type Props = {
  href?: string;
  onClick?: () => void;
  type: "create" | "delete" | "edit" | "back";
  variant?: "default" | "icon-only";
  className?: string;
};

const BUTTON_LABELS = {
  create: "新規作成",
  delete: "削除",
  edit: "編集",
  back: "戻る",
} as const;

const BUTTON_STYLES = {
  create: "bg-blue-600 hover:bg-blue-700",
  delete: "bg-red-600 hover:bg-red-700",
  edit: "bg-blue-600 hover:bg-blue-700",
  back: "bg-gray-600 hover:bg-gray-700",
} as const;

const BUTTON_ICONS = {
  create: Plus,
  delete: Trash2,
  edit: Edit,
  back: ArrowLeft,
} as const;

export function IconButton({
  href,
  onClick,
  type,
  variant = "default",
  className = "",
}: Props) {
  const Icon = BUTTON_ICONS[type];
  const baseStyles =
    variant === "default"
      ? "flex items-center justify-center space-x-2 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-36 h-12"
      : "flex items-center justify-center text-gray-600 rounded-lg transition-colors duration-200 p-2 hover:bg-gray-100";
  const typeStyles = variant === "default" ? BUTTON_STYLES[type] : "";

  const buttonContent = (
    <>
      <Icon className={variant === "default" ? "size-6" : "size-5"} />
      {variant === "default" && (
        <span className="text-base">{BUTTON_LABELS[type]}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link className={`${baseStyles} ${typeStyles} ${className}`} href={href}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${typeStyles} ${className}`}
      type="button"
    >
      {buttonContent}
    </button>
  );
}