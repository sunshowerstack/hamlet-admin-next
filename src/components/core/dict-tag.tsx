import React from 'react';

interface DictDataOption {
  label: string;
  value: string | number;
  // elTagType?: string;
  elTagClass?: string;
}

interface DictTagProps {
  options: DictDataOption[];
  value: string | number | (string | number)[];
  showValue?: boolean;
  separator?: string;
}

export const DictTag: React.FC<DictTagProps> = ({ options, value, showValue = true, separator = ',' }) => {
  const getValues = () => {
    if (!value || value === '') return [];
    if (Array.isArray(value)) {
      // return value.map((v) => String(v));
      return value.map(String);
    }
    return String(value).split(separator);
  };

  const values = getValues();

  const renderTag = (item: DictDataOption) => {
    const { elTagClass, label } = item;

    // if (!elTagType || elTagType === 'default') {
    //   return (
    //     <span key={item.value} className={elTagClass}>
    //       {label}
    //     </span>
    //   );
    // }

    return (
      <span key={item.value} className={`tag tag-elTagType ${elTagClass || ''}`}>
        {label}
      </span>
    );
  };

  const unmatchedValues = values.filter((v) => !options.some((option) => String(option.value) === v));

  return (
    <div className="dict-tag">
      {options.filter((option) => values.includes(String(option.value))).map((option) => renderTag(option))}
      {unmatchedValues.length > 0 && showValue && <span className="unmatched">{unmatchedValues.join(' ')}</span>}
    </div>
  );
};
