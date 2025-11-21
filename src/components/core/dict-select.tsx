import React from 'react';

interface DictDataOption {
  label: string;
  value: string | number;
}

interface DictSelectProps {
  options: DictDataOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
}

export const DictSelect: React.FC<DictSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '请选择',
  clearable = true,
  disabled = false
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className="dict-select"
    >
      {clearable && (
        <option value="">{placeholder}</option>
      )}
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};