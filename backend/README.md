# AI 99 Course Platform - Backend API

This is the backend API server for the AI 99 Course Platform, built with Node.js, Express, and PostgreSQL.

## Features

- RESTful API for course management
- PostgreSQL database integration with Neon
- User management and authentication support
- Payment tracking
- Course module management
- Admin functionality

## Setup

### Prerequisites

- Node.js 16+ 
- PostgreSQL database (Neon)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials

5. Setup the database schema:
```bash
npm run setup-db
```

6. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### Users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `GET /api/users` - Get all users (admin)
- `PATCH /api/users/:id/access` - Update user access
- `PATCH /api/users/:id/progress` - Update user progress

### Modules
- `GET /api/modules` - Get all modules
- `GET /api/modules/published` - Get published modules
- `POST /api/modules` - Create module
- `PUT /api/modules/:id` - Update module
- `DELETE /api/modules/:id` - Delete module

### Payments
- `POST /api/payments` - Create payment
- `PATCH /api/payments/:id/status` - Update payment status
- `GET /api/payments/user/:userId` - Get user payments
- `GET /api/payments` - Get all payments (admin)

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run setup-db` - Setup database schema

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `API_VERSION` - API version

## Database Schema

The database includes tables for:
- `users` - User accounts and progress
- `modules` - Course modules and content
- `payments` - Payment transactions

## Security Features

- Helmet.js for security headers
- Rate limiting
- CORS configuration
- Input validation
- SQL injection protection via parameterized queries