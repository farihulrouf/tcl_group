# Smart Inventory Core System

Sistem manajemen stok barang dengan fitur Stock In, Stock Out (Two-Phase Commitment), dan Inventory Tracking. Dibangun menggunakan Go (Backend) dan React (Frontend) dengan pendekatan scalable dan transaction-safe.

---

## 🚀 Fitur Utama

- **Stock In**  
  Alur: `CREATED -> IN_PROGRESS -> DONE`  
  Stok fisik (*Physical Stock*) hanya bertambah saat status `DONE`.  
  Setiap perubahan status tercatat dalam audit log.

- **Inventory**  
  Memisahkan:
  - Physical Stock (stok aktual di gudang)
  - Reserved Stock (stok yang sudah dialokasikan)
  - Available Stock (Physical - Reserved)  
  Mendukung filter berdasarkan Nama, SKU, atau Customer.

- **Stock Out (Two-Phase Commitment)**  
  - **Stage 1 (Allocation / DRAFT)**  
    Sistem melakukan reservasi stok (*reserved_stock*) sehingga tidak bisa digunakan oleh transaksi lain.
  - **Stage 2 (Execution / DONE)**  
    Stok fisik dikurangi saat proses selesai.  
  - **Rollback**  
    Jika dibatalkan saat `IN_PROGRESS`, stok akan dikembalikan ke Available.

- **Reporting**  
  Laporan transaksi hanya untuk status `DONE` + audit trail lengkap per perubahan stok.

---

## 🏗️ Arsitektur

Aplikasi ini menggunakan **Monolithic Architecture**, di mana seluruh komponen backend (API, business logic, dan data access) berada dalam satu service yang terintegrasi.

Pendekatan ini dipilih untuk:
- Kemudahan development & deployment
- Konsistensi data melalui transaksi terpusat
- Cocok untuk skala aplikasi awal / MVP

---

## ⚙️ Backend (Golang)

- **Framework**: Gin Gonic  
- **ORM**: GORM  
- **Database**:  
  - SQLite (default untuk development)  
  - PostgreSQL (production-ready via konfigurasi `.env`)  
- **Prinsip**: SOLID & DRY  
- **Transaction Handling**:  
  Semua perubahan stok (Stock In & Stock Out) menggunakan database transaction untuk menjamin **atomicity** dan mencegah race condition.

---

## 🎨 Frontend (React)

- **State Management**: Zustand  
- **Styling**: Tailwind CSS & Lucide Icons  
- **Animations**: Framer Motion  

---

## ▶️ Cara Menjalankan Aplikasi

### Persyaratan
- Node.js (v18+)
- Go (v1.21+)

---

### 🔧 Backend (Go)

1. Masuk ke direktori:
   ```bash
   cd backend-go
