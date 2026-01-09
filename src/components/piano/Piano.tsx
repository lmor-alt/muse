import React, { useCallback } from 'react';
import type { Note, NoteName, Accidental } from '../../types';
import { audioEngine } from '../../audio/audioEngine';
import { useGlobalStore } from '../../stores/globalStore';
import { getNoteName } from '../../i18n/translations';
import styles from './Piano.module.css';

interface PianoProps {
  startOctave?: number;
  endOctave?: number;
  onNoteClick?: (note: Note) => void;
  highlightedNote?: Note | null;
  disabled?: boolean;
  showLabels?: boolean;
}

interface KeyData {
  note: Note;
  isBlack: boolean;
  label: string;
}

const WHITE_NOTES: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_NOTES: { name: NoteName; accidental: Accidental; position: number }[] = [
  { name: 'C', accidental: 'sharp', position: 0 },
  { name: 'D', accidental: 'sharp', position: 1 },
  { name: 'F', accidental: 'sharp', position: 3 },
  { name: 'G', accidental: 'sharp', position: 4 },
  { name: 'A', accidental: 'sharp', position: 5 },
];

export const Piano: React.FC<PianoProps> = ({
  startOctave = 4,
  endOctave = 4,
  onNoteClick,
  highlightedNote,
  disabled = false,
  showLabels = false,
}) => {
  const { pianoKeySounds, soundEnabled, language } = useGlobalStore();

  const generateKeys = useCallback((): KeyData[] => {
    const keys: KeyData[] = [];

    for (let octave = startOctave; octave <= endOctave; octave++) {
      // White keys
      for (const name of WHITE_NOTES) {
        keys.push({
          note: { name, octave, accidental: 'natural' },
          isBlack: false,
          label: `${name}${octave}`,
        });
      }
    }

    return keys;
  }, [startOctave, endOctave]);

  const generateBlackKeys = useCallback((): KeyData[] => {
    const keys: KeyData[] = [];

    for (let octave = startOctave; octave <= endOctave; octave++) {
      for (const { name, accidental } of BLACK_NOTES) {
        keys.push({
          note: { name, octave, accidental },
          isBlack: true,
          label: `${name}#${octave}`,
        });
      }
    }

    return keys;
  }, [startOctave, endOctave]);

  const handleKeyClick = async (note: Note) => {
    if (disabled) return;

    // Play sound if enabled
    if (pianoKeySounds && soundEnabled) {
      try {
        await audioEngine.playNote(note, 0.8);
      } catch (error) {
        console.error('Failed to play note:', error);
      }
    }

    // Callback
    onNoteClick?.(note);
  };

  const isHighlighted = (note: Note): boolean => {
    if (!highlightedNote) return false;
    return (
      note.name === highlightedNote.name &&
      note.octave === highlightedNote.octave &&
      note.accidental === highlightedNote.accidental
    );
  };

  const whiteKeys = generateKeys();
  const blackKeys = generateBlackKeys();
  const octaveCount = endOctave - startOctave + 1;
  const whiteKeyCount = octaveCount * 7;

  // Calculate black key positions - center between white keys
  const getBlackKeyPosition = (octave: number, position: number): number => {
    const octaveOffset = (octave - startOctave) * 7;
    const whiteKeyWidth = 100 / whiteKeyCount;
    // Position at the boundary between white keys (position + 1 gives the right edge of current white key)
    return (octaveOffset + position + 1) * whiteKeyWidth;
  };

  return (
    <div className={`${styles.piano} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.keysContainer}>
        {/* White keys */}
        <div className={styles.whiteKeys}>
          {whiteKeys.map((key) => (
            <button
              key={key.label}
              className={`${styles.whiteKey} ${isHighlighted(key.note) ? styles.highlighted : ''}`}
              onClick={() => handleKeyClick(key.note)}
              disabled={disabled}
              aria-label={key.label}
            >
              {showLabels && (
                <span className={styles.keyLabel}>{getNoteName(key.note.name, language)}</span>
              )}
            </button>
          ))}
        </div>

        {/* Black keys */}
        <div className={styles.blackKeys}>
          {blackKeys.map((key) => {
            const blackNoteInfo = BLACK_NOTES.find(
              (bn) => bn.name === key.note.name
            );
            if (!blackNoteInfo) return null;

            const left = getBlackKeyPosition(key.note.octave, blackNoteInfo.position);

            return (
              <button
                key={key.label}
                className={`${styles.blackKey} ${isHighlighted(key.note) ? styles.highlighted : ''}`}
                style={{ left: `${left}%` }}
                onClick={() => handleKeyClick(key.note)}
                disabled={disabled}
                aria-label={key.label}
              >
                {showLabels && (
                  <span className={styles.blackKeyLabel}>{getNoteName(key.note.name, language)}#</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
