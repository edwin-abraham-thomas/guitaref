import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Note, Interval, Chord, Scale, MusicTheoryState, NotePosition } from '../models/music-theory.models';

@Injectable({
  providedIn: 'root'
})
export class MusicTheoryService {
  private stateSubject = new BehaviorSubject<MusicTheoryState>({
    selectedScale: this.getEmptyScale(),
    chordsInKey: [],
    error: undefined
  });

  private readonly noteOrder: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  private readonly enharmonicEquivalents: { [key: string]: string[] } = {
    'C#': ['Db'],
    'D#': ['Eb'],
    'F#': ['Gb'],
    'G#': ['Ab'],
    'A#': ['Bb']
  };

  private readonly scalePatterns: { [key: string]: number[] } = {
    'Ionian': [2, 2, 1, 2, 2, 2, 1],
    'Dorian': [2, 1, 2, 2, 2, 1, 2],
    'Phrygian': [1, 2, 2, 2, 1, 2, 2],
    'Lydian': [2, 2, 2, 1, 2, 2, 1],
    'Mixolydian': [2, 2, 1, 2, 2, 1, 2],
    'Aeolian': [2, 1, 2, 2, 1, 2, 2],
    'Locrian': [1, 2, 2, 1, 2, 2, 2],
    'Pentatonic Major': [2, 2, 3, 2, 3],
    'Pentatonic Minor': [3, 2, 2, 3, 2]
  };

  private readonly intervalNames: { [key: number]: string } = {
    0: 'Unison',
    1: 'Minor Second',
    2: 'Major Second',
    3: 'Minor Third',
    4: 'Major Third',
    5: 'Perfect Fourth',
    6: 'Tritone',
    7: 'Perfect Fifth',
    8: 'Minor Sixth',
    9: 'Major Sixth',
    10: 'Minor Seventh',
    11: 'Major Seventh',
    12: 'Octave'
  };

  constructor() { }

  get state$(): Observable<MusicTheoryState> {
    return this.stateSubject.asObservable();
  }

  generateScale(root: string, type: string): Observable<Scale> {
    if (!this.validateInput(root, type)) {
      this.updateError(`Invalid input: root '${root}' or scale type '${type}'`);
      return of(this.getEmptyScale());
    }

    const normalizedRoot = this.normalizeNoteName(root);
    const scalePatternKey = this.getScalePatternKey(type);
    if (!scalePatternKey) {
      this.updateError(`Invalid scale type: ${type}`);
      return of(this.getEmptyScale());
    }
    const scaleNotes = this.calculateScaleNotes(normalizedRoot, scalePatternKey);
    const intervals = this.calculateIntervals(normalizedRoot, scaleNotes);
    
    const scale: Scale = {
      root: { name: normalizedRoot, isRoot: true },
      type: scalePatternKey, // Use the normalized key
      notes: scaleNotes,
      intervals
    };

    this.updateState({ selectedScale: scale, error: undefined });
    return of(scale);
  }

  getChordsInKey(scale: Scale): Observable<Chord[]> {
    const chords = this.calculateChordsInKey(scale);
    this.updateState({ chordsInKey: chords });
    return of(chords);
  }

  validateInput(root: string, type: string): boolean {
    const normalizedRoot = this.normalizeNoteName(root);
    const isValidRoot = this.noteOrder.includes(normalizedRoot) || 
                       Object.values(this.enharmonicEquivalents).flat().includes(normalizedRoot);
    const scalePatternKey = this.getScalePatternKey(type);
    const isValidType = scalePatternKey !== undefined;
    
    if (!isValidRoot) {
      this.updateError(`Invalid root note: ${root}. Please use a valid note name.`);
    }
    if (!isValidType) {
      this.updateError(`Invalid scale type: ${type}. Supported types: ${Object.keys(this.scalePatterns).join(', ')}`);
    }
    
    return isValidRoot && isValidType;
  }

  getFretboardPositions(scale: Scale, tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E']): NotePosition[] {
    const positions: NotePosition[] = [];
    const scaleNoteNames = scale.notes.map(note => note.name);
    const numStrings = tuning.length;

    tuning.forEach((openStringNote, stringIndex) => {
      for (let fret = 0; fret <= 12; fret++) {
        const noteIndex = (this.noteOrder.indexOf(openStringNote) + fret) % 12;
        const noteName = this.noteOrder[noteIndex];
        
        if (scaleNoteNames.includes(noteName)) {
          positions.push({
            note: { name: noteName, isRoot: noteName === scale.root.name },
            string: numStrings - stringIndex, // String 1 is high E, string 6 is low E
            fret
          });
        }
      }
    });

    return positions;
  }

  private calculateScaleNotes(root: string, type: string): Note[] {
    const pattern = this.scalePatterns[type];
    const rootIndex = this.noteOrder.indexOf(root);
    const notes: Note[] = [];

    let currentIndex = rootIndex;
    notes.push({ name: root, isRoot: true }); // root is first note

    // Generate notes for each step in the pattern, but exclude the octave
    for (let i = 0; i < pattern.length; i++) {
      currentIndex = (currentIndex + pattern[i]) % 12;
      const noteName = this.noteOrder[currentIndex];
      notes.push({ name: noteName, isRoot: false });
    }

    // Return only the first pattern.length notes (excluding the octave)
    return notes.slice(0, pattern.length);
  }

  private calculateIntervals(root: string, notes: Note[]): Interval[] {
    const rootIndex = this.noteOrder.indexOf(root);
    return notes.map((note, index) => {
      const noteIndex = this.noteOrder.indexOf(note.name);
      let semitones = (noteIndex - rootIndex + 12) % 12;
      if (index === 0) semitones = 0;
      
      return {
        name: this.intervalNames[semitones],
        semitones,
        note
      };
    });
  }

  private calculateChordsInKey(scale: Scale): Chord[] {
    const chords: Chord[] = [];
    const scaleNotes = scale.notes;
    const chordTypes = ['Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor', 'Diminished'];

    scaleNotes.forEach((note, index) => {
      if (index >= chordTypes.length) return;

      const chordNotes = [
        scaleNotes[index],
        scaleNotes[(index + 2) % scaleNotes.length],
        scaleNotes[(index + 4) % scaleNotes.length]
      ];

      const chordName = `${note.name} ${chordTypes[index]}`;
      
      chords.push({
        name: chordName,
        notes: chordNotes,
        type: index === 6 ? 'diminished' : 'triad'
      });
    });

    return chords;
  }

  private normalizeNoteName(note: string): string {
    // Convert to proper case: first letter uppercase, rest lowercase
    const formattedNote = note.charAt(0).toUpperCase() + note.slice(1).toLowerCase();
    
    // Handle enharmonic equivalents
    for (const [sharp, flats] of Object.entries(this.enharmonicEquivalents)) {
      if (flats.includes(formattedNote)) {
        return sharp;
      }
    }
    
    // Check if it's a valid note in our chromatic scale
    if (this.noteOrder.includes(formattedNote)) {
      return formattedNote;
    }
    
    return formattedNote; // Return as-is for error handling
  }

  private getScalePatternKey(type: string): string | undefined {
    const lowerType = type.toLowerCase();
    return Object.keys(this.scalePatterns).find(key => key.toLowerCase() === lowerType);
  }

  private updateState(partialState: Partial<MusicTheoryState>): void {
    const currentState = this.stateSubject.getValue();
    this.stateSubject.next({ ...currentState, ...partialState });
  }

  private updateError(error: string): void {
    this.updateState({ error });
  }

  private getEmptyScale(): Scale {
    return {
      root: { name: '', isRoot: false },
      type: '',
      notes: [],
      intervals: []
    };
  }
}
