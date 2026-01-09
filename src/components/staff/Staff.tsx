import React from 'react';
import type { Note, Clef, Accidental } from '../../types';
import styles from './Staff.module.css';

interface StaffProps {
  clef: Clef;
  notes?: Note[];
  width?: number;
  height?: number;
  showClef?: boolean;
  className?: string;
  stacked?: boolean; // If true, display notes as a chord (same x position)
}

// Staff line Y positions (from top, 5 lines)
const LINE_SPACING = 12;
const STAFF_TOP = 40;
const STAFF_LINES = [0, 1, 2, 3, 4].map((i) => STAFF_TOP + i * LINE_SPACING);

// Note positions relative to staff (distance from middle line B4 in treble, D3 in bass)
const TREBLE_MIDDLE_LINE = 2; // B4 is on line 3 (index 2)
const BASS_MIDDLE_LINE = 2; // D3 is on line 3 (index 2)

// Note order for position calculation (ascending)
const NOTE_POSITIONS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// SVG path for bass clef (treble uses image)
const BASS_CLEF_PATH = `M 16 32 C 16 32 24 28 28 36 C 32 44 26 52 18 52
  C 10 52 6 44 6 36 C 6 24 16 16 28 16 C 40 16 48 28 48 42
  C 48 60 36 76 16 88 M 52 28 C 52 28 56 28 56 32 C 56 36 52 36 52 32
  M 52 44 C 52 44 56 44 56 48 C 56 52 52 52 52 48`;

// Treble clef image path
const TREBLE_CLEF_IMAGE = '/images/treble-clef.png';

export const Staff: React.FC<StaffProps> = ({
  clef,
  notes = [],
  width = 300,
  height = 120,
  showClef = true,
  className = '',
  stacked = false,
}) => {
  const clefOffset = showClef ? 60 : 20;
  const noteAreaWidth = width - clefOffset - 20;

  // Calculate Y position for a note
  const getNoteY = (note: Note): number => {
    const noteIndex = NOTE_POSITIONS.indexOf(note.name);
    const referenceOctave = clef === 'treble' ? 4 : 2;
    const referenceLine = clef === 'treble' ? TREBLE_MIDDLE_LINE : BASS_MIDDLE_LINE;

    // B4 for treble is on line 3, D3 for bass is on line 3
    // Each step up/down moves half a LINE_SPACING
    let stepsFromReference: number;

    if (clef === 'treble') {
      // Reference: B4 on line 3 (index 2)
      const refNoteIndex = NOTE_POSITIONS.indexOf('B');
      stepsFromReference =
        (note.octave - referenceOctave) * 7 + (noteIndex - refNoteIndex);
    } else {
      // Reference: D3 on line 3 (index 2)
      const refNoteIndex = NOTE_POSITIONS.indexOf('D');
      stepsFromReference =
        (note.octave - referenceOctave) * 7 + (noteIndex - refNoteIndex);
    }

    const y = STAFF_LINES[referenceLine] - stepsFromReference * (LINE_SPACING / 2);
    return y;
  };

  // Calculate ledger lines needed for a note
  const getLedgerLines = (noteY: number): number[] => {
    const ledgers: number[] = [];
    const topLine = STAFF_LINES[0];
    const bottomLine = STAFF_LINES[4];

    // Ledger lines above staff
    if (noteY < topLine) {
      for (let y = topLine - LINE_SPACING; y >= noteY - LINE_SPACING / 2; y -= LINE_SPACING) {
        ledgers.push(y);
      }
    }

    // Ledger lines below staff
    if (noteY > bottomLine) {
      for (let y = bottomLine + LINE_SPACING; y <= noteY + LINE_SPACING / 2; y += LINE_SPACING) {
        ledgers.push(y);
      }
    }

    return ledgers;
  };

  // Get accidental symbol
  const getAccidentalSymbol = (accidental: Accidental): string => {
    switch (accidental) {
      case 'sharp':
        return '♯';
      case 'flat':
        return '♭';
      default:
        return '';
    }
  };

  return (
    <svg
      className={`${styles.staff} ${className}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Staff lines */}
      {STAFF_LINES.map((y, i) => (
        <line
          key={i}
          x1={10}
          y1={y}
          x2={width - 10}
          y2={y}
          className={styles.staffLine}
        />
      ))}

      {/* Clef */}
      {showClef && (
        <g className={styles.clef}>
          {clef === 'treble' ? (
            <image
              href={TREBLE_CLEF_IMAGE}
              x={8}
              y={STAFF_TOP - 28}
              width={35}
              height={85}
              preserveAspectRatio="xMidYMid meet"
            />
          ) : (
            <path
              d={BASS_CLEF_PATH}
              transform={`translate(10, ${STAFF_TOP - 10}) scale(0.5)`}
            />
          )}
        </g>
      )}

      {/* Notes */}
      {notes.map((note, index) => {
        // Calculate base x position
        let x: number;
        if (stacked) {
          // All notes at center position for chord display
          x = clefOffset + noteAreaWidth / 2;

          // Check for seconds (adjacent notes) - offset to avoid overlap
          const y = getNoteY(note);
          const sortedNotes = [...notes].sort((a, b) => getNoteY(b) - getNoteY(a));
          const sortedIndex = sortedNotes.findIndex(n =>
            n.name === note.name && n.octave === note.octave && n.accidental === note.accidental
          );

          // Check if this note is a second apart from the note below it
          if (sortedIndex < sortedNotes.length - 1) {
            const thisY = getNoteY(sortedNotes[sortedIndex]);
            const nextY = getNoteY(sortedNotes[sortedIndex + 1]);
            // If notes are a second apart (half a LINE_SPACING), offset this note
            if (Math.abs(thisY - nextY) <= LINE_SPACING / 2 + 1) {
              x += 12; // Offset to the right
            }
          }
        } else {
          // Spread notes horizontally for melodic display
          x = clefOffset + (noteAreaWidth / (notes.length + 1)) * (index + 1);
        }
        const y = getNoteY(note);
        const ledgerLines = getLedgerLines(y);

        return (
          <g key={index} className={styles.note}>
            {/* Ledger lines */}
            {ledgerLines.map((ly, li) => (
              <line
                key={li}
                x1={x - 15}
                y1={ly}
                x2={x + 15}
                y2={ly}
                className={styles.ledgerLine}
              />
            ))}

            {/* Note head */}
            <ellipse
              cx={x}
              cy={y}
              rx={7}
              ry={5}
              className={styles.noteHead}
              transform={`rotate(-15, ${x}, ${y})`}
            />

            {/* Accidental */}
            {note.accidental !== 'natural' && (
              <text
                x={x - 16}
                y={y + 4}
                className={styles.accidental}
              >
                {getAccidentalSymbol(note.accidental)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
