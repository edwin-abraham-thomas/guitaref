import { TestBed } from '@angular/core/testing';
import { MusicTheoryService } from './music-theory.service';
import { Note, Scale, Chord } from '../models/music-theory.models';
import { take } from 'rxjs/operators';

describe('MusicTheoryService', () => {
  let service: MusicTheoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicTheoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateScale', () => {
    it('should generate C Ionian scale correctly', (done) => {
      service.generateScale('C', 'Ionian').subscribe((scale) => {
        expect(scale.root.name).toBe('C');
        expect(scale.type).toBe('Ionian');
        expect(scale.notes.map((n) => n.name)).toEqual([
          'C',
          'D',
          'E',
          'F',
          'G',
          'A',
          'B',
        ]);
        expect(scale.notes[0].isRoot).toBeTrue();
        expect(scale.intervals.length).toBe(7);
        done();
      });
    });

    it('should generate A Aeolian (natural minor) scale correctly', (done) => {
      service.generateScale('A', 'Aeolian').subscribe((scale) => {
        expect(scale.notes.map((n) => n.name)).toEqual([
          'A',
          'B',
          'C',
          'D',
          'E',
          'F',
          'G',
        ]);
        done();
      });
    });

    it('should generate Pentatonic Major scale correctly', (done) => {
      service.generateScale('C', 'Pentatonic Major').subscribe((scale) => {
        expect(scale.notes.map((n) => n.name)).toEqual([
          'C',
          'D',
          'E',
          'G',
          'A',
        ]);
        done();
      });
    });

    it('should handle enharmonic equivalents (F# vs Gb)', (done) => {
      service.generateScale('Gb', 'Ionian').subscribe((scale) => {
        // Root should normalize to either Gb or F#
        expect(['Gb', 'F#']).toContain(scale.root.name);

        // Accept either Gb major spelling OR F# major spelling
        const expectedGb = ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'];
        const expectedFsharp = ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'F'];

        const noteNames = scale.notes.map((n) => n.name);
        expect([expectedGb, expectedFsharp]).toContain(noteNames);

        done();
      });
    });

    it('should update state with selected scale', (done) => {
      service.generateScale('C', 'Ionian').subscribe(() => {
        service.state$.pipe(take(1)).subscribe((state) => {
          expect(state.selectedScale.root.name).toBe('C');
          expect(state.selectedScale.type).toBe('Ionian');
          done();
        });
      });
    });
  });

  describe('getChordsInKey', () => {
    it('should generate correct chords for C Ionian', (done) => {
      service.generateScale('C', 'Ionian').subscribe((scale) => {
        service.getChordsInKey(scale).subscribe((chords) => {
          expect(chords.length).toBe(7);
          expect(chords[0].name).toBe('C Major');
          expect(chords[1].name).toBe('D Minor');
          expect(chords[2].name).toBe('E Minor');
          expect(chords[3].name).toBe('F Major');
          expect(chords[4].name).toBe('G Major');
          expect(chords[5].name).toBe('A Minor');
          expect(chords[6].name).toBe('B Diminished');
          done();
        });
      });
    });

    it('should update state with chords in key', (done) => {
      service.generateScale('C', 'Ionian').subscribe((scale) => {
        service.getChordsInKey(scale).subscribe(() => {
          service.state$.pipe(take(1)).subscribe((state) => {
            expect(state.chordsInKey.length).toBe(7);
            expect(state.chordsInKey[0].name).toBe('C Major');
            done();
          });
        });
      });
    });
  });

  describe('validateInput', () => {
    it('should validate correct inputs', () => {
      expect(service.validateInput('C', 'Ionian')).toBeTrue();
      expect(service.validateInput('F#', 'Aeolian')).toBeTrue();
      expect(service.validateInput('Gb', 'Pentatonic Minor')).toBeTrue();
    });

    it('should reject unsupported or invalid root notes', () => {
      // Totally invalid in standard Western notation
      expect(service.validateInput('H', 'Ionian')).toBeFalse();

      // Cb is theoretically valid (enharmonic to B),
      // but we don’t support exotic accidentals in this service
      expect(service.validateInput('Cb', 'Ionian')).toBeFalse();
    });

    it('should reject invalid scale types', () => {
      expect(service.validateInput('C', 'InvalidType')).toBeFalse();
      expect(service.validateInput('C', '')).toBeFalse();
    });

    it('should set error message for invalid inputs', (done) => {
      service.validateInput('H', 'Ionian');
      service.state$.pipe(take(1)).subscribe((state) => {
        expect(state.error).toContain('Invalid root note');
        done();
      });
    });
  });

  describe('getFretboardPositions', () => {
    it('should generate fretboard positions for C Major scale', (done) => {
      service.generateScale('C', 'Ionian').subscribe((scale) => {
        const positions = service.getFretboardPositions(scale);
        expect(positions.length).toBeGreaterThan(0);

        // Should find C note on multiple strings
        const cNotes = positions.filter(
          (p) => p.note.name === 'C' && p.note.isRoot
        );
        expect(cNotes.length).toBeGreaterThan(0);

        // Should include standard tuning positions
        expect(
          positions.some(
            (p) => p.string === 5 && p.fret === 3 && p.note.name === 'C'
          )
        ).toBeTrue();
        done();
      });
    });

    it('should mark root notes correctly', (done) => {
      service.generateScale('C', 'Ionian').subscribe((scale) => {
        const positions = service.getFretboardPositions(scale);
        const rootNotes = positions.filter((p) => p.note.isRoot);
        expect(rootNotes.every((p) => p.note.name === 'C')).toBeTrue();
        done();
      });
    });
  });

  describe('state management', () => {
    it('should initialize with empty state', (done) => {
      service.state$.pipe(take(1)).subscribe((state) => {
        expect(state.selectedScale.notes.length).toBe(0);
        expect(state.chordsInKey.length).toBe(0);
        expect(state.error).toBeUndefined();
        done();
      });
    });

    it('should clear error on valid input', (done) => {
      // First set an error
      service.validateInput('H', 'Ionian');

      // Then make valid call
      service.generateScale('C', 'Ionian').subscribe(() => {
        service.state$.pipe(take(1)).subscribe((state) => {
          expect(state.error).toBeUndefined();
          done();
        });
      });
    });
  });

  describe('edge cases', () => {
    it('should handle all supported scale types', (done) => {
      const scaleTypes = [
        'Ionian',
        'Dorian',
        'Phrygian',
        'Lydian',
        'Mixolydian',
        'Aeolian',
        'Locrian',
        'Pentatonic Major',
        'Pentatonic Minor',
      ];

      let completed = 0;
      scaleTypes.forEach((type) => {
        service.generateScale('C', type).subscribe((scale) => {
          expect(scale.notes.length).toBeGreaterThan(0);
          completed++;
          if (completed === scaleTypes.length) done();
        });
      });
    });

    it('should handle case insensitive note names', (done) => {
      service.generateScale('c', 'ionian').subscribe((scale) => {
        expect(scale.root.name).toBe('C');
        expect(scale.notes.map((n) => n.name)).toEqual([
          'C',
          'D',
          'E',
          'F',
          'G',
          'A',
          'B',
        ]);
        done();
      });
    });
  });
});
