import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGlobalStore } from '../../stores/globalStore';
import { t } from '../../i18n/translations';
import styles from './Header.module.css';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
  showSettings?: boolean;
  onSettingsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  showBack = false,
  title,
  showSettings = false,
  onSettingsClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useGlobalStore();

  const isHome = location.pathname === '/';

  const handleBack = () => {
    navigate(-1);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'nl' : 'en');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {showBack && !isHome ? (
          <button
            className={styles.backButton}
            onClick={handleBack}
            aria-label={t('back', language)}
          >
            <span className={styles.backArrow}>←</span>
            {t('back', language)}
          </button>
        ) : isHome ? (
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>♪</div>
            <span className={styles.logo}>{t('appName', language)}</span>
          </div>
        ) : null}
      </div>

      {!isHome && title && (
        <div className={styles.center}>
          <h1 className={styles.title}>{title}</h1>
        </div>
      )}

      <div className={styles.right}>
        {showSettings && onSettingsClick && (
          <button
            className={styles.settingsButton}
            onClick={onSettingsClick}
            aria-label="Settings"
          >
            ⚙
          </button>
        )}
        <button
          className={styles.languageToggle}
          onClick={toggleLanguage}
          aria-label={`Switch to ${language === 'en' ? 'Dutch' : 'English'}`}
        >
          {language.toUpperCase()}
        </button>
      </div>
    </header>
  );
};
