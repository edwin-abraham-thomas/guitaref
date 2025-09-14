import { Component, OnInit } from '@angular/core';
import { FretboardComponent, FretboardInput } from '../fretboard/fretboard.component';
import { MusicTheoryService } from '../../services/music-theory.service';
import { Scale, Note } from '../../models/music-theory.models';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-fretboard-demo',
  standalone: true,
  imports: [
    CommonModule, 
    FretboardComponent,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './fretboard-demo.component.html',
  styleUrl: './fretboard-demo.component.scss'
})
export class FretboardDemoComponent implements OnInit {
  fretboardData: FretboardInput | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(private musicTheoryService: MusicTheoryService) {}

  ngOnInit(): void {
    this.loadDemoData();
  }

  async loadDemoData(): Promise<void> {
    try {
      // Generate C Ionian scale for demonstration
      const scale = await this.musicTheoryService.generateScale('C', 'Ionian').toPromise();
      if (scale) {
        this.fretboardData = { scale };
      }
      this.isLoading = false;
    } catch (err) {
      this.error = 'Failed to load demo data';
      this.isLoading = false;
      console.error('Error loading demo data:', err);
    }
  }

  getDemoNotes(): Note[] {
    return [
      { name: 'C', isRoot: true },
      { name: 'E', isRoot: false },
      { name: 'G', isRoot: false }
    ];
  }

  onShowCMajorChord(): void {
    this.fretboardData = { notes: this.getDemoNotes() };
  }

  onShowCIonianScale(): void {
    this.loadDemoData();
  }

  onShowDropDTuning(): void {
    if (this.fretboardData?.scale) {
      this.fretboardData = {
        ...this.fretboardData,
        tuning: ['D', 'A', 'D', 'G', 'B', 'E']
      };
    }
  }

  onShowStandardTuning(): void {
    if (this.fretboardData?.scale) {
      this.fretboardData = {
        ...this.fretboardData,
        tuning: undefined // Reset to default
      };
    }
  }
}
