import React from 'react';
import styles from './ReplayButton.module.css';

interface ReplayButtonProps {
  onClick: () => void;
  disabled?: boolean;
  replaysRemaining?: number | string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
}

export const ReplayButton: React.FC<ReplayButtonProps> = ({
  onClick,
  disabled = false,
  replaysRemaining,
  showCount = true,
  size = 'md',
  'aria-label': ariaLabel = 'Replay',
}) => {
  const hasLimitedReplays = replaysRemaining !== undefined && replaysRemaining !== '∞';

  return (
    <button
      type="button"
      className={`${styles.replayButton} ${styles[size]} ${disabled ? styles.disabled : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
      </svg>
      {showCount && hasLimitedReplays && (
        <span className={styles.badge}>{replaysRemaining}</span>
      )}
    </button>
  );
};
