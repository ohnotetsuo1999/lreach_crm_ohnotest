import { ReactNode } from "react";

type FormFieldProps = {
  children: ReactNode;
};

export function FormField({ children }: FormFieldProps) {
  return <div className="flex flex-col gap-2">{children}</div>;
}