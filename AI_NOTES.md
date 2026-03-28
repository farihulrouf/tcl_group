# AI Usage Report (AI_NOTES.md)

## AI Tools Used
- **Google AI Studio Build (Gemini 3 Flash Preview)**: Digunakan untuk pembuatan kode awal, debugging, dan penyusunan dokumentasi.

## Prompt Paling Kompleks
> "Implementasikan alur Stock Out dengan Two-Phase Commitment (Allocation & Execution) menggunakan database transaction di Golang (GORM) dan Node.js (Sequelize). Pastikan Available Stock berkurang saat DRAFT, Physical Stock berkurang saat DONE, dan lakukan Rollback Available Stock jika status berubah menjadi CANCELLED sebelum DONE. Sertakan juga audit log untuk setiap perubahan stok (Previous vs New Stock)."

## Modifikasi Manual (Best Practice)
### Bagian Kode: Penanganan Transaksi Database (Rollback Logic)
AI awalnya menyarankan logika Stock Out yang hanya mengurangi stok fisik saat status `DONE`, namun lupa mengembalikan `Available Stock` jika transaksi dibatalkan (`CANCELLED`) pada tahap `IN_PROGRESS`.

**Modifikasi Manual**:
Saya secara manual menambahkan blok `else if (status === 'CANCELLED')` di dalam transaksi database pada endpoint `updateStockOutStatus`. Hal ini krusial untuk mematuhi aturan assessment: "Jika pesanan di-cancel pada tahap IN_PROGRESS, sistem harus melakukan Rollback (mengembalikan stok ke status Available)."

Tanpa modifikasi ini, stok yang sudah di-reservasi (DRAFT) akan "hilang" selamanya dari `Available Stock` meskipun transaksinya dibatalkan, yang akan menyebabkan ketidakkonsistenan data stok di gudang.

### Bagian Kode: Pemisahan Physical vs Available Stock
AI awalnya mencampuradukkan kedua nilai ini. Saya memisahkan logika pembaruan `PhysicalStock` dan `AvailableStock` agar sesuai dengan kebutuhan gudang nyata:
- **Available Stock**: Berkurang segera saat reservasi (DRAFT) agar barang tidak dijual dua kali.
- **Physical Stock**: Berkurang hanya saat barang benar-benar keluar gudang (DONE).
