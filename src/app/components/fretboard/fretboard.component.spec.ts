import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FretboardComponent, FretboardInput } from './fretboard.component';
import { MusicTheoryService } from '../../services/music-theory.service';
import { Note, Scale } from '../../models/music-theory.models';
import { of } from 'rxjs';

describe('FretboardComponent', () => {
  let component: FretboardComponent;
  let fixture: ComponentFixture<FretboardComponent>;
  let musicTheoryService: jasmine.SpyObj<MusicTheoryService>;

  const mockNote: Note = { name: 'C', isRoot: true };
  const mockScale: Scale = {
    root: mockNote,
    type: 'Ionian',
    notes: [
      { name: 'C', isRoot: true },
      { name: 'D', isRoot: false },
      { name: 'E', isRoot: false },
      { name: 'F', isRoot: false },
      { name: 'G', isRoot: false },
      { name: 'A', isRoot: false },
      { name: 'B', isRoot: false }
    ],
    intervals: [
      { name: 'Unison', semitones: 0, note: mockNote },
      { name: 'Major Second', semitones: 2, note: { name: 'D', isRoot: false } },
      { name: 'Major Third', semitones: 4, note: { name: 'E', isRoot: false } },
      { name: 'Perfect Fourth', semitones: 5, note: { name: 'F', isRoot: false } },
      { name: 'Perfect Fifth', semitones: 7, note: { name: 'G', isRoot: false } },
      { name: 'Major Sixth', semitones: 9, note: { name: 'A', isRoot: false } },
      { name: 'Major Seventh', semitones: 11, note: { name: 'B', isRoot: false } }
    ]
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('MusicTheoryService', ['getFretboardPositions']);
    spy.getFretboardPositions.and.returnValue([
      { note: { name: 'C', isRoot: true }, string: 6, fret: 8 },
      { note: { name: 'E', isRoot: false }, string: 5, fret: 7 },
      { note: { name: 'G', isRoot: false }, string: 4, fret: 5 }
    ]);

    await TestBed.configureTestingModule({
      imports: [FretboardComponent],
      providers: [
        { provide: MusicTheoryService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FretboardComponent);
    component = fixture.componentInstance;
    musicTheoryService = TestBed.inject(MusicTheoryService) as jasmine.SpyObj<MusicTheoryService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.strings).toEqual([1, 2, 3, 4, 5, 6]);
    expect(component.standardTuning).toEqual(['E', 'A', 'D', 'G', 'B', 'E']);
    expect(component.maxFrets).toBe(12);
    expect(component.frets.length).toBe(13); // 0-12 inclusive
  });

  it('should update fret range when maxFrets changes', () => {
    component.maxFrets = 15;
    component.ngOnChanges({ maxFrets: { currentValue: 15, previousValue: 12, firstChange: false, isFirstChange: () => false } } as any);
    expect(component.frets.length).toBe(16); // 0-15 inclusive
  });

  it('should calculate note positions for scale input', () => {
    const input: FretboardInput = { scale: mockScale };
    component.data = input;
    component.ngOnChanges({ data: { currentValue: input, previousValue: undefined, firstChange: false, isFirstChange: () => false } } as any);
    
    expect(musicTheoryService.getFretboardPositions).toHaveBeenCalledWith(mockScale, component.standardTuning);
    expect(component.notePositions.length).toBe(3);
  });

  it('should calculate note positions for notes input', () => {
    const input: FretboardInput = { 
      notes: [
        { name: 'C', isRoot: true },
        { name: 'E', isRoot: false }
      ] 
    };
    component.data = input;
    component.ngOnChanges({ data: { currentValue: input, previousValue: undefined, firstChange: false, isFirstChange: () => false } } as any);
    
    expect(component.notePositions.length).toBeGreaterThan(0);
    expect(component.notePositions.some(pos => pos.note.name === 'C')).toBeTrue();
    expect(component.notePositions.some(pos => pos.note.name === 'E')).toBeTrue();
  });

  it('should handle empty data input', () => {
    component.data = {};
    component.ngOnChanges({ data: { currentValue: {}, previousValue: undefined, firstChange: false, isFirstChange: () => false } } as any);
    
    expect(component.notePositions.length).toBe(0);
  });

  it('should get note at position correctly', () => {
    component.notePositions = [
      { note: { name: 'C', isRoot: true }, string: 6, fret: 8 },
      { note: { name: 'E', isRoot: false }, string: 5, fret: 7 }
    ];
    
    const note = component.getNoteAtPosition(6, 8);
    expect(note).toBeDefined();
    expect(note?.note.name).toBe('C');
    expect(note?.note.isRoot).toBeTrue();
  });

  it('should return undefined for non-existent position', () => {
    component.notePositions = [
      { note: { name: 'C', isRoot: true }, string: 6, fret: 8 }
    ];
    
    const note = component.getNoteAtPosition(1, 1);
    expect(note).toBeUndefined();
  });

  it('should get correct note classes', () => {
    const rootNote = { note: { name: 'C', isRoot: true }, string: 6, fret: 8 };
    const scaleNote = { note: { name: 'E', isRoot: false }, string: 5, fret: 7 };
    
    expect(component.getNoteClass(rootNote)).toContain('root-note');
    expect(component.getNoteClass(scaleNote)).toContain('scale-note');
  });

  it('should generate correct tooltip text', () => {
    const notePosition = { note: { name: 'C', isRoot: true }, string: 6, fret: 8 };
    component.data = { scale: mockScale };
    
    const tooltip = component.getTooltipText(notePosition);
    expect(tooltip).toContain('C');
    expect(tooltip).toContain('8');
    expect(tooltip).toContain('E string');
  });

  it('should handle note hover events', () => {
    const notePosition = { note: { name: 'C', isRoot: true }, string: 6, fret: 8 };
    
    component.onNoteHover(notePosition);
    expect(component.hoveredNote).toBe(notePosition);
    
    component.onNoteHover(null);
    expect(component.hoveredNote).toBeNull();
  });

  it('should handle note click events', () => {
    const notePosition = { note: { name: 'C', isRoot: true }, string: 6, fret: 8 };
    spyOn(console, 'log');
    
    component.onNoteClick(notePosition);
    expect(console.log).toHaveBeenCalledWith('Note clicked:', notePosition);
  });

  it('should get correct string names', () => {
    expect(component.getStringName(1)).toBe('E'); // High E
    expect(component.getStringName(6)).toBe('E'); // Low E
    expect(component.getStringName(2)).toBe('B');
  });

  it('should check fret marker visibility correctly', () => {
    expect(component.shouldShowFretMarker(3)).toBeTrue();
    expect(component.shouldShowFretMarker(12)).toBeTrue();
    expect(component.shouldShowFretMarker(1)).toBeFalse();
  });

  it('should get correct fret marker classes', () => {
    expect(component.getFretMarkerClass(12)).toBe('double-dot');
    expect(component.getFretMarkerClass(3)).toBe('single-dot');
  });

  it('should generate correct ARIA labels', () => {
    component.notePositions = [
      { note: { name: 'C', isRoot: true }, string: 6, fret: 8 }
    ];
    
    const withNote = component.getAriaLabel(6, 8);
    expect(withNote).toContain('C on E string');
    expect(withNote).toContain('8 fret');
    
    const withoutNote = component.getAriaLabel(1, 1);
    expect(withoutNote).toContain('Empty position');
  });

  it('should support alternative tunings', () => {
    const dropDTuning = ['D', 'A', 'D', 'G', 'B', 'E'];
    const input: FretboardInput = { scale: mockScale, tuning: dropDTuning };
    
    component.data = input;
    component.ngOnChanges({ data: { currentValue: input, previousValue: undefined, firstChange: false, isFirstChange: () => false } } as any);
    
    expect(musicTheoryService.getFretboardPositions).toHaveBeenCalledWith(mockScale, dropDTuning);
  });

  it('should be accessible with proper ARIA attributes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.fretboard-container');
    expect(container?.getAttribute('aria-label')).toBe('Guitar fretboard diagram');
  });
});
