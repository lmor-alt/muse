import React, { type JSX } from 'react';
import type { RhythmEvent, RhythmValue } from '../../types';
import styles from './RhythmStaff.module.css';

interface RhythmStaffProps {
  timeSignature: [number, number];
  bars: number;
  events: RhythmEvent[];
  onEventClick?: (index: number) => void;
  interactive?: boolean;
  highlightIndex?: number;
  showCorrect?: RhythmEvent[]; // For showing correct answer comparison
  width?: number;
  height?: number;
}

// Beat values in terms of quarter notes
const BEAT_VALUES: Record<RhythmValue, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
};

// Get SVG path for note head based on value
const getNoteHead = (value: RhythmValue, x: number, y: number, isRest: boolean): JSX.Element => {
  if (isRest) {
    return getRestSymbol(value, x, y);
  }

  const filled = value === 'quarter' || value === 'eighth' || value === 'sixteenth';

  // Note head
  const headElement = (
    <ellipse
      cx={x}
      cy={y}
      rx={8}
      ry={6}
      className={filled ? styles.noteHeadFilled : styles.noteHeadOpen}
      transform={`rotate(-15, ${x}, ${y})`}
    />
  );

  // Stem (all except whole notes)
  const stemElement = value !== 'whole' ? (
    <line
      x1={x + 7}
      y1={y}
      x2={x + 7}
      y2={y - 35}
      className={styles.stem}
    />
  ) : null;

  // Flags for eighth and sixteenth
  const flagElement = value === 'eighth' ? (
    <path
      d={`M ${x + 7} ${y - 35} Q ${x + 20} ${y - 25} ${x + 12} ${y - 15}`}
      className={styles.flag}
    />
  ) : value === 'sixteenth' ? (
    <>
      <path
        d={`M ${x + 7} ${y - 35} Q ${x + 20} ${y - 25} ${x + 12} ${y - 15}`}
        className={styles.flag}
      />
      <path
        d={`M ${x + 7} ${y - 28} Q ${x + 20} ${y - 18} ${x + 12} ${y - 8}`}
        className={styles.flag}
      />
    </>
  ) : null;

  return (
    <g>
      {headElement}
      {stemElement}
      {flagElement}
    </g>
  );
};

// Get SVG for rest symbols
const getRestSymbol = (value: RhythmValue, x: number, y: number): JSX.Element => {
  switch (value) {
    case 'whole':
      return (
        <rect
          x={x - 8}
          y={y - 10}
          width={16}
          height={6}
          className={styles.rest}
        />
      );
    case 'half':
      return (
        <rect
          x={x - 8}
          y={y - 4}
          width={16}
          height={6}
          className={styles.rest}
        />
      );
    case 'quarter':
      return (
        <path
          d={`M ${x - 4} ${y - 18} L ${x + 4} ${y - 8} L ${x - 4} ${y + 2} L ${x + 4} ${y + 12} Q ${x - 6} ${y + 8} ${x - 4} ${y + 2}`}
          className={styles.rest}
        />
      );
    case 'eighth':
      return (
        <g>
          <circle cx={x + 3} cy={y - 10} r={3} className={styles.rest} />
          <line x1={x + 3} y1={y - 10} x2={x - 3} y2={y + 10} className={styles.restStem} />
        </g>
      );
    case 'sixteenth':
      return (
        <g>
          <circle cx={x + 3} cy={y - 14} r={3} className={styles.rest} />
          <circle cx={x + 3} cy={y - 6} r={3} className={styles.rest} />
          <line x1={x + 3} y1={y - 14} x2={x - 3} y2={y + 10} className={styles.restStem} />
        </g>
      );
    default:
      return <></>;
  }
};

// Calculate total beats from events
export const calculateTotalBeats = (events: RhythmEvent[]): number => {
  return events.reduce((sum, event) => sum + BEAT_VALUES[event.value], 0);
};

// Get beat value for a rhythm value
export const getBeatValue = (value: RhythmValue): number => BEAT_VALUES[value];

export const RhythmStaff: React.FC<RhythmStaffProps> = ({
  timeSignature,
  bars,
  events,
  onEventClick,
  interactive = false,
  highlightIndex,
  showCorrect,
  width = 600,
  height = 120,
}) => {
  const beatsPerBar = timeSignature[0];
  const totalBeats = beatsPerBar * bars;

  // Calculate x positions for events
  const staffPadding = 80; // For time signature
  const staffWidth = width - staffPadding - 20;
  const pixelsPerBeat = staffWidth / totalBeats;

  let currentBeat = 0;
  const eventPositions = events.map((event) => {
    const x = staffPadding + currentBeat * pixelsPerBeat;
    currentBeat += BEAT_VALUES[event.value];
    return x;
  });

  // Staff line Y position (single line for percussion/rhythm)
  const staffY = height / 2;

  // Bar lines
  const barLines: number[] = [];
  for (let i = 1; i <= bars; i++) {
    barLines.push(staffPadding + i * beatsPerBar * pixelsPerBeat);
  }

  return (
    <svg
      className={`${styles.rhythmStaff} ${interactive ? styles.interactive : ''}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Single staff line */}
      <line
        x1={20}
        y1={staffY}
        x2={width - 10}
        y2={staffY}
        className={styles.staffLine}
      />

      {/* Time signature */}
      <text x={35} y={staffY - 12} className={styles.timeSignatureTop}>
        {timeSignature[0]}
      </text>
      <text x={35} y={staffY + 22} className={styles.timeSignatureBottom}>
        {timeSignature[1]}
      </text>

      {/* Bar lines */}
      {barLines.map((x, i) => (
        <line
          key={i}
          x1={x}
          y1={staffY - 25}
          x2={x}
          y2={staffY + 25}
          className={styles.barLine}
        />
      ))}

      {/* Starting bar line */}
      <line
        x1={staffPadding - 10}
        y1={staffY - 25}
        x2={staffPadding - 10}
        y2={staffY + 25}
        className={styles.barLine}
      />

      {/* Events (notes/rests) */}
      {events.map((event, index) => {
        const x = eventPositions[index];
        const isHighlighted = highlightIndex === index;
        const isCorrect = showCorrect
          ? showCorrect[index] &&
            event.value === showCorrect[index].value &&
            event.isRest === showCorrect[index].isRest
          : true;

        return (
          <g
            key={index}
            className={`${styles.event} ${isHighlighted ? styles.highlighted : ''} ${!isCorrect ? styles.incorrect : ''}`}
            onClick={() => interactive && onEventClick?.(index)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            {getNoteHead(event.value, x, staffY, event.isRest)}
          </g>
        );
      })}

      {/* Show correct answer below if provided and different */}
      {showCorrect && (
        <g className={styles.correctAnswer}>
          {showCorrect.map((event, index) => {
            const userEvent = events[index];
            const isDifferent = !userEvent ||
              event.value !== userEvent.value ||
              event.isRest !== userEvent.isRest;

            if (!isDifferent) return null;

            // Calculate position for correct event
            let correctBeat = 0;
            for (let i = 0; i < index; i++) {
              correctBeat += BEAT_VALUES[showCorrect[i].value];
            }
            const x = staffPadding + correctBeat * pixelsPerBeat;

            return (
              <g key={index} className={styles.correctEvent} transform={`translate(0, 50)`}>
                {getNoteHead(event.value, x, staffY, event.isRest)}
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
};
