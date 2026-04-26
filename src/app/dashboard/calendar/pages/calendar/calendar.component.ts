
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi, EventChangeArg } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ModalService } from 'src/app/shared/services/modal.service';
import { DiaryEventsService } from '../../services/diary-events.service';
import { CalendarService } from '../../services/calendar.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  public diaryEventIdSelected: number = 0;

  public calendarVisible = true;
  public alendarVisible = true;
  public calendarOptions: CalendarOptions = {
    locale: esLocale,
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
    // initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
    initialEvents: [], // alternatively, use the `events` setting to fetch from a feed
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    // you can update a remote database when these fire:
    // eventAdd:
    eventChange: this.handleEventChange.bind(this),
    // eventRemove:
  };
  public currentEvents: EventApi[] = [];

  public isLoading: boolean = true;

  public calendarId: number = 0;

  constructor(private changeDetector: ChangeDetectorRef,
             private calendarService: CalendarService,
             private diaryEventsService: DiaryEventsService,
             private datePipe: DatePipe,
             public authService: AuthService,
             public modalService: ModalService ) {
  }
  ngOnInit(): void {

    this.calendarService.getGeneral().subscribe( ({diary}) => {
      this.calendarId = diary.id;
      this.getAllEvents();
    });

  }

  getAllEvents() {
    this.isLoading = true;
    this.diaryEventsService.getAllByCalendarId( this.calendarId ) 
    .subscribe( events => {
      this.calendarOptions.initialEvents = events;
      this.isLoading = false;
    })
  }

  handleCalendarToggle() {
    this.calendarVisible = !this.calendarVisible;
  }

  handleWeekendsToggle() {
    const { calendarOptions } = this;
    calendarOptions.weekends = !calendarOptions.weekends;
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    // const title = prompt('Please enter a new title for your event');
    // const calendarApi = selectInfo.view.calendar;

    // calendarApi.unselect(); // clear date selection

    // if (title) {
    //   calendarApi.addEvent({
    //     id: createEventId(),
    //     title,
    //     start: selectInfo.startStr,
    //     end: selectInfo.endStr,
    //     allDay: selectInfo.allDay
    //   });
    // }
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.diaryEventIdSelected = Number(clickInfo.event.id);
    this.modalService.openModal();
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
    this.changeDetector.detectChanges();
  }

  handleEventChange( eventChange: EventChangeArg ) {

    const { event } = eventChange;

    const data = {
      startDate: this.datePipe.transform(event.start,'yyyy-MM-dd'),
      startTime: event.allDay ? null : this.datePipe.transform(event.start,'H:mm'),
      finalDate: this.datePipe.transform(event.end,'yyyy-MM-dd'),
      finalTime: this.datePipe.transform(event.end,'H:mm'),
    }

    console.log({data});

    this.diaryEventsService.updateTimes(event.id, data)
      .subscribe({
        next: (resp) => {
          console.log(resp);
        }
      })

    this.changeDetector.detectChanges();
    
  }


  addDiaryEvent() {
    this.diaryEventIdSelected = 0;
    this.modalService.openModal();
  }



  newDiaryEvent() {
    this.getAllEvents();
  }
}