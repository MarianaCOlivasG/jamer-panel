import { Customer } from "../../customers/interfaces"
import { DiaryEnventType } from "./diary-event-type.interface"


export interface DiaryEvent {

    id: string
    startDate: Date
    finalDate: Date
    startTime: number
    finalTime: number
    title: string
    description: string
    priority: string
    status: string
    color: string
    isActive: boolean
    diaryEnventType: DiaryEnventType
    diaryEnventTypeId:  number
    customer: Customer
    customerId: number
}
