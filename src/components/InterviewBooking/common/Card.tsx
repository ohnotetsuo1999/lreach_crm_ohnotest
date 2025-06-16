import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function Card({ children }: Props) {
  return (
    <div className="bg-white rounded-lg p-4 md:p-8 shadow-md">{children}</div>
  );
}