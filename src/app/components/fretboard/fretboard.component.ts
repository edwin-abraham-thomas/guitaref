import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note, Chord, Scale, NotePosition } from '../../models/music-theory.models';
import { MusicTheoryService } from '../../services/music-theory.service';

export interface FretboardInput {
  notes?: Note[];
  chords?: Chord[];
  scale?: Scale;
  tuning?: string[];
}

@Component({
  selector: 'app-fretboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fretboard.component.html',
  styleUrl: './fretboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FretboardComponent implements OnChanges {
  @Input() data?: FretboardInput;
  @Input() maxFrets: number = 12;
  @Input() showFretMarkers: boolean = true;

  strings: number[] = [1, 2, 3, 4, 5, 6];
  frets: number[] = [];
  standardTuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E'];
  fretMarkers: number[] = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
  notePositions: NotePosition[] = [];
  private readonly noteOrder: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  constructor(private musicTheoryService: MusicTheoryService) {
    this.updateFretRange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['maxFrets']) {
      this.updateFretRange();
    }
    if (changes['data']) {
      this.calculateNotePositions();
    }
  }

  private updateFretRange(): void {
    this.frets = Array.from({ length: this.maxFrets + 1 }, (_, i) => i);
  }

  private calculateNotePositions(): void {
    if (!this.data?.scale && !this.data?.notes) {
      this.notePositions = [];
      return;
    }

    const tuning = this.data?.tuning || this.standardTuning;
    
    if (this.data?.scale) {
      this.notePositions = this.musicTheoryService.getFretboardPositions(this.data.scale, tuning);
    } else if (this.data?.notes) {
      // Calculate positions for individual notes
      this.notePositions = [];
      const noteNames = this.data.notes.map(note => note.name);
      
      tuning.forEach((openStringNote, stringIndex) => {
        for (let fret = 0; fret <= this.maxFrets; fret++) {
          const noteIndex = (this.noteOrder.indexOf(openStringNote) + fret) % 12;
          const noteName = this.noteOrder[noteIndex];
          
          if (noteNames.includes(noteName)) {
            const note = this.data!.notes!.find(n => n.name === noteName);
            this.notePositions.push({
              note: { 
                name: noteName, 
                isRoot: note?.isRoot || false 
              },
              string: this.strings.length - stringIndex,
              fret
            });
          }
        }
      });
    }
  }

  getNoteAtPosition(string: number, fret: number): NotePosition | undefined {
    return this.notePositions.find(pos => 
      pos.string === string && pos.fret === fret
    );
  }

  getNoteClass(notePosition: NotePosition): string {
    const classes = ['note'];
    if (notePosition.note.isRoot) {
      classes.push('root-note');
    } else {
      classes.push('scale-note');
    }
    return classes.join(' ');
  }

  onNoteClick(notePosition: NotePosition | undefined): void {
    if (notePosition) {
      console.log('Note clicked:', notePosition);
      // Emit event or handle click logic here
    }
  }

  getStringName(string: number): string {
    return this.standardTuning[this.strings.length - string];
  }

  shouldShowFretMarker(fret: number): boolean {
    return this.showFretMarkers && this.fretMarkers.includes(fret);
  }

  getFretMarkerClass(fret: number): string {
    return fret === 12 ? 'double-dot' : 'single-dot';
  }

  getAriaLabel(string: number, fret: number): string {
    const notePosition = this.getNoteAtPosition(string, fret);
    if (notePosition) {
      const { note, string: stringNum, fret: fretNum } = notePosition;
      const stringName = this.getStringName(stringNum);
      return `${note.name} on ${stringName} string, ${fretNum}${fretNum === 0 ? ' (Open)' : ''} fret`;
    } else {
      return `Empty position on string ${string}, fret ${fret}`;
    }
  }
}
