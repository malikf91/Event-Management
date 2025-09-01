import { ChangeDetectorRef, Component, ViewEncapsulation, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg, EventDropArg } from '@fullcalendar/core';
import listPlugin from '@fullcalendar/list';
import { INITIAL_EVENTS } from './event-utilites';
import { DataService, routes } from 'src/app/core/core.index';

@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CalenderComponent implements AfterViewInit {
   
  @ViewChild('calendarElement') calendarElement!: ElementRef;
  
  calendarVisible = true;
  selectedEvent: any = null;
  showEventModal = false;
  calendarApi: any = null;
  
  calendarOptions: CalendarOptions = {
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
    ],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    initialView: 'dayGridMonth',
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: 4,
    eventsSet: this.handleEvents.bind(this),
    eventClick: this.handleEventClick.bind(this),
    select: this.handleDateSelect.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    height: 'auto',
    eventDisplay: 'block',
    moreLinkClick: 'popover',
    datesSet: this.handleDatesSet.bind(this),
    // Ensure proper month view display - fix Saturday column cutoff
    aspectRatio: 1.8,
    expandRows: true,
    handleWindowResize: true,
    // Force proper sizing for month view
    contentHeight: 'auto',
    dayCellContent: true
  };
  
  currentEvents: EventApi[] = [];
  
  constructor(
    private changeDetector: ChangeDetectorRef,
    private data: DataService,
    private router: Router
  ) {
    this.loadEvents();
  }

  ngAfterViewInit() {
    this.initializeTouchGestures();
    // Ensure month view is properly displayed after view initialization
    setTimeout(() => {
      this.ensureMonthView();
    }, 100);
    
    // Add window resize listener to maintain proper calendar sizing
    window.addEventListener('resize', () => {
      setTimeout(() => {
        this.ensureMonthView();
      }, 100);
    });
  }

  loadEvents() {
    this.data.getEvents().subscribe({
      next: (res: any) => {
        console.log('API Response:', res);
        if (!res.data || res.data.length === 0) {
          console.log('No data found');
          return;
        }
        console.log('First event:', res.data[0]);
        const mappedEvents = res.data.map((event: any) => {
        let backgroundColor = '#3788d8'; // default blue
        let borderColor = '#3788d8';
        let textColor = '#fff';
        let className = 'fc-event-open';
  
        if (event.status === 'OPEN') {
          backgroundColor = '#3788d8'; // blue
          borderColor = '#3788d8';
          textColor = '#fff';
          className = 'fc-event-open';
        } else if (event.status === 'DRAFTED') {
          backgroundColor = '#ffb300'; // yellow
          borderColor = '#ffb300';
          textColor = '#fff';
          className = 'fc-event-drafted';
        } else if (event.status === 'FULLFILLED') {
          backgroundColor = '#4caf50'; // green
          borderColor = '#4caf50';
          textColor = '#fff';
          className = 'fc-event-fulfilled';
        }

        // Parse SLOT data to get proper slot information
        let slot = 'Day';
        let startTime = '12:00 PM';
        let endTime = '04:00 PM';
        let hall = 'Not specified';
        
        if (event.SLOT) {
          console.log('SLOT data:', event.SLOT);
          const slotData = event.SLOT;
          if (Array.isArray(slotData) && slotData.length > 0) {
            slot = slotData[0].slot || 'Day';
            // Extract all halls and join them with commas
            const halls = slotData.map(slot => slot.hall).filter(hall => hall);
            hall = halls.length > 0 ? halls.join(', ') : 'Not specified';
            console.log('Array SLOT - slot:', slot, 'halls:', hall);
          } else if (slotData.slot) {
            slot = slotData.slot;
            hall = slotData.hall || 'Not specified';
            console.log('Object SLOT - slot:', slot, 'hall:', hall);
          }
        } else {
          console.log('No SLOT data found for event:', event);
        }
        
        // Set times based on slot
        if (slot === 'Morning') {
          startTime = '12:00 PM';
          endTime = '04:00 PM';
        } else if (slot === 'Evening') {
          startTime = '06:00 PM';
          endTime = '10:00 PM';
        } else if (slot === 'Day') {
          startTime = '12:00 PM';
          endTime = '04:00 PM';
        } else if (slot === 'Night') {
          startTime = '06:00 PM';
          endTime = '10:00 PM';
        }
  
        // Ensure proper date formatting for the calendar
        let startDate, endDate;
        
        if (event.dashboardDate) {
          // Use dashboardDate (event date) instead of date (booking date)
          startDate = new Date(event.dashboardDate);
          endDate = new Date(event.dashboardDate);
        } else {
          startDate = new Date();
          endDate = new Date();
        }
        
        // Check if date parsing was successful
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error('Invalid date format:', event.dashboardDate);
          startDate = new Date();
          endDate = new Date();
        }
        
        return {
          id: event.booking_id,
          title: event.reservation_name,
          start: startDate,
          end: endDate,
          backgroundColor,
          borderColor,
          textColor,
          className,
          extendedProps: {
            status: event.status || 'OPEN',
            description: event.description || '',
            hall: hall,
            attendees: event.number_of_persons || 0,
            slot: slot,
            startTime: startTime,
            endTime: endTime
          }
        };
      });
  
      this.calendarOptions = {
        ...this.calendarOptions,
        events: mappedEvents,
      };
      console.log('Mapped events:', mappedEvents);
      this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Error loading events:', error);
      }
    });
  }
  
  // Navigate to add reservation page
  navigateToAddReservation() {
    this.router.navigate(['/reservations/add-reservation']);
  }
  
  // Event click handling
  handleEventClick(clickInfo: EventClickArg) {
    this.selectedEvent = {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      status: clickInfo.event.extendedProps['status'],
      description: clickInfo.event.extendedProps['description'],
      hall: clickInfo.event.extendedProps['hall'],
      attendees: clickInfo.event.extendedProps['attendees'],
      slot: clickInfo.event.extendedProps['slot'],
      startTime: clickInfo.event.extendedProps['startTime'],
      endTime: clickInfo.event.extendedProps['endTime']
    };
    this.showEventModal = true;
    this.changeDetector.detectChanges();
  }

  // Date selection for new events
  handleDateSelect(selectInfo: DateSelectArg) {
    // Determine slot based on selected time
    const slot = this.getEventSlot(selectInfo.start);
    
    // Navigate to add reservation with pre-filled date and slot information
    this.router.navigate(['/reservations/add-reservation'], {
      queryParams: {
        date: selectInfo.start.toISOString(),
        endDate: selectInfo.end ? selectInfo.end.toISOString() : null,
        slot: slot,
        startTime: this.getDefaultStartTime(slot),
        endTime: this.getDefaultEndTime(slot)
      }
    });
  }

  // Get event duration
  getEventDuration(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return '4 hours';
    
    // Parse time strings (e.g., "12:00 PM", "06:00 PM")
    const parseTime = (timeStr: string): number => {
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      let hour = hours;
      if (period === 'PM' && hours !== 12) {
        hour += 12;
      } else if (period === 'AM' && hours === 12) {
        hour = 0;
      }
      
      return hour + minutes / 60;
    };
    
    const startHour = parseTime(startTime);
    const endHour = parseTime(endTime);
    
    let duration = endHour - startHour;
    if (duration < 0) {
      duration += 24; // Handle overnight events
    }
    
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);
    
    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hours`;
    } else {
      return `${hours} hours ${minutes} minutes`;
    }
  }

  // Drag and drop events
  handleEventDrop(dropInfo: EventDropArg) {
    console.log('Event dropped:', dropInfo.event.title, 'to', dropInfo.event.start);
    // Here you would typically update the event in your backend
    this.updateEventDate(dropInfo.event);
  }

  // Update event date in backend
  updateEventDate(event: EventApi) {
    // Implement API call to update event
    console.log('Updating event date:', event.id, 'to', event.start);
  }

  // Close event modal
  closeEventModal() {
    this.showEventModal = false;
    this.selectedEvent = null;
  }

  // Edit event
  editEvent(event: any) {
    // Close the modal first
    this.closeEventModal();
    
    // Navigate to edit reservation flow with event data
    this.router.navigate([routes.editReservation], {
      queryParams: {
        id: event.id,
        title: event.title,
        date: event.start,
        slot: event.slot,
        hall: event.hall,
        attendees: event.attendees,
        startTime: event.startTime,
        endTime: event.endTime,
        status: event.status,
        description: event.description
      }
    });
  }



  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
    this.changeDetector.detectChanges();
  }

  // Touch gestures for mobile
  initializeTouchGestures() {
    if (this.calendarElement) {
      let startX = 0;
      let startY = 0;
      
      this.calendarElement.nativeElement.addEventListener('touchstart', (e: TouchEvent) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      });
      
      this.calendarElement.nativeElement.addEventListener('touchend', (e: TouchEvent) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        if (Math.abs(endX - startX) > Math.abs(endY - startY)) {
          if (endX > startX) {
            this.previousPeriod(); // Go to previous period
          } else {
            this.nextPeriod(); // Go to next period
          }
        }
      });
    }
  }

  // Navigation methods
  previousPeriod() {
    // Implement previous period navigation
    console.log('Going to previous period');
  }

  nextPeriod() {
    // Implement next period navigation
    console.log('Going to next period');
  }

  // Go to today's date
  goToToday() {
    if (this.calendarApi) {
      this.calendarApi.today();
    }
  }

  handleDatesSet(arg: any) {
    this.calendarApi = arg.view.calendar;
  }

  // Ensure month view is properly displayed
  ensureMonthView() {
    if (this.calendarApi) {
      // Force the month view to be properly sized
      this.calendarApi.changeView('dayGridMonth');
      
      // Multiple resize attempts to ensure proper layout
      setTimeout(() => {
        this.calendarApi.updateSize();
        // Force a re-render
        this.calendarApi.render();
      }, 50);
      
      // Additional resize after a longer delay
      setTimeout(() => {
        this.calendarApi.updateSize();
        // Ensure the calendar takes full width
        const calendarEl = this.calendarApi.el;
        if (calendarEl) {
          calendarEl.style.width = '100%';
          calendarEl.style.maxWidth = 'none';
          calendarEl.style.overflow = 'visible';
        }
      }, 200);
      
      // Final resize check
      setTimeout(() => {
        this.calendarApi.updateSize();
      }, 500);
    }
  }

  // Get event slot (Day or Night) based on start time
  getEventSlot(startTime: Date | null): string {
    if (!startTime) return 'Day';
    const hour = startTime.getHours();
    if (hour >= 6 && hour < 18) {
      return 'Day';
    } else {
      return 'Night';
    }
  }

  // Get default start time based on slot
  getDefaultStartTime(slot: string): string {
    if (slot === 'Day') {
      return '12:00 PM';
    } else {
      return '06:00 PM';
    }
  }

  // Get default end time based on slot
  getDefaultEndTime(slot: string): string {
    if (slot === 'Day') {
      return '04:00 PM';
    } else {
      return '10:00 PM';
    }
  }
}

