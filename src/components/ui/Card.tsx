import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'elevated' | 'flat' | 'outlined' | 'filled';
  accent?: 'none' | 'left' | 'top';
  state?: 'default' | 'success' | 'error';
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  interactive = false,
  padding = 'md',
  variant = 'default',
  accent = 'none',
  state = 'default',
  style,
}) => {
  const classes = [
    styles.card,
    styles[`padding-${padding}`],
    variant !== 'default' ? styles[variant] : '',
    interactive || onClick ? styles.interactive : '',
    accent === 'left' ? styles.accentLeft : '',
    accent === 'top' ? styles.accentTop : '',
    state === 'success' ? styles.success : '',
    state === 'error' ? styles.error : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={classes}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      style={style}
    >
      {children}
    </Component>
  );
};
