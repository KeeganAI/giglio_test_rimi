//   status      OrderStatus @default(CREATED) ...
export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
}
