import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchOrderPipe } from './match-order.pipe';
import { FilterAlumniPipe } from './filter-alumni.pipe';
import { RelativeTimePipe } from './relativeTime.pipe';

@NgModule({
  declarations: [MatchOrderPipe, FilterAlumniPipe, RelativeTimePipe],
  imports: [CommonModule],
  exports: [MatchOrderPipe, FilterAlumniPipe, RelativeTimePipe],
})
export class PipesModule {}
