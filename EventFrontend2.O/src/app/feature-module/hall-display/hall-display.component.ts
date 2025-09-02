import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../core/services/data/data.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-hall-display',
  template: `
    <div class="hall-display-container" [class.fullscreen]="isFullscreen" [ngClass]="'theme-' + currentTheme">
      <!-- Fullscreen Toggle Button -->
      <div class="fullscreen-controls">
        <button 
          class="btn btn-outline-light btn-sm" 
          (click)="toggleFullscreen()"
          [title]="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'">
          <i class="fas" [ngClass]="isFullscreen ? 'fa-compress' : 'fa-expand'"></i>
          {{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}
        </button>
      </div>

      <!-- Main Content -->
      <div class="content-wrapper">
        <div class="event-display" *ngIf="!isLoading">
          <div *ngIf="currentEvent; else noEvent">
            <!-- Event Title - Large and Bold at the top -->
            <div class="event-title">
              {{ currentEvent.reservation_name }}
            </div>
            
            <!-- Event Type - Smaller Size -->
            <div class="event-type">
              {{ currentEvent.booking_type }}
            </div>
            
            <!-- Additional Event Details -->
            <div class="event-details">
              <div class="detail-item">
                <span class="label">Time:</span>
                <span class="value">{{ getEventTime() }}</span>
              </div>
            </div>
          </div>
          
          <ng-template #noEvent>
            <div class="no-event">
              <div class="no-event-title">No Events Today</div>
              <div class="no-event-subtitle">This hall is available for today</div>
            </div>
          </ng-template>
        </div>

        <!-- Loading State -->
        <div class="loading" *ngIf="isLoading">
          <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>

      <!-- Theme Chooser - Hidden in Fullscreen -->
      <div class="theme-chooser" *ngIf="!isFullscreen">
        <div class="theme-buttons">
          <button 
            class="theme-btn theme-black" 
            [class.active]="currentTheme === 'black'"
            (click)="setTheme('black')"
            title="Black Theme">
            <span class="theme-preview black-preview"></span>
            <span class="theme-name">Black</span>
          </button>
          
          <button 
            class="theme-btn theme-white" 
            [class.active]="currentTheme === 'white'"
            (click)="setTheme('white')"
            title="White Theme">
            <span class="theme-preview white-preview"></span>
            <span class="theme-name">White</span>
          </button>
          
          <button 
            class="theme-btn theme-blue" 
            [class.active]="currentTheme === 'blue'"
            (click)="setTheme('blue')"
            title="Blue Theme">
            <span class="theme-preview blue-preview"></span>
            <span class="theme-name">Blue</span>
          </button>
          
          <button 
            class="theme-btn theme-green" 
            [class.active]="currentTheme === 'green'"
            (click)="setTheme('green')"
            title="Green Theme">
            <span class="theme-preview green-preview"></span>
            <span class="theme-name">Green</span>
          </button>
          
          <button 
            class="theme-btn theme-purple" 
            [class.active]="currentTheme === 'purple'"
            (click)="setTheme('purple')"
            title="Purple Theme">
            <span class="theme-preview purple-preview"></span>
            <span class="theme-name">Purple</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
         .hall-display-container {
       min-height: 100vh;
       background: #000000;
       color: white;
       transition: all 0.3s ease;
       padding: 20px;
       position: relative;
       overflow: hidden;
       
       &.fullscreen {
         padding: 0;
       }
       
       // Theme: Black
       &.theme-black {
         background: #000000;
         color: white;
       }
       
       // Theme: White
       &.theme-white {
         background: #ffffff;
         color: #000000;
         
         .event-title {
           text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
         }
         
         .event-type {
           text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
         }
         
         .event-details .detail-item .value {
           text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
         }
       }
       
       // Theme: Blue
       &.theme-blue {
         background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
         color: white;
         
         .event-title {
           text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
         }
         
         .event-type {
           text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
         }
         
         .event-details .detail-item .value {
           text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
         }
       }
       
       // Theme: Green
       &.theme-green {
         background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
         color: white;
         
         .event-title {
           text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
         }
         
         .event-type {
           text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
         }
         
         .event-details .detail-item .value {
           text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
         }
       }
       
       // Theme: Purple
       &.theme-purple {
         background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
         color: white;
         
         .event-title {
           text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
         }
         
         .event-type {
           text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
         }
         
         .event-details .detail-item .value {
           text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
         }
       }
     }

    .fullscreen-controls {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 1000;
      
      .btn {
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: scale(1.05);
        }
      }
    }

         .content-wrapper {
       display: flex;
       flex-direction: column;
       justify-content: center;
       align-items: center;
       min-height: calc(100vh - 40px);
       text-align: center;
       padding: 40px 20px;
     }

     .event-display {
       max-width: 800px;
       width: 100%;
     }

     .event-title {
       font-size: 5rem;
       font-weight: 900;
       line-height: 1.2;
       margin-bottom: 40px;
       text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.1);
       word-wrap: break-word;
       overflow-wrap: break-word;
     }

    .event-type {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 40px;
      opacity: 0.9;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    }

    .event-details {
      display: flex;
      justify-content: center;
      gap: 60px;
      margin-top: 40px;
      
      .detail-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        
        .label {
          font-size: 1.2rem;
          font-weight: 500;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .value {
          font-size: 1.8rem;
          font-weight: 700;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
      }
    }

    .no-event {
      text-align: center;
      
      .no-event-title {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 20px;
        opacity: 0.8;
      }
      
      .no-event-subtitle {
        font-size: 1.5rem;
        opacity: 0.6;
      }
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      
      .spinner-border {
        width: 3rem;
        height: 3rem;
      }
    }

    .theme-chooser {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      
      .theme-buttons {
        display: flex;
        gap: 15px;
        background: rgba(0, 0, 0, 0.8);
        padding: 15px 25px;
        border-radius: 50px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .theme-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        background: none;
        border: none;
        color: white;
        padding: 10px 15px;
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 80px;
        
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        
        &.active {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.5);
        }
        
        .theme-preview {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .theme-name {
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .black-preview {
          background: #000000;
        }
        
        .white-preview {
          background: #ffffff;
        }
        
        .blue-preview {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .green-preview {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }
        
        .purple-preview {
          background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
        }
      }
    }

    // Tablet-specific optimizations
    @media (max-width: 1024px) {
      .event-title {
        font-size: 4rem;
      }
      
      .event-type {
        font-size: 1.6rem;
      }
      
      .event-details {
        gap: 40px;
        
        .detail-item .value {
          font-size: 1.5rem;
        }
      }
    }

    @media (max-width: 768px) {
      .content-wrapper {
        padding: 20px 10px;
      }
      
      .event-title {
        font-size: 3rem;
      }
      
      .event-type {
        font-size: 1.4rem;
      }
      
      .event-details {
        flex-direction: column;
        gap: 30px;
      }
    }

    // Fullscreen optimizations
    .fullscreen {
      .content-wrapper {
        min-height: 100vh;
        padding: 60px 40px;
      }
      
      .event-title {
        font-size: 6rem;
      }
      
      .event-type {
        font-size: 2.5rem;
      }
    }
  `]
})
export class HallDisplayComponent implements OnInit, OnDestroy {
  hallName: string = '';
  currentEvent: any = null;
  isLoading: boolean = true;
  isFullscreen: boolean = false;
  currentTheme: string = 'black';
  private refreshSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit() {
    console.log('HallDisplayComponent initialized');
    this.route.params.subscribe(params => {
      console.log('Route params:', params);
      this.hallName = params['hallName'];
      console.log('Hall name:', this.hallName);
      this.loadTodayEvents();
      this.startAutoRefresh();
    });
    
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('mozfullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('MSFullscreenChange', this.onFullscreenChange.bind(this));
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    
    // Remove fullscreen event listeners
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('mozfullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('MSFullscreenChange', this.onFullscreenChange.bind(this));
  }

  loadTodayEvents() {
    console.log('Loading today events for hall:', this.hallName);
    const today = new Date().toISOString().split('T')[0];
    console.log('Today\'s date:', today);
    
    this.dataService.getReservations().subscribe({
      next: (res: any) => {
        if (res.data && res.data.length > 0) {
          // Filter events for today and this specific hall
          const todayEvents = res.data.filter((event: any) => {
            if (!event.dashboardDate || !event.SLOT) return false;
            
            const eventDate = event.dashboardDate.split('T')[0];
            if (eventDate !== today) return false;
            
            // Check if this hall is in the SLOT data
            if (Array.isArray(event.SLOT)) {
              return event.SLOT.some((slot: any) => 
                slot.hall && slot.hall.toLowerCase() === this.hallName.toLowerCase()
              );
            } else if (event.SLOT.hall) {
              return event.SLOT.hall.toLowerCase() === this.hallName.toLowerCase();
            }
            
            return false;
          });
          
          if (todayEvents.length > 0) {
            this.currentEvent = todayEvents[0];
          } else {
            this.currentEvent = null;
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.isLoading = false;
      }
    });
  }

  startAutoRefresh() {
    // Refresh data every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadTodayEvents();
    });
  }

  toggleFullscreen() {
    if (!this.isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        (document.documentElement as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  }

  onFullscreenChange() {
    this.isFullscreen = !!document.fullscreenElement;
  }

  getCurrentDate(): Date {
    return new Date();
  }

  getEventTime(): string {
    if (!this.currentEvent || !this.currentEvent.SLOT) return 'Time not specified';
    
    const slotData = this.currentEvent.SLOT;
    if (Array.isArray(slotData) && slotData.length > 0) {
      const slot = slotData[0].slot;
      if (slot === 'Morning') return '12:00 PM - 4:00 PM';
      if (slot === 'Evening') return '6:00 PM - 10:00 PM';
      return slot || 'Time not specified';
    } else if (slotData.slot) {
      const slot = slotData.slot;
      if (slot === 'Morning') return '12:00 PM - 4:00 PM';
      if (slot === 'Evening') return '6:00 PM - 10:00 PM';
      return slot;
    }
    
    return 'Time not specified';
  }

  setTheme(theme: string) {
    this.currentTheme = theme;
    console.log('Theme changed to:', theme);
  }
}
