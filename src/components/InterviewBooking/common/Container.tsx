import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  size: "xsmall" | "small" | "medium" | "large";
};

export function Container({ children, size }: Props) {
  const maxWidthClass = {
    xsmall: "max-w-xl",
    small: "max-w-3xl",
    medium: "max-w-5xl",
    large: "max-w-7xl",
  }[size];

  return <div className={`mx-auto w-4/5 ${maxWidthClass}`}>{children}</div>;
}