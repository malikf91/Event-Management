import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CalenderComponent } from './calender.component';
import { CalenderRoutingModule } from './calender-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
// import { TabViewModule } from 'primeng/tabview';
import { FullCalendarModule } from '@fullcalendar/angular';

@NgModule({
  declarations: [CalenderComponent],
  imports: [CommonModule, CalenderRoutingModule, SharedModule, FullCalendarModule, FormsModule],
})
export class CalenderModule {}
