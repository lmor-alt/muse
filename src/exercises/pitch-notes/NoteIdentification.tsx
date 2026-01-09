import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ExerciseProps, Note, NoteIdentificationSettings, Clef } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { t, getNoteName } from '../../i18n/translations';
import { randomNoteInRange } from '../../utils/musicTheory';
import { Staff } from '../../components/staff/Staff';
import { Piano } from '../../components/piano/Piano';
import { NoteButtons } from '../../components/ui/NoteButtons';
import { Feedback } from '../../components/feedback/Feedback';
import { ExerciseWrapper } from '../../components/exercise/ExerciseWrapper';
import styles from './NoteIdentification.module.css';

export const NoteIdentification: React.FC<ExerciseProps> = ({
  settings,
  inputMethod,
}) => {
  const { language } = useGlobalStore();
  const { recordAnswer } = useExerciseStore();

  const noteSettings = settings as NoteIdentificationSettings;

  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [currentClef, setCurrentClef] = useState<Clef>('treble');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const prevNoteRef = useRef<string | null>(null);

  const generateQuestion = useCallback(() => {
    // Select clef
    let clef: Clef;
    if (noteSettings.clef === 'both') {
      clef = Math.random() > 0.5 ? 'treble' : 'bass';
    } else {
      clef = noteSettings.clef;
    }

    // Generate random note, ensuring it's different from the previous one
    let note: Note;
    let noteKey: string;
    let attempts = 0;
    do {
      note = randomNoteInRange(noteSettings.noteRange, noteSettings.includeAccidentals);
      noteKey = `${note.name}${note.octave}${note.accidental}`;
      attempts++;
    } while (noteKey === prevNoteRef.current && attempts < 10);
    prevNoteRef.current = noteKey;

    setCurrentClef(clef);
    setCurrentNote(note);
    setShowFeedback(false);
    setQuestionStartTime(Date.now());
  }, [noteSettings]);

  useEffect(() => {
    generateQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (selectedNote: Note) => {
    if (showFeedback || !currentNote) return;

    // Compare only the note name (not octave) for identification
    const correct = selectedNote.name === currentNote.name &&
      selectedNote.accidental === currentNote.accidental;

    const timeSpent = (Date.now() - questionStartTime) / 1000;

    setIsCorrect(correct);
    setShowFeedback(true);

    recordAnswer(
      correct,
      `${selectedNote.name}${selectedNote.accidental === 'sharp' ? '♯' : selectedNote.accidental === 'flat' ? '♭' : ''}`,
      `${currentNote.name}${currentNote.accidental === 'sharp' ? '♯' : currentNote.accidental === 'flat' ? '♭' : ''}`,
      timeSpent
    );
  };

  const handleNext = () => {
    generateQuestion();
  };

  const getCorrectAnswerDisplay = () => {
    if (!currentNote) return '';
    const noteName = getNoteName(currentNote.name, language);
    const accidental = currentNote.accidental === 'sharp' ? '♯' : currentNote.accidental === 'flat' ? '♭' : '';
    return `${noteName}${accidental}`;
  };

  if (!currentNote) return null;

  return (
    <ExerciseWrapper onSkip={generateQuestion}>
      <div className={styles.exercise}>
        <p className={styles.instruction}>{t('instruction.identifyNote', language)}</p>

        <div className={styles.staffContainer}>
          <Staff
            clef={currentClef}
            notes={[currentNote]}
            width={300}
            height={120}
          />
        </div>

        {!showFeedback && (
          <div className={styles.inputContainer}>
            {inputMethod === 'piano' ? (
              <Piano
                startOctave={4}
                endOctave={4}
                onNoteClick={handleAnswer}
                showLabels
              />
            ) : (
              <NoteButtons
                onNoteClick={handleAnswer}
                includeAccidentals={noteSettings.includeAccidentals}
              />
            )}
          </div>
        )}

        {showFeedback && (
          <Feedback
            isCorrect={isCorrect}
            correctAnswer={getCorrectAnswerDisplay()}
            onNext={handleNext}
          />
        )}
      </div>
    </ExerciseWrapper>
  );
};
