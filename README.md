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
## ER Diagram

The ER diagram shows the relationships between users, resources, and reservations.

[View ER Diagram](https://dbdiagram.io/embed?utm_source=chatgpt.com#c=VGFibGUgdXNlcnMgewogIGlkIGludCBbcGssIGluY3JlbWVudF0KICBuYW1lIHZhcmNoYXIKICBlbWFpbCB2YXJjaGFyIFt1bmlxdWVdCiAgY3JlYXRlZEF0IHRpbWVzdGFtcAp9CgpUYWJsZSByZXNvdXJjZXMgewogIGlkIGludCBbcGssIGluY3JlbWVudF0KICBuYW1lIHZhcmNoYXIKICBkZXNjcmlwdGlvbiB0ZXh0CiAgdHlwZSB2YXJjaGFyCiAgbG9jYXRpb24gdmFyY2hhcgogIGNyZWF0ZWRBdCB0aW1lc3RhbXAKfQoKVGFibGUgcmVzZXJ2YXRpb25zIHsKICBpZCBpbnQgW3BrLCBpbmNyZW1lbnRdCiAgc3RhcnRUaW1lIHRpbWVzdGFtcAogIGVuZFRpbWUgdGltZXN0YW1wCiAgdXNlcklkIGludCBbbm90IG51bGxdCiAgcmVzb3VyY2VJZCBpbnQgW25vdCBudWxsXQogIGNyZWF0ZWRBdCB0aW1lc3RhbXAKCiAgaW5kZXhlcyB7CiAgICAocmVzb3VyY2VJZCwgc3RhcnRUaW1lLCBlbmRUaW1lKQogIH0KfQoKVUmVmOiByZXNlcnZhdGlvbnMudXNlcklkID4gdXNlcnMuaWQKUmVmOiByZXNlcnZhdGlvbnMucmVzb3VyY2VJZCA%2BIHJlc291cmNlcy5pZAo%3D)
