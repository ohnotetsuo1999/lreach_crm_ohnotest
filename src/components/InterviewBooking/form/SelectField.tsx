import { ChangeEvent } from "react";

import { FormField, Label, Select } from "./index";

type Props = {
  label: string;
  htmlFor: string;
  required?: boolean;
  options: { label: string; value: string }[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  value: string;
};

export function SelectField({
  label,
  htmlFor,
  required,
  options,
  onChange,
  value,
}: Props) {
  return (
    <FormField>
      <Label label={label} htmlFor={htmlFor} required={required} />
      <Select
        onChange={onChange}
        options={options}
        required={required}
        value={value}
        id={htmlFor}
      />
    </FormField>
  );
}