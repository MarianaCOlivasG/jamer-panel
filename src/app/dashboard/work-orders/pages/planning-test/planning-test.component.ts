import { Component, AfterViewInit, OnInit } from "@angular/core";
import { Employee } from "src/app/dashboard/employees/interfaces";
import { EmployeesService } from "src/app/dashboard/employees/services/employees.service";
import { WorkOrdersService } from "../../services/work-orders.service";
import { Router } from "@angular/router";

declare var DayPilot: any;
@Component({
  selector: "app-planning-test",
  templateUrl: "./planning-test.component.html",
  styleUrls: ["./planning-test.component.scss"],
})
export class PlanningTestComponent implements AfterViewInit, OnInit {
  
  public dp: any;
  public technicals: { name: string, id: string, backColor?: string }[] = [];
  public currentDate: any = DayPilot.Date.today();
  public isLoading: boolean = false;

  constructor(
    private employeesService: EmployeesService,
    private workOrdersService: WorkOrdersService,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.employeesService.getTechnicalsWithoutPaginationNoMultiSelect()
      .subscribe({
        next: (resp) => {
          resp.employees = resp.employees.filter((employee: Employee) => employee.user.isActive );
          this.technicals = resp.employees.map((employee: Employee) => ({
            name: `${employee?.name} ${employee.lastName}`,
            id: employee.id
          }));
          this.loadCalendar();
        }
      });
  }

  loadCalendar() {
    const columnsWithColors = this.technicals.map((technical, index) => {
      const colors = ["#FFCCCC", "#CCFFCC", "#CCCCFF", "#FFFFCC", "#FFCCFF"]; 
      const color = colors[index % colors.length]; 
      return {
        ...technical,
        backColor: color, 
      };
    });

    this.dp = new DayPilot.Calendar("dp", {
      viewType: "Resources",
      headerHeight: 60,
      showCurrentTime: true,
      startDate: this.currentDate,
      columns: columnsWithColors,
      onEventClick: (args: any) => {
        this.handleEventClick(args);
      },
      allowEventDelete: false,
      allowEventMove: true,
      allowEventResize: true,
      readOnly: true, 
      onEventMoved: (args: any) => {
        this.updatePlanningEvent(args);
      },
      onEventResized: (args: any) => {
        this.updatePlanningEvent(args);
      },
      eventHeight: 30,
      eventArrangement: "SideBySide",
      onBeforeEventRender: (args: any) => {
        if (args.data.status === 2) { // Orden cancelada
          // Añadir ícono de prohibido (❌)
          args.data.barColor = "#cccccc"; // Color gris
          args.data.text = `❌ ${args.data.text}`;
          
          // Añadir estilo tachado
          args.data.html = `
            <div style="text-decoration: line-through; color: #999;">
              ${args.data.text}
            </div>
          `;
        }
        
      
      }
    });

    this.dp.init();
    this.getAllWorkOrders();
  }

  changeDay(direction: "prev" | "next") {
    this.currentDate = direction === "prev"
      ? this.currentDate.addDays(-1)
      : this.currentDate.addDays(1);
    this.dp.startDate = this.currentDate;
    this.dp.update();
    this.getAllWorkOrders();
  }

  getAllWorkOrders() {
    this.isLoading = true;
    const filterDate = this.currentDate.toString("yyyy-MM-dd");
    this.workOrdersService.getPlanning(filterDate)
      .subscribe(data => {
        const events = this.mapperOrders(data.planning);
        this.dp.update({ events });
        this.isLoading = false;
      });
  }

  mapperOrders(orders: any[]): any[] {

    return orders.map((order) => {
      const start = this.formatDate(order?.start);
      const end = this.formatDate(order?.end);
      if (!start || !end) {
        return null;
      }
      const startDate = new DayPilot.Date(start);
      let endDate = new DayPilot.Date(end);
      
      if (endDate < startDate) {
        endDate = endDate.addHours(12);
      }
      if (endDate < startDate) {
        endDate = endDate.addHours(12);
      }

      return {
        start: startDate,
        end: endDate,
        id: order.id, 
        resource: order.technical_id, 
        text: order.title, 
        barColor: order.color,
        status: order.status.id, // Mantenemos el estado para usarlo en el renderizado
        toolTip: `Estado: ${order.status.name}` // Añadimos tooltip
      };
    }).filter(event => event !== null);
  }
  
  formatDate(date: string): string {
    if (!date) return '';
    const dateParts = date.split('T');
    if (!dateParts[1]) return '';
    const timeParts = dateParts[1].split(':');
    if (timeParts[0].length === 1) {
      timeParts[0] = '0' + timeParts[0]; 
    }
    if (timeParts[1].length === 1) {
      timeParts[1] = '0' + timeParts[1];
    }
    return `${dateParts[0]}T${timeParts[0]}:${timeParts[1]}:${timeParts[2]}`;
  }

  updatePlanningEvent(args: any) {
    const updatedData = {
      start: args.newStart.toString(),
      end: args.newEnd.toString(),
      technical_id: args.newResource 
    };
    
    this.workOrdersService.updatePlanning(args.e.data.id, updatedData)
      .subscribe({
        next: (resp: any) => {
        },
        error: (error: any) => {
          this.dp.message("Error al actualizar");
        }
      });
  }

  handleEventClick(clickInfo: any) {
    this.router.navigate(['work-orders', 'details', clickInfo.e.data.id]);
  }
}