# Smart Inventory Core System

Sistem manajemen stok barang dengan fitur Stock In, Stock Out (Two-Phase Commitment), dan Inventory Tracking. Dibangun menggunakan Go (Backend) dan React (Frontend).

## Fitur Utama

- **Stock In**: Alur `CREATED -> IN_PROGRESS -> DONE`. Stok fisik bertambah hanya saat status `DONE`.
- **Inventory**: Pemisahan antara *Physical Stock* dan *Available Stock*. Filter berdasarkan Nama, SKU, atau Customer.
- **Stock Out (Two-Phase Commitment)**:
  - **Stage 1 (Allocation)**: Reservasi stok (status `DRAFT`), mengurangi *Available Stock*.
  - **Stage 2 (Execution)**: Pengurangan *Physical Stock* saat `DONE`. Fitur *Rollback* jika dibatalkan.
- **Reporting**: Laporan transaksi detail untuk status `DONE` dan Audit Log pergerakan stok.

## Arsitektur

### Backend (Golang)
- **Framework**: Gin Gonic.
- **ORM**: GORM.
- **Database**: SQLite (Default) - Mudah diganti ke PostgreSQL melalui konfigurasi GORM.
- **Prinsip**: SOLID & DRY. Menggunakan database transaction untuk menjamin atomisitas perubahan stok.

### Frontend (React)
- **State Management**: Zustand.
- **Styling**: Tailwind CSS & Lucide Icons.
- **Animations**: Framer Motion.

## Cara Menjalankan Aplikasi

### Persyaratan
- Node.js (v18+)
- Go (v1.21+)

### Backend (Go)
1. Masuk ke direktori `backend-go`:
   ```bash
   cd backend-go
   ```
2. Jalankan aplikasi:
   ```bash
   go run main.go
   ```
   Backend akan berjalan di `http://localhost:8080`.

### Frontend (React)
1. Install dependensi:
   ```bash
   npm install
   ```
2. Jalankan development server:
   ```bash
   npm run dev
   ```
   Frontend akan berjalan di `http://localhost:3000` dan melakukan proxy ke backend.

## Struktur Database (SQLite)

- **Products**: Menyimpan data barang, SKU, Customer, Physical Stock, dan Available Stock.
- **Transactions**: Mencatat riwayat Stock In dan Stock Out beserta statusnya.
- **InventoryLogs**: Audit log untuk setiap perubahan stok (Previous vs New Stock).
