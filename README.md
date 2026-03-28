# Smart Inventory Core System

A professional inventory management system built with React, Node.js (Express), and SQLite. This system implements complex state transitions for stock movements and a two-phase commitment pattern for stock allocation.

## Architecture

### Frontend (React + Zustand)
- **State Management**: Zustand is used for global state, handling API calls and local state synchronization.
- **UI/UX**: Tailwind CSS with a "Technical Dashboard" aesthetic. It emphasizes structure, precision, and readability.

### Backend (Node.js + SQLite/PostgreSQL)
- **Database**: SQLite is used by default (via Sequelize ORM). The configuration is managed in `.env`, allowing easy switching to PostgreSQL by changing `DB_DIALECT`.
- **Transaction Logic**: All stock updates are performed using **Sequelize Transactions** to ensure atomicity and prevent race conditions.
- **Two-Phase Commitment (Stock Out)**:
  1. **Allocation**: When a Stock Out is drafted, the system checks `availableStock` and "reserves" it by decrementing `availableStock` while keeping `physicalStock` unchanged.
  2. **Execution**: When the transaction is completed, `physicalStock` is decremented. If cancelled, the reservation is rolled back to `availableStock`.

## Features
- **Inventory Tracking**: Separate tracking for Physical Stock (actual count) and Available Stock (count minus pending allocations).
- **Stock In Workflow**: `CREATED` -> `IN_PROGRESS` -> `DONE`.
- **Stock Out Workflow**: `DRAFT` -> `IN_PROGRESS` -> `DONE` with rollback support.
- **Audit Logs**: Every physical stock change is logged with previous/new values and timestamps.

## How to Run
1. The application starts automatically in the AI Studio environment.
2. The database is initialized automatically on startup.
3. Access the dashboard to register products and manage transactions.
