import React from 'react';
import type { Note, NoteName, Accidental } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { getNoteName } from '../../i18n/translations';
import styles from './NoteButtons.module.css';

interface NoteButtonsProps {
  onNoteClick: (note: Note) => void;
  octave?: number;
  includeAccidentals?: boolean;
  highlightedNote?: Note | null;
  disabled?: boolean;
  /** Use English note letters (C, D, E) instead of translated names (useful for chord exercises) */
  useEnglishNotes?: boolean;
}

const NATURAL_NOTES: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export const NoteButtons: React.FC<NoteButtonsProps> = ({
  onNoteClick,
  octave = 4,
  includeAccidentals = false,
  highlightedNote,
  disabled = false,
  useEnglishNotes = false,
}) => {
  const { language } = useGlobalStore();

  const handleClick = (name: NoteName, accidental: Accidental = 'natural') => {
    const note: Note = {
      name,
      octave,
      accidental,
    };
    onNoteClick(note);
  };

  const isHighlighted = (name: NoteName, accidental: Accidental = 'natural'): boolean => {
    if (!highlightedNote) return false;
    return (
      name === highlightedNote.name &&
      accidental === highlightedNote.accidental
    );
  };

  const getLabel = (name: NoteName, accidental: Accidental = 'natural'): string => {
    // For chord exercises, use English note letters instead of translated names
    const baseName = useEnglishNotes ? name : getNoteName(name, language);
    if (accidental === 'sharp') return `${baseName}♯`;
    if (accidental === 'flat') return `${baseName}♭`;
    return baseName;
  };

  // Keyboard shortcuts
  const keyMap: Record<string, number> = {
    '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6,
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      const noteIndex = keyMap[e.key];
      if (noteIndex !== undefined) {
        e.preventDefault();
        // Shift = sharp, Alt/Option = flat
        let accidental: Accidental = 'natural';
        if (e.shiftKey && includeAccidentals) {
          accidental = 'sharp';
        } else if (e.altKey && includeAccidentals) {
          accidental = 'flat';
        }
        handleClick(NATURAL_NOTES[noteIndex], accidental);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, includeAccidentals]);

  return (
    <div className={`${styles.noteButtons} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.columns}>
        {NATURAL_NOTES.map((name, index) => (
          <div key={name} className={styles.noteColumn}>
            {/* Sharp button above */}
            {includeAccidentals && (
              <button
                className={`${styles.accidentalButton} ${styles.sharpButton} ${isHighlighted(name, 'sharp') ? styles.highlighted : ''}`}
                onClick={() => handleClick(name, 'sharp')}
                disabled={disabled}
                aria-label={getLabel(name, 'sharp')}
              >
                <span className={styles.accidentalName}>{getLabel(name, 'sharp')}</span>
              </button>
            )}

            {/* Natural note button */}
            <button
              className={`${styles.noteButton} ${isHighlighted(name) ? styles.highlighted : ''}`}
              onClick={() => handleClick(name)}
              disabled={disabled}
              aria-label={getLabel(name)}
            >
              <span className={styles.noteName}>{getLabel(name)}</span>
              <span className={styles.keyHint}>{index + 1}</span>
            </button>

            {/* Flat button below */}
            {includeAccidentals && (
              <button
                className={`${styles.accidentalButton} ${styles.flatButton} ${isHighlighted(name, 'flat') ? styles.highlighted : ''}`}
                onClick={() => handleClick(name, 'flat')}
                disabled={disabled}
                aria-label={getLabel(name, 'flat')}
              >
                <span className={styles.accidentalName}>{getLabel(name, 'flat')}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
