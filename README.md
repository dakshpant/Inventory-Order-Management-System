# Deployment

## Live Application

### Frontend (Vercel)

https://inventory-order-management-system-r.vercel.app/

### Backend API (Railway)

https://inventory-order-management-system-production-4882.up.railway.app/

### API Documentation (Swagger UI)

https://inventory-order-management-system-production-4882.up.railway.app/docs

---

# Docker

The entire application is fully containerized using Docker and Docker Compose.

## Included Docker Configuration

- Backend Dockerfile
- Frontend Dockerfile
- Docker Compose Configuration
- Environment Variable Support
- PostgreSQL Persistent Volume
- Multi-Service Container Orchestration

## Run with Docker Compose

```bash
docker compose up --build
```

Stop services:

```bash
docker compose down
```

Services started:

- Frontend
- Backend API
- PostgreSQL Database

---

# Assessment Requirements Coverage

## Backend

- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- Request Validation with Pydantic
- Error Handling
- RESTful API Design

## Frontend

- React
- Axios
- Responsive UI
- Form Validation
- Dashboard Analytics

## Database

- PostgreSQL
- Persistent Storage
- Relational Data Modeling

## Containerization

- Docker
- Docker Compose
- Production-Ready Dockerfiles

## Deployment

- Frontend deployed on Vercel
- Backend deployed on Railway
- Public API Documentation

---

# Deliverables

### Source Code

GitHub Repository:
https://github.com/dakshpant/Inventory-Order-Management-System

### Live Frontend

https://inventory-order-management-system-r.vercel.app/

### Live Backend API

https://inventory-order-management-system-production-4882.up.railway.app/

### API Documentation

https://inventory-order-management-system-production-4882.up.railway.app/docs

### Docker Support

- Backend Dockerfile Included
- Frontend Dockerfile Included
- Docker Compose Included
- PostgreSQL Container Included

---

# Business Rules Implemented

- Unique Product SKU Validation
- Unique Customer Email Validation
- Inventory Quantity Validation
- Automatic Inventory Deduction on Order Creation
- Automatic Inventory Restoration on Order Cancellation
- Backend Calculated Order Totals
- Request Validation
- Proper HTTP Status Codes
- Structured Error Responses
