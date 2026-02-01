import React from 'react';

interface TimezoneSelectorProps {
  timezoneOffset: number;
  onTimezoneChange: (offset: number) => void;
}

interface TimezoneOption {
  value: number;
  label: string;
}

// Common timezones with their  offsets
const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: -12, label: '-12' },
  { value: -11, label: '-11' },
  { value: -10, label: '-10' },
  { value: -9, label: '-9' },
  { value: -8, label: '-8' },
  { value: -7, label: '-7' },
  { value: -6, label: '-6' },
  { value: -5, label: '-5' },
  { value: -4, label: '-4' },
  { value: -3, label: '-3' },
  { value: -2, label: '-2' },
  { value: -1, label: '-1' },
  { value: 0, label: '+0' },
  { value: 1, label: '+1' },
  { value: 2, label: '+2' },
  { value: 3, label: '+3' },
  { value: 4, label: '+4' },
  { value: 5, label: '+5' },
  { value: 6, label: '+6' },
  { value: 7, label: '+7' },
  { value: 8, label: '+8' },
  { value: 9, label: '+9' },
  { value: 10, label: '+10' },
  { value: 11, label: '+11' },
  { value: 12, label: '+12' },
  { value: 13, label: '+13' },
  { value: 14, label: '+14' },
];

export function OffsetSelector({ timezoneOffset, onTimezoneChange }: TimezoneSelectorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label htmlFor="timezone-select" style={{ fontWeight: 'bold', fontSize: '14px' }}>
        Timezone Offset:
      </label>
      <select
        id="timezone-select"
        value={timezoneOffset}
        onChange={(e) => onTimezoneChange(Number(e.target.value))}
        style={{ 
          padding: '6px 12px', 
          fontSize: '14px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          minWidth: '180px'
        }}
      >
        {TIMEZONE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
