# Giglio Backend test

## Stack
- **NestJS** (ultima versione stabile)
- **MySQL 8** con **Prisma**
- **gRPC** integrato in NestJS
- **class-validator / class-transformer** per validazioni
- **Docker Compose** per ambiente completo (app + DB)
- **Jest** per test unitari ed e2e

---

## Entità
- **User**: `id`, `name`, `email`
- **Product**: `id`, `name`, `price`
- **Order**: `id`, `userId`, `productIds[]`, `totalAmount`, `status` (`CREATED | PAID | SHIPPED`)

> Nota: prodotti duplicati nello stesso ordine vengono raggruppati per quantità (es. `[1,1,2]` → prodotto 1 x2, prodotto 2 x1). Il `totalAmount` è calcolato server-side considerando le quantità.

---

## Requisiti
- Docker
- Docker Compose

> Senza Docker: Node.js LTS, npm/yarn/pnpm, MySQL 8.

---

# Avvio con Docker

Dalla root del progetto:

```bash
docker compose up --build
```
---

## Porte e URL
- REST: http://localhost:3000
- gRPC: localhost:50051

## Quick test
```bash
curl -s http://localhost:3000/users
```

---

# API REST

## Users
- `POST /users` – crea user
- `GET /users` – lista users
- `GET /users/:id` – dettaglio user
- `PATCH /users/:id` – aggiorna user
- `DELETE /users/:id` – elimina user (204)

### Body esempio (create user)
```json
{
  "name": "Lorenzo Rimi",
  "email": "lorenzo.rimi@gmail.com"
}
```

## Products
- `POST /products`
- `GET /products`
- `GET /products/:id`
- `PATCH /products/:id`
- `DELETE /products/:id` (204)

### Body esempio (create product)
```json
{
  "name": "Arancina ACCARNE",
  "price": 2.5
}
```

## Orders
- `POST /orders` – **CreateOrder reale** (calcolo server-side)
- `GET /orders`
- `GET /orders/:id`
- `PATCH /orders/:id` – update status
- `DELETE /orders/:id` (204)

### Body esempio (CreateOrder reale)
```json
{
  "userId": 1,
  "productIds": [1, 2, 2]
}
```

### Response attesa (esempio)
```json
{
  "id": 1,
  "userId": 1,
  "totalAmount": 7.5,
  "status": "CREATED",
  "products": [
    { "productId": 1, "price": 2.5, "quantity": 1 },
    { "productId": 2, "price": 2.5, "quantity": 2 }
  ]
}
```

> Prima di creare un ordine, bisogna creare almeno 1 `User` e 1 `Product`.
> Poi usare gli `id` restituiti dalle response (o ottenuti via GET) dentro `userId` e `productIds`.

---

# gRPC

Prerequisito: installare [grpcurl](https://github.com/fullstorydev/grpcurl#installation).

## Users

### CreateUser
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  -d '{"name":"Mario Rossi","email":"mario@example.com"}' \
  localhost:50051 giglio.UsersService/CreateUser
```

### FindAllUsers
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  localhost:50051 giglio.UsersService/FindAllUsers
```

### FindOneUser
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  -d '{"id":1}' \
  localhost:50051 giglio.UsersService/FindOneUser
```

### UpdateUser
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  -d '{"id":1,"name":"Mario Bianchi"}' \
  localhost:50051 giglio.UsersService/UpdateUser
```

### RemoveUser
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  -d '{"id":1}' \
  localhost:50051 giglio.UsersService/RemoveUser
```

## Products

### CreateProduct
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  -d '{"name":"Arancina","price":2.5}' \
  localhost:50051 giglio.ProductsService/CreateProduct
```

### FindAllProducts
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  localhost:50051 giglio.ProductsService/FindAllProducts
```

### FindOneProduct
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  -d '{"id":1}' \
  localhost:50051 giglio.ProductsService/FindOneProduct
```

### UpdateProduct
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  -d '{"id":1,"price":3.0}' \
  localhost:50051 giglio.ProductsService/UpdateProduct
```

### RemoveProduct
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  -d '{"id":1}' \
  localhost:50051 giglio.ProductsService/RemoveProduct
```

## Orders

### CreateOrder
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  -d '{"userId":1,"productIds":[1,2]}' \
  localhost:50051 giglio.OrdersService/CreateOrder
```

### FindAllOrders
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  localhost:50051 giglio.OrdersService/FindAllOrders
```

### FindOneOrder
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  -d '{"id":1}' \
  localhost:50051 giglio.OrdersService/FindOneOrder
```

### UpdateOrder
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  -d '{"id":1,"status":"PAID"}' \
  localhost:50051 giglio.OrdersService/UpdateOrder
```

### RemoveOrder
```bash
grpcurl -plaintext -import-path proto -proto giglio.proto \
  -d '{"id":1}' \
  localhost:50051 giglio.OrdersService/RemoveOrder
```

---

# Test

```bash
# unit test (orders service)
npm test

# e2e test (orders module - validazione, CRUD, errori)
npm run test:e2e
```
