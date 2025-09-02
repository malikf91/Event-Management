import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HallDisplayComponent } from './hall-display.component';

@NgModule({
  declarations: [
    HallDisplayComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    HallDisplayComponent
  ]
})
export class HallDisplayModule { }
