import React, { useState, useCallback } from 'react';
import type { Note, Clef, Accidental } from '../../types';
import styles from './InteractiveStaff.module.css';

interface InteractiveStaffProps {
  clef: Clef;
  notes: Note[];
  onNotesChange: (notes: Note[]) => void;
  maxNotes?: number;
  selectedAccidental: Accidental;
  width?: number;
  height?: number;
  disabled?: boolean;
  stacked?: boolean; // If true, display notes as a chord (same x position)
}

const LINE_SPACING = 14;
const STAFF_TOP = 60;
const STAFF_LINES = [0, 1, 2, 3, 4].map((i) => STAFF_TOP + i * LINE_SPACING);
const NOTE_POSITIONS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

// Treble clef path (simplified for better rendering)
const TREBLE_CLEF_PATH = `M 22 76 C 22 76 26 72 26 66 C 26 58 20 52 20 44
  C 20 34 28 24 28 24 C 28 24 34 18 34 28 C 34 38 26 48 26 48
  C 26 48 22 54 22 62 C 22 70 26 74 26 74 C 26 74 32 78 32 86
  C 32 94 26 100 22 100 C 18 100 14 96 14 90 C 14 86 18 84 20 84
  C 22 84 24 86 24 88 C 24 92 22 94 22 94`;

const BASS_CLEF_PATH = `M 16 32 C 16 32 24 28 28 36 C 32 44 26 52 18 52
  C 10 52 6 44 6 36 C 6 24 16 16 28 16 C 40 16 48 28 48 42
  C 48 60 36 76 16 88 M 52 28 C 52 28 56 28 56 32 C 56 36 52 36 52 32
  M 52 44 C 52 44 56 44 56 48 C 56 52 52 52 52 48`;

export const InteractiveStaff: React.FC<InteractiveStaffProps> = ({
  clef,
  notes,
  onNotesChange,
  maxNotes,
  selectedAccidental,
  width = 400,
  height = 180,
  disabled = false,
  stacked = false,
}) => {
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number; note: Note } | null>(null);

  const clefOffset = 70;
  const noteAreaStart = clefOffset;
  const noteAreaWidth = width - clefOffset - 20;

  // Convert Y position to note
  const yToNote = useCallback((y: number): Note | null => {
    // Define the clickable range (extended above and below staff)
    const topBound = STAFF_TOP - LINE_SPACING * 4;
    const bottomBound = STAFF_LINES[4] + LINE_SPACING * 4;

    if (y < topBound || y > bottomBound) return null;

    // Calculate which position (half-line spacing) the Y falls into
    const halfSpacing = LINE_SPACING / 2;
    const positionFromTop = Math.round((y - topBound) / halfSpacing);

    // Map position to note
    // In treble clef: top of range is around C6, bottom is around C3
    // In bass clef: top of range is around E4, bottom is around E1

    let referenceOctave: number;
    let referenceNoteIndex: number;
    let referencePosition: number;

    if (clef === 'treble') {
      // B4 is on line 3 (middle of staff)
      referenceOctave = 4;
      referenceNoteIndex = 6; // B
      referencePosition = Math.round((STAFF_LINES[2] - topBound) / halfSpacing);
    } else {
      // D3 is on line 3 (middle of staff for bass)
      referenceOctave = 3;
      referenceNoteIndex = 1; // D
      referencePosition = Math.round((STAFF_LINES[2] - topBound) / halfSpacing);
    }

    const stepsFromReference = referencePosition - positionFromTop;
    const totalSteps = referenceNoteIndex + stepsFromReference;

    const noteIndex = ((totalSteps % 7) + 7) % 7;
    const octaveOffset = Math.floor(totalSteps / 7);
    const octave = referenceOctave + octaveOffset;

    if (octave < 1 || octave > 7) return null;

    return {
      name: NOTE_POSITIONS[noteIndex],
      octave,
      accidental: selectedAccidental,
    };
  }, [clef, selectedAccidental]);

  // Convert note back to Y position
  const noteToY = useCallback((note: Note): number => {
    const referenceOctave = clef === 'treble' ? 4 : 3;
    const referenceNoteIndex = clef === 'treble' ? 6 : 1; // B for treble, D for bass
    const referenceY = STAFF_LINES[2];

    const noteIndex = NOTE_POSITIONS.indexOf(note.name);
    const stepsFromReference =
      (note.octave - referenceOctave) * 7 + (noteIndex - referenceNoteIndex);

    return referenceY - stepsFromReference * (LINE_SPACING / 2);
  }, [clef]);

  // Get ledger lines for a Y position
  const getLedgerLines = (noteY: number): number[] => {
    const ledgers: number[] = [];
    const topLine = STAFF_LINES[0];
    const bottomLine = STAFF_LINES[4];

    if (noteY < topLine) {
      for (let y = topLine - LINE_SPACING; y >= noteY - LINE_SPACING / 2; y -= LINE_SPACING) {
        ledgers.push(y);
      }
    }

    if (noteY > bottomLine) {
      for (let y = bottomLine + LINE_SPACING; y <= noteY + LINE_SPACING / 2; y += LINE_SPACING) {
        ledgers.push(y);
      }
    }

    return ledgers;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < noteAreaStart || x > width - 20) {
      setHoverPosition(null);
      return;
    }

    const note = yToNote(y);
    if (note) {
      // Calculate X position for new note
      let noteX: number;
      if (stacked) {
        noteX = noteAreaStart + noteAreaWidth / 2;
      } else {
        noteX = noteAreaStart + 30 + notes.length * 50;
      }
      const snappedY = noteToY(note);
      setHoverPosition({ x: Math.min(noteX, width - 40), y: snappedY, note });
    } else {
      setHoverPosition(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on an existing note to remove it
    for (let i = 0; i < notes.length; i++) {
      let noteX: number;
      if (stacked) {
        noteX = noteAreaStart + noteAreaWidth / 2;
        // Account for second offset
        const sortedNotes = [...notes].sort((a, b) => noteToY(b) - noteToY(a));
        const sortedIndex = sortedNotes.findIndex(n =>
          n.name === notes[i].name && n.octave === notes[i].octave && n.accidental === notes[i].accidental
        );
        if (sortedIndex < sortedNotes.length - 1) {
          const thisY = noteToY(sortedNotes[sortedIndex]);
          const nextY = noteToY(sortedNotes[sortedIndex + 1]);
          if (Math.abs(thisY - nextY) <= LINE_SPACING / 2 + 1) {
            noteX += 14;
          }
        }
      } else {
        noteX = noteAreaStart + 30 + i * 50;
      }
      const noteY = noteToY(notes[i]);
      const dx = x - noteX;
      const dy = y - noteY;
      if (Math.sqrt(dx * dx + dy * dy) < 15) {
        // Remove this note
        const newNotes = [...notes];
        newNotes.splice(i, 1);
        onNotesChange(newNotes);
        return;
      }
    }

    // Add new note if not at max
    if (maxNotes && notes.length >= maxNotes) return;

    if (x < noteAreaStart || x > width - 20) return;

    const note = yToNote(y);
    if (note) {
      onNotesChange([...notes, note]);
    }
  };

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
      className={`${styles.interactiveStaff} ${disabled ? styles.disabled : ''}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
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
      <g className={styles.clef}>
        {clef === 'treble' ? (
          <path
            d={TREBLE_CLEF_PATH}
            transform={`translate(15, ${STAFF_TOP - 30}) scale(0.5)`}
          />
        ) : (
          <path
            d={BASS_CLEF_PATH}
            transform={`translate(15, ${STAFF_TOP - 10}) scale(0.5)`}
          />
        )}
      </g>

      {/* Hover preview */}
      {hoverPosition && !disabled && (!maxNotes || notes.length < maxNotes) && (
        <g className={styles.hoverPreview}>
          {getLedgerLines(hoverPosition.y).map((ly, li) => (
            <line
              key={li}
              x1={hoverPosition.x - 15}
              y1={ly}
              x2={hoverPosition.x + 15}
              y2={ly}
              className={styles.ledgerLinePreview}
            />
          ))}
          <ellipse
            cx={hoverPosition.x}
            cy={hoverPosition.y}
            rx={8}
            ry={6}
            className={styles.noteHeadPreview}
            transform={`rotate(-15, ${hoverPosition.x}, ${hoverPosition.y})`}
          />
          {hoverPosition.note.accidental !== 'natural' && (
            <text
              x={hoverPosition.x - 18}
              y={hoverPosition.y + 5}
              className={styles.accidentalPreview}
            >
              {getAccidentalSymbol(hoverPosition.note.accidental)}
            </text>
          )}
        </g>
      )}

      {/* Placed notes */}
      {notes.map((note, index) => {
        // Calculate x position
        let x: number;
        if (stacked) {
          // All notes at center position for chord display
          x = noteAreaStart + noteAreaWidth / 2;

          // Check for seconds (adjacent notes) - offset to avoid overlap
          const sortedNotes = [...notes].sort((a, b) => noteToY(b) - noteToY(a));
          const sortedIndex = sortedNotes.findIndex(n =>
            n.name === note.name && n.octave === note.octave && n.accidental === note.accidental
          );

          // Check if this note is a second apart from the note below it
          if (sortedIndex < sortedNotes.length - 1) {
            const thisY = noteToY(sortedNotes[sortedIndex]);
            const nextY = noteToY(sortedNotes[sortedIndex + 1]);
            // If notes are a second apart (half a LINE_SPACING), offset this note
            if (Math.abs(thisY - nextY) <= LINE_SPACING / 2 + 1) {
              x += 14; // Offset to the right
            }
          }
        } else {
          x = noteAreaStart + 30 + index * 50;
        }
        const y = noteToY(note);
        const ledgerLines = getLedgerLines(y);

        return (
          <g key={index} className={styles.note}>
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
            <ellipse
              cx={x}
              cy={y}
              rx={8}
              ry={6}
              className={styles.noteHead}
              transform={`rotate(-15, ${x}, ${y})`}
            />
            {note.accidental !== 'natural' && (
              <text
                x={x - 18}
                y={y + 5}
                className={styles.accidental}
              >
                {getAccidentalSymbol(note.accidental)}
              </text>
            )}
          </g>
        );
      })}

      {/* Click hint area */}
      {!disabled && (
        <rect
          x={noteAreaStart}
          y={STAFF_TOP - LINE_SPACING * 4}
          width={noteAreaWidth}
          height={LINE_SPACING * 12}
          className={styles.clickArea}
        />
      )}
    </svg>
  );
};
