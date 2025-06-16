import { ChangeEvent, KeyboardEvent } from "react";

type Props = {
  id?: string;
  placeholder?: string;
  type: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  readonly?: boolean;
};

export function Input({
  id,
  placeholder,
  type,
  value,
  onChange,
  required,
  readonly,
}: Props) {
  const baseClassName =
    "w-full px-3 py-2 border border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors";
  const numberInputClassName =
    type === "number"
      ? `${baseClassName} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`
      : baseClassName;
  const readonlyClassName = readonly
    ? `${numberInputClassName} bg-gray-100 cursor-not-allowed`
    : numberInputClassName;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (type === "number") {
      // 'e'を含む入力を防ぎ、整数のみを許可
      const value = e.target.value.replace(/[eE]/g, "");
      if (value === "" || /^-?\d*$/.test(value)) {
        e.target.value = value;
        onChange?.(e);
      }
    } else {
      onChange?.(e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (type === "number") {
      // 'e'キーの入力を防ぐ
      if (e.key.toLowerCase() === "e") {
        e.preventDefault();
      }
    }
  };

  return (
    <input
      className={readonlyClassName}
      id={id}
      placeholder={placeholder}
      type={type}
      value={value}
      name={id}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      required={required}
      readOnly={readonly}
    />
  );
}