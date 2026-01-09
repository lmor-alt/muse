import React from 'react';
import type { Accidental } from '../../types';
import styles from './AccidentalToolbar.module.css';

interface AccidentalToolbarProps {
  selected: Accidental;
  onChange: (accidental: Accidental) => void;
  disabled?: boolean;
}

const ACCIDENTALS: { value: Accidental; symbol: string; label: string }[] = [
  { value: 'natural', symbol: '♮', label: 'Natural' },
  { value: 'sharp', symbol: '♯', label: 'Sharp' },
  { value: 'flat', symbol: '♭', label: 'Flat' },
];

export const AccidentalToolbar: React.FC<AccidentalToolbarProps> = ({
  selected,
  onChange,
  disabled = false,
}) => {
  return (
    <div className={`${styles.toolbar} ${disabled ? styles.disabled : ''}`}>
      {ACCIDENTALS.map(({ value, symbol, label }) => (
        <button
          key={value}
          className={`${styles.button} ${selected === value ? styles.selected : ''}`}
          onClick={() => onChange(value)}
          disabled={disabled}
          aria-label={label}
          aria-pressed={selected === value}
        >
          {symbol}
        </button>
      ))}
    </div>
  );
};
