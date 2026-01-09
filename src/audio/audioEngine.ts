import type { Note, Chord, ChordQuality, Accidental } from '../types';

// Note frequencies (A4 = 440Hz)
const A4_FREQUENCY = 440;
const A4_MIDI = 69;

// Salamander Grand Piano samples (hosted on Tone.js CDN)
// Using sparse sampling - load every 3 semitones and pitch-shift for notes in between
const SAMPLE_BASE_URL = 'https://tonejs.github.io/audio/salamander/';

// Sample notes to load (every minor third from A0 to C7)
// Tone.js uses format: A0.mp3, C1.mp3, Ds1.mp3, Fs1.mp3, etc.
const SAMPLE_NOTES = [
  'A0', 'C1', 'Ds1', 'Fs1', 'A1', 'C2', 'Ds2', 'Fs2',
  'A2', 'C3', 'Ds3', 'Fs3', 'A3', 'C4', 'Ds4', 'Fs4',
  'A4', 'C5', 'Ds5', 'Fs5', 'A5', 'C6', 'Ds6', 'Fs6',
  'A6', 'C7'
];

// Map note name to MIDI number
function sampleNameToMidi(name: string): number {
  const noteMap: Record<string, number> = {
    'C': 0, 'Cs': 1, 'Ds': 3, 'E': 4, 'F': 5, 'Fs': 6, 'G': 7, 'Gs': 8, 'A': 9, 'As': 10, 'B': 11
  };
  const notePart = name.slice(0, -1);
  const octave = parseInt(name.slice(-1), 10);
  return 12 + octave * 12 + noteMap[notePart];
}

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private samples: Map<number, AudioBuffer> = new Map();
  private samplesLoaded = false;
  private samplesLoading = false;
  private volume = 0.7;
  private enabled = true;

  async initialize(): Promise<void> {
    if (this.audioContext) return;

    try {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;

      // Start loading samples in background
      this.loadSamples();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw new Error('Audio initialization failed');
    }
  }

  private async loadSamples(): Promise<void> {
    if (this.samplesLoaded || this.samplesLoading || !this.audioContext) return;
    this.samplesLoading = true;

    try {
      const loadPromises = SAMPLE_NOTES.map(async (noteName) => {
        try {
          // Tone.js Salamander samples use simple naming: A4.mp3
          const url = `${SAMPLE_BASE_URL}${noteName}.mp3`;
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to load ${noteName}`);

          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
          const midi = sampleNameToMidi(noteName);
          this.samples.set(midi, audioBuffer);
        } catch (error) {
          console.warn(`Could not load sample ${noteName}:`, error);
        }
      });

      await Promise.all(loadPromises);
      this.samplesLoaded = this.samples.size > 0;
      console.log(`Loaded ${this.samples.size} piano samples`);
    } catch (error) {
      console.error('Failed to load piano samples:', error);
    } finally {
      this.samplesLoading = false;
    }
  }

  async ensureResumed(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  // Convert note to MIDI number
  noteToMidi(note: Note): number {
    const noteOffsets: Record<string, number> = {
      C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
    };

    let midi = 12 + note.octave * 12 + noteOffsets[note.name];

    if (note.accidental === 'sharp') midi += 1;
    if (note.accidental === 'flat') midi -= 1;

    return midi;
  }

  // Convert MIDI to frequency
  midiToFrequency(midi: number): number {
    return A4_FREQUENCY * Math.pow(2, (midi - A4_MIDI) / 12);
  }

  // Find closest sample and calculate pitch shift
  private findClosestSample(targetMidi: number): { midi: number; buffer: AudioBuffer; pitchShift: number } | null {
    let closestMidi = -1;
    let closestDistance = Infinity;

    for (const sampleMidi of this.samples.keys()) {
      const distance = Math.abs(sampleMidi - targetMidi);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestMidi = sampleMidi;
      }
    }

    if (closestMidi === -1) return null;

    const buffer = this.samples.get(closestMidi);
    if (!buffer) return null;

    // Calculate pitch shift ratio (semitone difference)
    const semitoneDiff = targetMidi - closestMidi;
    const pitchShift = Math.pow(2, semitoneDiff / 12);

    return { midi: closestMidi, buffer, pitchShift };
  }

  // Play a note using real samples
  async playNoteSampled(note: Note, duration = 1): Promise<void> {
    if (!this.enabled || !this.audioContext || !this.masterGain) {
      await this.initialize();
    }
    await this.ensureResumed();

    if (!this.audioContext || !this.masterGain) return;

    const targetMidi = this.noteToMidi(note);
    const sampleInfo = this.findClosestSample(targetMidi);

    if (!sampleInfo) {
      // Fallback to synthesis if no samples available
      await this.playNoteSynth(note, duration);
      return;
    }

    const { buffer, pitchShift } = sampleInfo;

    // Create source node
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitchShift;

    // Create envelope for natural decay
    const gainNode = this.audioContext.createGain();
    const now = this.audioContext.currentTime;

    // Natural piano envelope - quick attack, long decay
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.85, now + 0.01);

    // Let the sample play naturally for most of the duration
    const releaseStart = Math.min(duration - 0.2, buffer.duration * 0.8);
    if (releaseStart > 0.01) {
      gainNode.gain.setValueAtTime(0.85, now + releaseStart);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
    } else {
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
    }

    // Connect and play
    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    source.start(now);
    source.stop(now + duration + 0.1);
  }

  // Play a single note using synthesis (fallback)
  async playNoteSynth(note: Note, duration = 1): Promise<void> {
    if (!this.enabled || !this.audioContext || !this.masterGain) {
      await this.initialize();
    }
    await this.ensureResumed();

    if (!this.audioContext || !this.masterGain) return;

    const midi = this.noteToMidi(note);
    const frequency = this.midiToFrequency(midi);

    // Create oscillator with piano-like envelope
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    // Use triangle wave for warmer sound
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;

    // Add slight harmonic richness with second oscillator
    const oscillator2 = this.audioContext.createOscillator();
    oscillator2.type = 'sine';
    oscillator2.frequency.value = frequency * 2;
    const gain2 = this.audioContext.createGain();
    gain2.gain.value = 0.15;

    // Low-pass filter for warmth
    filter.type = 'lowpass';
    filter.frequency.value = Math.min(frequency * 6, 8000);
    filter.Q.value = 0.5;

    // ADSR envelope
    const now = this.audioContext.currentTime;
    const attack = 0.02;
    const decay = 0.1;
    const sustain = 0.6;
    const release = 0.3;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.8, now + attack);
    gainNode.gain.linearRampToValueAtTime(sustain * 0.8, now + attack + decay);
    gainNode.gain.setValueAtTime(sustain * 0.8, now + duration - release);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    // Connect nodes
    oscillator.connect(filter);
    oscillator2.connect(gain2);
    gain2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(now);
    oscillator2.start(now);
    oscillator.stop(now + duration);
    oscillator2.stop(now + duration);
  }

  // Play a note (uses samples when available, falls back to synthesis)
  async playNote(note: Note, duration = 1): Promise<void> {
    if (this.samplesLoaded && this.samples.size > 0) {
      await this.playNoteSampled(note, duration);
    } else {
      await this.playNoteSynth(note, duration);
    }
  }

  // Play multiple notes as a chord (block)
  async playChordBlock(notes: Note[], duration = 1.5): Promise<void> {
    await Promise.all(notes.map((note) => this.playNote(note, duration)));
  }

  // Play notes as arpeggiated chord
  async playChordArpeggiated(notes: Note[], noteDuration = 0.3, gap = 0.15): Promise<void> {
    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => {
        this.playNote(notes[i], noteDuration);
      }, i * (noteDuration * 1000 * 0.5 + gap * 1000));
    }
  }

  // Play a chord by quality
  async playChord(chord: Chord, voicing: 'block' | 'arpeggiated' = 'block', duration = 1.5): Promise<void> {
    const notes = this.getChordNotes(chord);
    if (voicing === 'block') {
      await this.playChordBlock(notes, duration);
    } else {
      await this.playChordArpeggiated(notes, 0.4, 0.1);
    }
  }

  // Get notes for a chord
  getChordNotes(chord: Chord): Note[] {
    const intervals = this.getChordIntervals(chord.quality);
    const rootMidi = this.noteToMidi(chord.root);

    const notes = intervals.map((semitones) => {
      const midi = rootMidi + semitones;
      return this.midiToNote(midi);
    });

    // Apply inversion
    if (chord.inversion > 0) {
      for (let i = 0; i < chord.inversion && i < notes.length - 1; i++) {
        const note = notes.shift()!;
        note.octave += 1;
        notes.push(note);
      }
    }

    return notes;
  }

  // Get intervals for chord quality (in semitones from root)
  private getChordIntervals(quality: ChordQuality): number[] {
    switch (quality) {
      case 'major': return [0, 4, 7];
      case 'minor': return [0, 3, 7];
      case 'diminished': return [0, 3, 6];
      case 'augmented': return [0, 4, 8];
      case 'major7': return [0, 4, 7, 11];
      case 'minor7': return [0, 3, 7, 10];
      case 'dominant7': return [0, 4, 7, 10];
      default: return [0, 4, 7];
    }
  }

  // Convert MIDI to Note
  midiToNote(midi: number): Note {
    const noteNames = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'] as const;
    const accidentals: Accidental[] = ['natural', 'sharp', 'natural', 'sharp', 'natural', 'natural', 'sharp', 'natural', 'sharp', 'natural', 'sharp', 'natural'];

    const noteIndex = midi % 12;
    const octave = Math.floor(midi / 12) - 1;

    return {
      name: noteNames[noteIndex],
      octave,
      accidental: accidentals[noteIndex],
    };
  }

  // Play interval (two notes)
  async playInterval(
    note1: Note,
    note2: Note,
    mode: 'melodic' | 'harmonic' = 'melodic',
    duration = 0.8
  ): Promise<void> {
    if (mode === 'harmonic') {
      await Promise.all([this.playNote(note1, duration), this.playNote(note2, duration)]);
    } else {
      await this.playNote(note1, duration);
      await new Promise((resolve) => setTimeout(resolve, duration * 1000 + 200));
      await this.playNote(note2, duration);
    }
  }

  // Play reference pitch (A4 or C4)
  async playReferencePitch(type: 'A4' | 'C4' = 'A4'): Promise<void> {
    const note: Note = type === 'A4'
      ? { name: 'A', octave: 4, accidental: 'natural' }
      : { name: 'C', octave: 4, accidental: 'natural' };
    await this.playNote(note, 1.5);
  }

  // Play a rhythm pattern
  async playRhythm(
    pattern: boolean[],
    tempo: number,
    subdivision: 'eighth' | 'sixteenth'
  ): Promise<void> {
    const beatDuration = 60 / tempo; // duration of one beat in seconds
    const subdiv = subdivision === 'eighth' ? 2 : 4;
    const noteDuration = beatDuration / subdiv;

    const note: Note = { name: 'C', octave: 4, accidental: 'natural' };

    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i]) {
        this.playNote(note, noteDuration * 0.8);
      }
      await new Promise((resolve) => setTimeout(resolve, noteDuration * 1000));
    }
  }

  // Play metronome click
  async playMetronomeClick(isDownbeat = false): Promise<void> {
    if (!this.enabled || !this.audioContext || !this.masterGain) {
      await this.initialize();
    }
    await this.ensureResumed();

    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = isDownbeat ? 1000 : 800;

    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }

  // Check if samples are loaded
  areSamplesLoaded(): boolean {
    return this.samplesLoaded;
  }

  // Check if audio is available
  isAvailable(): boolean {
    return typeof AudioContext !== 'undefined' || typeof (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext !== 'undefined';
  }

  // Cleanup
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }
    this.samples.clear();
    this.samplesLoaded = false;
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
