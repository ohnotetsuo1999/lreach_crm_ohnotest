import { ChangeEvent } from "react";
import { FormField, Input, Label } from "./index";

type Props = {
  htmlFor?: string;
  label: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  type: string;
  value?: string;
};

export function InputField({
  htmlFor,
  label,
  onChange,
  placeholder,
  readonly,
  required,
  type,
  value,
}: Props) {
  return (
    <FormField>
      <Label label={label} htmlFor={htmlFor} required={required} />
      <Input
        id={htmlFor}
        placeholder={placeholder}
        readonly={readonly}
        required={required}
        type={type}
        value={value}
        onChange={onChange}
      />
    </FormField>
  );
}