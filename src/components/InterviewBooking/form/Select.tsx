import { ChevronDown } from "lucide-react";
import { ChangeEvent } from "react";

type Props = {
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  id: string;
  value: string;
  required?: boolean;
};

export function Select({ onChange, options, id, value, required }: Props) {
  return (
    <div className="relative">
      <select
        className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all appearance-none ${
          !value ? "text-gray-400" : "text-gray-900"
        }`}
        onChange={onChange}
        id={id}
        name={id}
        value={value}
        required={required}
      >
        <option value="" disabled>
          選択してください
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  );
}