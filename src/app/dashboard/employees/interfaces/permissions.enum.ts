export const employeePermissions = [
  { name: 'readEmployee', label: 'Ver', value: 1 },      // 2^0
  { name: 'createEmployee', label: 'Crear', value: 2 },  // 2^1
  { name: 'editEmployee', label: 'Editar', value: 4 },  // 2^2
  { name: 'toolsEmployees', label: 'Herramientas', value: 8 }, // 2^3
  {name: 'calendaryEmployee', label:'Calendario',value:16 } 
] as const;

export const incidencePermissions =[
  { name: 'readIncidence', label: 'Ver', value: 1 },      // 2^0
  { name: 'createIncidence', label: 'Crear', value: 2 },  // 2^
  { name: 'editIncidence' , label:'editar',value:4},
  {name : 'deleteIncidence', label:'eliminar',value:8}
] as const;

export const bonuses =[
  {name:'readbonuses', label: 'Ver',value:1},
  {name:'createBonuses', label: 'Crear',value:2},
  {name:'editBonuses', label:'editar', value:4},
  {name:'deleteBonuses', label:'eliminar',value:8}
]

export const workStation=[
  {name:'readWorkStation', label: 'Ver',value:1},
  {name:'createWorkStation', label: 'Crear',value:2},
  {name:'editWorkStation', label:'editar', value:4},
  {name:'deleteWorkStation', label:'eliminar',value:8}
] as const;
export const customer=[
  {name:'readCustomer', label: 'Ver',value:1},
  {name:'createCustomer', label: 'Crear',value:2},
  {name:'editCustomer', label:'editar', value:4},
  {name:'invoice', label:'facturas',value:8},
  {name:'contact', label:'contacto',value:16}

]as const;
export const budgets=[
  {name:'readBudget', label: 'Ver',value:1},
  {name:'createBudget', label: 'Crear',value:2},
  {name:'editBudget', label:'editar', value:4},
] as const;

export const contracts =[
  {name:'readContract', label: 'Ver',value:1},
  {name:'createContract', label: 'Crear',value:2},
  {name:'renewContract',label:'renovar',value:4}
] as const;


export const sale =[
  {name:'readSale', label: 'Ver',value:1},
] as const;

export const template=[
  {name:'readTemplate', label: 'Ver',value:1},
  {name:'createTemplate', label: 'Crear',value:2},
  {name:'editTemplate', label:'editar', value:4},
  {name:'deleteTemplate', label:'eliminar',value:8}
] as const;

export const leads=[
  {name:'readLeads', label: 'Ver',value:1},
  {name:'createLeads', label: 'Añadir a clientes',value:2},
  {name:'contacLeads', label:'Contactos', value:4}
] as const;
export const calendar=[
  {name:'readCalendar', label: 'Ver',value:1},
  { name:'createCalendar', label: 'Crear',value:2},
  {name:'editCalendar', label:'editar', value:4},
  {name: 'deleteCalendar', label:'eliminar',value:8}
]

export const  store=[
  {name:'readStore', label: 'Ver',value:1},
  {name:'createStore', label: 'Crear',value:2},
  {name:'editStore', label:'editar', value:4},
  {name: 'deleteStore', label:'eliminar', value:8}
]

export const businessLine =[
  {name:'readBusinessLine', label: 'Ver',value:1},
  {name:'createBusinessLine', label: 'Crear',value:2},
  {name:'editBusinessLine', label:'editar', value:4},
  {name: 'deleteBusinessLine', label:'eliminar',value:8}
]

export const kardex=[
  {name:'readKardex', label: 'Ver',value:1},
  {name:'createKardex', label: 'Crear',value:2},
  {name:'editKardex', label:'editar', value:4}, 
] as const;

export const workOrders =[
  {name:'readWorkOrders', label: 'Ver',value:1},
  {name:'createWorkOrders', label: 'Crear',value:2},
  {name:'editWorkOrders', label:'editar', value:4},
  {name: 'deleteWorkOrders', label:'eliminar',value:8}
] as const;


export const payments =[
  {name:'readPayments', label: 'Ver',value:1},
  {name:'createPayments', label: 'Crear',value:2},
  {name:'editPayments', label:'editar', value:4},
  {name: 'deletePayments', label:'eliminar',value:8}
] as const;


export const suppliers=[
  {name:'readSuppliers', label: 'Ver',value:1},
  {name:'createSuppliers', label: 'Crear',value:2},
  {name:'editSuppliers', label:'editar', value:4},
  {name: 'deleteSuppliers', label:'eliminar',value:8},
  {name:'contact', label:'contacto',value:16}
] as const;

export const cashRegister=[
  {name:'readCashRegister', label: 'Ver',value:1},
  {name:'createCashRegister', label: 'Crear',value:2},
  {name:'editCashRegister', label:'editar', value:4},
 // {name: 'deleteCashRegister', label:'eliminar',value:8},
  {name:'validate', label:'validar',value:16}
] as const;
export type PermissionName = 
typeof employeePermissions[number]['name'] | 
typeof incidencePermissions[number]['name'] |
typeof bonuses[number]['name']|
typeof workStation[number]['name']|
typeof customer[number]['name']|
typeof budgets[number]['name']|
typeof contracts[number]['name']|
typeof sale[number]['name']|
typeof template[number]['name']|
typeof leads[number]['name']|
typeof calendar[number]['name']|
typeof store[number]['name']|
typeof businessLine[number]['name']|
typeof kardex[number]['name']|
typeof workOrders[number]['name']|
typeof payments[number]['name']|
typeof suppliers[number]['name']|
typeof cashRegister[number]['name']
;

const allPermissions = [...employeePermissions, ...incidencePermissions, ...bonuses, ...workStation,...customer, ...budgets
  , ...contracts, ...sale, ...template, ...leads, ...calendar, ...store, ...businessLine, ...kardex, ...workOrders, ...payments,
  ...suppliers, ...cashRegister

];

export const permissionsMap: Record<PermissionName, number> = allPermissions.reduce((map, perm) => {
  map[perm.name] = perm.value;
  return map;
}, {} as Record<PermissionName, number>);

export const modules = [
  {
    name: 'employees',
    label: 'Empleados',
    permissions: employeePermissions.map(({ name, label }) => (  { name, label })),
  },
  {
    name: 'incidences',
    label: 'Incidentes',
    permissions: incidencePermissions.map(({ name, label }) => ({ name, label })),
  },
  {
    name: 'bonuses',
    label: 'Bonos',
    permissions: bonuses.map(({ name, label }) => ({ name, label })),
    },
  {
    name: 'workStation',
    label: 'Puestos de trabajo',
    permissions: workStation.map(({ name, label }) => ({ name, label })),
  },
  {
    name: 'customer',
    label: 'Clientes',
    permissions: customer.map(({ name, label }) => ({ name, label })),
  },
  {
      name: 'budgets',
      label: 'Cotizaciones',
      permissions: budgets.map(({ name, label }) => ({ name, label })),
  },
  {
    name: 'contracts',
    label: 'Contratos',
    permissions: contracts.map(({ name, label }) => ({ name, label })),
  },
  {
    name: 'sale',
    label: 'Ventas',
    permissions: sale.map(({ name, label }) => ({ name, label })),
    },
    {
      name: 'template',
      label: 'Plantillas/Descripciones',
      permissions: template.map(({ name, label }) => ({ name, label })),
    },
    {
      name: 'leads',
      label: 'Leads',
      permissions: leads.map(({ name, label }) => ({ name, label })),
      },
      {
        name: 'calendar type',
        label: 'Tipo de eventos',
        permissions: calendar.map(({ name, label }) => ({ name, label })),
        },
      {
        name: 'store',
        label: 'Almacen',
        permissions: store.map(({ name, label }) => ({ name, label })),
        },
        {
          name: 'business line',
          label: 'Línea de negocio',
          permissions: businessLine.map(({ name, label }) => ({ name, label })),
          },
      {
        name: 'kardex',
        label: 'Compras/ventas',
        permissions: kardex.map(({ name, label }) => ({ name, label })),
      },
      {
        name: 'work orders',
        label: 'Ordenes de trabajo',
        permissions: workOrders.map(({ name, label }) => ({ name, label })),
      },
      {
        name: 'payment',
        label: 'Cobranza',
        permissions: payments.map(({ name, label }) => ({ name, label })),
        },
        {
          name: 'suppliers',
          label: 'Proveedores',
          permissions: suppliers.map(({ name, label }) => ({ name, label })),
          },
          {
            name: 'cash register',
            label: 'Caja',
            permissions: cashRegister.map(({ name, label }) => ({ name, label })),
            },
];