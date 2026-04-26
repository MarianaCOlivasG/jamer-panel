import { Component, ChangeDetectorRef, OnInit, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi, EventChangeArg, EventMountArg } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { WorkOrdersService } from '../../services/work-orders.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/auth/services/local-storage.service';
import { Permission } from 'src/app/auth/interfaces/Permission.interface';
import { ez } from '@fullcalendar/core/internal-common';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit {

  @ViewChild('contextMenu') contextMenu!: ElementRef;
  @ViewChild('eventInfoModal') eventInfoModal!: ElementRef;

  public diaryEventIdSelected: number = 0;
  public calendarVisible = true;
  public isLoading: boolean = true;
  public calendarId: number = 0;
  public currentEvents: EventApi[] = [];
  public allEvents: any[] = [];
  public selectedEventGroup: any[] = [];
  public showEventInfoModal = false;
  public selectedEventId: string = '';

  public contextMenuVisible: boolean = false;
  public contextMenuPosition = { x: 0, y: 0 };
  private contextWorkOrderId: string = '';
  
  private tooltips: HTMLElement[] = [];

  public calendarOptions: CalendarOptions = {
    locale: esLocale,
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin
    ],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    initialView: 'timeGridWeek',
    initialEvents: [],
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    slotDuration: '00:30:00',
    slotMinTime: '01:00:00',
    slotMaxTime: '25:00:00',
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
      hour12: true
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
      hour12: true
    },
    
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    eventChange: this.handleEventChange.bind(this),
    eventDidMount: (info: EventMountArg) => {
      const statusId = info.event.extendedProps['status']?.id || 0;
      const eventId = info.event.id;
      
      if (statusId === 2) {
        info.el.style.backgroundColor = '#FF0000';
        info.el.style.borderColor = '#B71C1C';
        info.el.style.color = 'white';
        info.el.style.fontWeight = 'bold';
        info.el.style.opacity = '1';
        info.el.style.borderWidth = '2px';
        info.el.style.borderStyle = 'solid';
      }
      
      const tooltipEl = document.createElement('div');
      tooltipEl.classList.add('event-tooltip');
      
      const updateTooltipContent = (eventData: EventApi | ez) => {
        const eventStatusId = eventData.extendedProps['status']?.id || 0;
        const startTime = this.datePipe.transform(eventData.start, 'h:mm a');
        const endTime = eventData.end ? this.datePipe.transform(eventData.end, 'h:mm a') : '';
        
        tooltipEl.innerHTML = `
        <strong>${eventData.title}</strong><br>
        Horario: ${startTime} - ${endTime}<br>
        ${eventStatusId === 2 ? '<span style="color:red;font-weight:bold;">CANCELADA</span>' : ''}
        ${eventData.extendedProps['description'] ? '<br>' + eventData.extendedProps['description'] : ''}
      `;
      };
      
      updateTooltipContent(info.event);
      
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.display = 'none';
      tooltipEl.style.backgroundColor = 'rgba(0,0,0,0.8)';
      tooltipEl.style.color = 'white';
      tooltipEl.style.padding = '5px 10px';
      tooltipEl.style.borderRadius = '4px';
      tooltipEl.style.zIndex = '10000';
      tooltipEl.style.pointerEvents = 'none';
      
      this.tooltips.push(tooltipEl);
      document.body.appendChild(tooltipEl);
      
      info.el.addEventListener('mouseover', () => {
        const currentEventData = this.currentEvents.find(e => e.id === eventId) || info.event;
        updateTooltipContent(currentEventData);
        
        const rect = info.el.getBoundingClientRect();
        tooltipEl.style.display = 'block';
        tooltipEl.style.top = `${rect.top + window.scrollY - tooltipEl.offsetHeight - 5}px`;
        tooltipEl.style.left = `${rect.left + window.scrollX + rect.width / 2 - tooltipEl.offsetWidth / 2}px`;
      });
      
      info.el.addEventListener('mouseout', () => {
        tooltipEl.style.display = 'none';
      });
      
      info.el.addEventListener('click', () => {
        tooltipEl.style.display = 'none';
      });
      
      const timeStart = info.event.start?.getTime() || 0;
      const timeEnd = info.event.end?.getTime() || timeStart;
      
      const overlappingEvents = this.currentEvents.filter(otherEvent => {
        if (otherEvent.id === info.event.id) return false;
        
        const otherStart = otherEvent.start?.getTime() || 0;
        const otherEnd = otherEvent.end?.getTime() || otherStart;
        
        return (timeStart < otherEnd && timeEnd > otherStart);
      });
      
      if (overlappingEvents.length > 0) {
        const overlapIndicator = document.createElement('div');
        overlapIndicator.classList.add('overlap-indicator');
        overlapIndicator.innerHTML = `<span>+${overlappingEvents.length}</span>`;
        overlapIndicator.style.position = 'absolute';
        overlapIndicator.style.top = '2px';
        overlapIndicator.style.right = '2px';
        overlapIndicator.style.backgroundColor = 'rgba(0,0,0,0.6)';
        overlapIndicator.style.color = 'white';
        overlapIndicator.style.borderRadius = '50%';
        overlapIndicator.style.width = '20px';
        overlapIndicator.style.height = '20px';
        overlapIndicator.style.fontSize = '11px';
        overlapIndicator.style.display = 'flex';
        overlapIndicator.style.alignItems = 'center';
        overlapIndicator.style.justifyContent = 'center';
        overlapIndicator.style.cursor = 'pointer';
        overlapIndicator.style.zIndex = '10';
        
        info.el.appendChild(overlapIndicator);
        
        overlapIndicator.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          this.hideAllTooltips();
          
          this.selectedEventId = info.event.id;
          
          this.openOverlappingEventsModal();
          
          return false;
        });
      }
      
      info.el.addEventListener('contextmenu', (e: MouseEvent) => {
        e.preventDefault();
        this.contextWorkOrderId = info.event.id;
        this.showContextMenu(e.clientX, e.clientY);
      });
    },
    
    eventContent: (arg) => {
      const event = arg.event;
      const statusId = event.extendedProps['status']?.id || 0;
      
      const wrapper = document.createElement('div');
      wrapper.style.height = '100%';
      wrapper.style.width = '100%';
      wrapper.style.overflow = 'hidden';
      wrapper.style.padding = '2px';
      
      if (statusId === 2) {
        wrapper.innerHTML = `
          <div style="display:flex;flex-direction:column;height:100%;width:100%;">
            <div style="font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${event.title}
            </div>
            <div style="font-size:0.8em;margin-top:auto;background-color:#B71C1C;padding:1px 3px;border-radius:3px;">
              <i class="fas fa-ban" style="margin-right:2px;"></i>CANCELADA
            </div>
          </div>
        `;
      } else {
        wrapper.innerHTML = `
          <div style="display:flex;flex-direction:column;height:100%;width:100%;">
            <div style="font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${event.title}
            </div>
            <div style="font-size:0.8em;margin-top:auto;">
              ${arg.timeText}
            </div>
          </div>
        `;
      }
      
      return { domNodes: [wrapper] };
    }
  };

  constructor(
    private changeDetector: ChangeDetectorRef,
    private workOrdersService: WorkOrdersService,
    private datePipe: DatePipe,
    public authService: AuthService,
    public modalService: ModalService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {   
    const storedPermissions = this.localStorageService.getItem<Permission[]>('permissions');  
    const permissions = storedPermissions?.find((p) => p.page == "work orders")?.permissions;
    ((permissions as number >> 0) % 2 === 1) ? true : this.router.navigate(['/calendar/my-calendar']);
    this.getAllWorkOrders();
  }

  ngOnDestroy(): void {
    this.cleanupTooltips();
  }

  openOverlappingEventsModal(): void {
    const selectedEvent = this.currentEvents.find(event => event.id === this.selectedEventId);
    
    if (!selectedEvent) return;
    
    const timeStart = selectedEvent.start?.getTime() || 0;
    const timeEnd = selectedEvent.end?.getTime() || timeStart;
    
    const overlappingEvents = this.currentEvents.filter(otherEvent => {
      if (otherEvent.id === this.selectedEventId) return false;
      
      const otherStart = otherEvent.start?.getTime() || 0;
      const otherEnd = otherEvent.end?.getTime() || otherStart;
      
      return (timeStart < otherEnd && timeEnd > otherStart);
    });
    
    this.selectedEventGroup = [selectedEvent, ...overlappingEvents].map(event => {
      return {
        id: event.id,
        title: event.title,
        start: event.start ? this.datePipe.transform(event.start, 'h:mm a') : '',
    end: event.end ? this.datePipe.transform(event.end, 'h:mm a') : '',
        status: event.extendedProps['status']?.id === 2 ? 'CANCELADA' : 'Activa'
      };
    });
    
    this.showEventInfoModal = true;
    this.changeDetector.detectChanges();
  }

  cleanupTooltips(): void {
    this.tooltips.forEach(tooltip => {
      if (document.body.contains(tooltip)) {
        document.body.removeChild(tooltip);
      }
    });
    this.tooltips = [];
  }

  hideAllTooltips(): void {
    this.tooltips.forEach(tooltip => {
      tooltip.style.display = 'none';
    });
  }

  getAllWorkOrders() {
    this.isLoading = true;
    this.workOrdersService.getPlanning2() 
      .subscribe( events => {
        this.allEvents = events;
        this.calendarOptions.initialEvents = events.map((event: any) => ({
          ...event,
          extendedProps: {
            status: event.status
          }
        }));
        this.isLoading = false;
      });
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    console.log({ selectInfo });
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.hideAllTooltips();
    this.router.navigate(['work-orders', 'details', clickInfo.event.id]);
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
    
    if (this.showEventInfoModal && this.selectedEventId) {
      this.openOverlappingEventsModal();
    }
  }

  handleEventChange(eventChange: EventChangeArg) {
    const { event } = eventChange;
    
    const data = {
      startDate: this.datePipe.transform(event.start, 'yyyy-MM-dd'),
      startTime: event.allDay ? null : this.datePipe.transform(event.start, 'H:mm'),
      finalDate: this.datePipe.transform((event.end)? event.end : event.start, 'yyyy-MM-dd'),
      finalTime: this.datePipe.transform((event.end)? event.end : event.start, 'H:mm'),
    };
    
    this.workOrdersService.updateTimes(event.id, data)
      .subscribe({
        next: (resp) => {
          if (this.showEventInfoModal) {
            this.openOverlappingEventsModal();
          }
        }
      });
    
    this.hideAllTooltips();
    this.changeDetector.detectChanges();
  }

  showContextMenu(x: number, y: number): void {
    this.contextMenuPosition = { x, y };
    this.contextMenuVisible = true;
    this.changeDetector.detectChanges();
  }

  hideContextMenu(): void {
    this.contextMenuVisible = false;
    this.changeDetector.detectChanges();
  }

  reprogramWorkOrder(): void {
    this.hideContextMenu();
    this.hideAllTooltips();
    this.router.navigate(['work-orders', 'reprogram', this.contextWorkOrderId]);
  }

  closeEventInfoModal(): void {
    this.showEventInfoModal = false;
    this.selectedEventId = '';
  }

  selectEvent(eventId: string): void {
    this.showEventInfoModal = false;
    this.selectedEventId = '';
    this.hideAllTooltips();
    this.router.navigate(['work-orders', 'details', eventId]);
  }

  refreshEventModal(): void {
    if (this.selectedEventId) {
      this.openOverlappingEventsModal();
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.contextMenuVisible) {
      this.hideContextMenu();
    }
    this.hideAllTooltips();
  }

  @HostListener('window:popstate')
  onPopState(): void {
    this.cleanupTooltips();
  }
}