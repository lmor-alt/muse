import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ExerciseProps, Note, ChordQuality, Accidental, ChordDrawingSettings } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { t } from '../../i18n/translations';
import { randomNoteInRange, isChordCorrect, getChordNoteCount, getChordAbbreviation } from '../../utils/musicTheory';
import { audioEngine } from '../../audio/audioEngine';
import { InteractiveStaff } from '../../components/staff/InteractiveStaff';
import { Staff } from '../../components/staff/Staff';
import { AccidentalToolbar } from '../../components/ui/AccidentalToolbar';
import { Feedback } from '../../components/feedback/Feedback';
import { ExerciseWrapper } from '../../components/exercise/ExerciseWrapper';
import { Button } from '../../components/ui';
import styles from './ChordDrawing.module.css';

// Chord intervals in semitones from root
const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
};

function buildChord(root: Note, quality: ChordQuality): Note[] {
  const intervals = CHORD_INTERVALS[quality];
  const rootSemitones = root.octave * 12 + getSemitones(root);

  return intervals.map((interval) => {
    const semitones = rootSemitones + interval;
    return semitonesToNote(semitones);
  });
}

function getSemitones(note: Note): number {
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let s = base[note.name];
  if (note.accidental === 'sharp') s += 1;
  if (note.accidental === 'flat') s -= 1;
  return s;
}

function semitonesToNote(semitones: number): Note {
  const octave = Math.floor(semitones / 12);
  const pitchClass = ((semitones % 12) + 12) % 12;

  const noteMap: { name: Note['name']; accidental: Accidental }[] = [
    { name: 'C', accidental: 'natural' },
    { name: 'C', accidental: 'sharp' },
    { name: 'D', accidental: 'natural' },
    { name: 'D', accidental: 'sharp' },
    { name: 'E', accidental: 'natural' },
    { name: 'F', accidental: 'natural' },
    { name: 'F', accidental: 'sharp' },
    { name: 'G', accidental: 'natural' },
    { name: 'G', accidental: 'sharp' },
    { name: 'A', accidental: 'natural' },
    { name: 'A', accidental: 'sharp' },
    { name: 'B', accidental: 'natural' },
  ];

  const { name, accidental } = noteMap[pitchClass];
  return { name, octave, accidental };
}

export const ChordDrawing: React.FC<ExerciseProps> = ({ settings }) => {
  const { language } = useGlobalStore();
  const { recordAnswer } = useExerciseStore();

  const chordSettings = settings as ChordDrawingSettings;

  const [rootNote, setRootNote] = useState<Note | null>(null);
  const [chordQuality, setChordQuality] = useState<ChordQuality>('major');
  const [drawnNotes, setDrawnNotes] = useState<Note[]>([]);
  const [selectedAccidental, setSelectedAccidental] = useState<Accidental>('natural');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [correctChordNotes, setCorrectChordNotes] = useState<Note[]>([]);

  const availableQualities = chordSettings.chordTypes.length > 0
    ? chordSettings.chordTypes
    : ['major', 'minor'] as ChordQuality[];

  const defaultNoteRange = {
    low: { name: 'C' as const, octave: 4, accidental: 'natural' as const },
    high: { name: 'G' as const, octave: 4, accidental: 'natural' as const },
  };
  const prevQuestionRef = useRef<string | null>(null);

  const generateQuestion = useCallback(() => {
    let quality: ChordQuality;
    let root: Note;
    let questionKey: string;
    let attempts = 0;

    do {
      quality = availableQualities[Math.floor(Math.random() * availableQualities.length)];
      root = randomNoteInRange(defaultNoteRange, true);
      questionKey = `${root.name}${root.octave}${root.accidental}-${quality}`;
      attempts++;
    } while (questionKey === prevQuestionRef.current && attempts < 10);
    prevQuestionRef.current = questionKey;

    setRootNote(root);
    setChordQuality(quality);
    setDrawnNotes([]);
    setSelectedAccidental('natural');
    setShowFeedback(false);
    setQuestionStartTime(Date.now());
    setCorrectChordNotes([]);
  }, [availableQualities]);

  useEffect(() => {
    generateQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePreviewChord = async () => {
    if (drawnNotes.length === 0) return;
    await audioEngine.playChordBlock(drawnNotes, 1);
  };

  const handleSubmit = () => {
    if (!rootNote) return;

    const expectedNoteCount = getChordNoteCount(chordQuality);
    if (drawnNotes.length !== expectedNoteCount) return;

    const correctNotes = buildChord(rootNote, chordQuality);
    const correct = isChordCorrect(drawnNotes, correctNotes);
    const timeSpent = (Date.now() - questionStartTime) / 1000;

    setIsCorrect(correct);
    setShowFeedback(true);
    setCorrectChordNotes(correctNotes);

    // Always use English note names and chord symbols
    const rootDisplay = `${rootNote.name}${rootNote.accidental === 'sharp' ? '♯' : rootNote.accidental === 'flat' ? '♭' : ''}`;
    const chordNameRecord = `${rootDisplay} ${t(`chord.${chordQuality}`, 'en')} (${getChordAbbreviation(chordQuality)})`;

    recordAnswer(
      correct,
      drawnNotes.map((n) => `${n.name}${n.accidental === 'sharp' ? '♯' : n.accidental === 'flat' ? '♭' : ''}`).join('-'),
      chordNameRecord,
      timeSpent
    );
  };

  const handleClear = () => {
    setDrawnNotes([]);
  };

  const handleNext = () => {
    generateQuestion();
  };

  if (!rootNote) return null;

  const expectedNoteCount = getChordNoteCount(chordQuality);
  // Always use English note names and chord symbols
  const rootDisplay = `${rootNote.name}${rootNote.accidental === 'sharp' ? '♯' : rootNote.accidental === 'flat' ? '♭' : ''}`;
  const chordNameShort = `${rootDisplay} ${t(`chord.${chordQuality}`, 'en')}`; // For instruction

  return (
    <ExerciseWrapper onSkip={generateQuestion}>
      <div className={styles.exercise}>
        <p className={styles.instruction}>
          {t('instruction.drawChord', language).replace('{chord}', chordNameShort)}
        </p>

        <p className={styles.noteCount}>
          {drawnNotes.length} / {expectedNoteCount} notes
        </p>

        <div className={styles.staffContainer}>
          <InteractiveStaff
            clef="treble"
            notes={drawnNotes}
            onNotesChange={setDrawnNotes}
            maxNotes={expectedNoteCount}
            selectedAccidental={selectedAccidental}
            disabled={showFeedback}
            width={400}
            height={150}
            stacked
          />
        </div>

        {!showFeedback && (
          <>
            <div className={styles.toolbar}>
              <AccidentalToolbar
                selected={selectedAccidental}
                onChange={setSelectedAccidental}
              />
              <Button variant="ghost" onClick={handleClear}>
                {t('game.clear', language)}
              </Button>
              <Button
                variant="secondary"
                onClick={handlePreviewChord}
                disabled={drawnNotes.length === 0}
              >
                Preview
              </Button>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={drawnNotes.length !== expectedNoteCount}
            >
              {t('game.submit', language)}
            </Button>
          </>
        )}

        {showFeedback && (
          <>
            {!isCorrect && correctChordNotes.length > 0 && (
              <div className={styles.correctAnswerStaff}>
                <span className={styles.correctLabel}>{t('feedback.theAnswerWas', language)}:</span>
                <Staff
                  clef="treble"
                  notes={correctChordNotes}
                  width={200}
                  height={120}
                  stacked
                />
              </div>
            )}
            <Feedback
              isCorrect={isCorrect}
              onNext={handleNext}
            />
          </>
        )}
      </div>
    </ExerciseWrapper>
  );
};
