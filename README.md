# Giglio test - Rimi

## Stack
- **NestJS** (ultima versione stabile)
- **MySQL 8** con **Prisma**
- **gRPC** integrato in NestJS
- **class-validator / class-transformer** per validazioni
- **Docker Compose** per ambiente completo (app + DB)
- **Jest** per test unitari

---

## Entità 
- **User**: `id`, `name`, `email`
- **Product**: `id`, `name`, `price`
- **Order**: `id`, `userId`, `productIds[]`, `totalAmount`, `status` (`CREATED | PAID | SHIPPED`)

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
Esempio:
```bash
curl -s http://localhost:3000/users
```


# API REST

## Users
- `POST /users` – crea user
- `GET /users` – lista users
- `GET /users/:id` – dettaglio user
- `PATCH /users/:id` – aggiorna user
- `DELETE /users/:id` – elimina user

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
- `DELETE /products/:id`

### Body esempio (create product)
```json
{
  "name": "Arancina ACCARNE",
  "price": "2.5"
}
```

## Orders
- `POST /orders` – **CreateOrder reale** (calcolo server-side)
- `GET /orders`
- `GET /orders/:id`
- `PATCH /orders/:id` – update (es. `status`)
- `DELETE /orders/:id`

### Body esempio (CreateOrder reale)
```json
{
  "userId": 1,
  "productIds": [1, 2, 3]
}
```

### Response attesa (esempio)
```json
{
    "id": 4,
    "userId": 1,
    "totalAmount": "1.5",
    "status": "CREATED",
    "products": [
        {
            "productId": 1,
            "price": "1.5"
        }
    ]
}
```

> Nota: prima di eseguire CreateOrder assicurati di avere già creato User e Product con gli id usati.

# gRPC

### CreateOrder
```bash
grpcurl -plaintext -import-path proto -proto proto/giglio.proto \
  -d '{"userId":1,"productIds":[1]}' \
  localhost:50051 giglio.OrdersService/CreateOrder
```