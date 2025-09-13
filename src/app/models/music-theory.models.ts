export interface Note {
  name: string;
  octave?: number | null;
  isRoot: boolean;
}

export interface Interval {
  name: string;
  semitones: number;
  note: Note;
}

export interface Chord {
  name: string;
  notes: Note[];
  type: string; // 'triad', 'seventh', etc.
  position?: { string: number; fret: number }[];
}

export interface Scale {
  root: Note;
  type: string; // 'Ionian', 'Pentatonic Minor', etc.
  notes: Note[];
  intervals: Interval[];
}

export interface MusicTheoryState {
  selectedScale: Scale;
  chordsInKey: Chord[];
  error?: string;
}

export interface NotePosition {
  note: Note;
  string: number;
  fret: number;
}
