import { BusinessLine } from "../../catalogue/interfaces"
import { Customer } from "../../customers/interfaces"
import { Address } from "../../customers/interfaces/address.interface"
import { ContractProduct } from "../../customers/interfaces/contract-product.interface"
import { Contract } from "../../customers/interfaces/contract.interface"
import { Employee } from "../../employees/interfaces"
import { WorkStatus } from "./work-status.interface"


export interface WorkOrder {
    isValidated: boolean
    isBudget: boolean
    isVisible: boolean
    id: string
    folio: string
    startDate: Date
    startTime: any
    finalDate: Date
    finalTime: any
    status: WorkStatus
    statusId:  number
    customer: Customer
    customerId:  number
    address: Address
    addressId:  number
    totalWithIva:  number
    businessLine: BusinessLine
    businessLineId:  number
    employees: Employee[] 
    employeesIds: any
    description: string
    createdAt: Date
    updatedAt: Date
    contractId: number
    contract: Contract
    contractsProducts: ContractProduct[],
    workOrderSolution: { rating: number }[]
    workOrdersContractProducts: {
        id: number,
        contractProduct: ContractProduct
        amount: number,
    }[],
    facturaOrRemision: string;
    noFactura: string
    typeWork: string
    isWithContract: boolean
}