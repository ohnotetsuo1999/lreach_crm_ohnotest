type Props = {
  label?: string;
  htmlFor?: string;
  required?: boolean;
};

export function Label({ label, htmlFor, required = false }: Props) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700"
    >
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
  );
}