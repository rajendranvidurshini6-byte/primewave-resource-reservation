# Resource Reservation Management System

A full-stack web application for managing shared resource reservations. The system allows users to view available resources, create reservations, update existing reservations, delete reservations, and prevents overlapping bookings for the same resource.

## Overview

The application addresses the problem of manually managing shared resources, where scheduling conflicts and uncertainty about availability can occur.

The system provides a centralized interface for:

- Managing users and resources
- Creating reservations
- Checking resource availability
- Preventing overlapping reservations
- Updating existing reservations
- Deleting reservations
- Persisting reservation data in PostgreSQL

## Features

### Reservation Management

- Create a reservation for a selected user and resource
- Specify start and end date/time
- Edit an existing reservation
- Delete a reservation
- View existing reservations

### Availability

- Filter reservations by resource and date
- Show reservation details for the selected resource
- Prevent overlapping reservations for the same resource
- Allow back-to-back reservations

### Validation

- Required fields are validated
- Start time must be before end time
- User and resource must exist
- Invalid reservation IDs are rejected
- Conflicting reservations return a clear error message

## Technology Stack

- **Next.js** — App Router and API Route Handlers
- **TypeScript** — Application development
- **React** — User interface
- **PostgreSQL** — Persistent database storage
- **Prisma ORM** — Database contract and type-safe database access
- **Tailwind CSS** — UI styling

## Architecture

The application follows a simple full-stack architecture:

```text
┌──────────────────────────────┐
│        Next.js UI            │
│      React + TypeScript      │
└──────────────┬───────────────┘
               │
               │ HTTP
               ▼
┌──────────────────────────────┐
│   Next.js API Route Handler  │
│    /api/reservations         │
└──────────────┬───────────────┘
               │
               │ Prisma ORM
               ▼
┌──────────────────────────────┐
│        PostgreSQL            │
│                              │
│  users                       │
│  resources                   │
│  reservations                │
└──────────────────────────────┘