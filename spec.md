# Client Management App with Payment Tracking

## Overview
A client management application that allows users to manage client information and track payments associated with each client.

## Core Features

### Client Management
- Add new clients with name, contact information (email, phone), and notes
- Edit existing client details
- View list of all clients
- Search clients by name or contact information
- Filter clients based on criteria

### Payment Tracking
- Record payments for each client including:
  - Payment amount
  - Payment date
  - Payment method (cash, credit card, bank transfer, etc.)
  - Optional notes
- View payment history for each client
- Edit existing payment records
- Search payments by amount, date, or method
- Filter payments by date range, payment method, or client

### Dashboard
- Display total payments received per client
- Show overall total of all payments across all clients
- Summary statistics and key metrics

### User Interface
- Clean, simple design
- Client list view with basic information
- Detailed client view showing payment history
- Forms for adding/editing clients and payments
- Search and filter controls
- Dashboard with payment summaries

## Data Storage (Backend)
- Client information (name, contact details, notes)
- Payment records (amount, date, method, notes, associated client)
- All data must be persisted in the backend for reliability

## Key Operations (Backend)
- Create, read, update, delete clients
- Create, read, update, delete payments
- Retrieve payment history for specific clients
- Calculate payment totals per client and overall totals
- Search and filter functionality for both clients and payments
