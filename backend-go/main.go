package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Models
type Product struct {
	SKU            string  `gorm:"primaryKey" json:"sku"`
	Name           string  `json:"name"`
	Description    string  `json:"description"`
	Customer       string  `json:"customer"`
	PhysicalStock  int     `json:"physicalStock"`
	AvailableStock int     `json:"availableStock"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type Transaction struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	SKU       string    `json:"sku"`
	Quantity  int       `json:"quantity"`
	Customer  string    `json:"customer"`
	Type      string    `json:"type"`   // IN or OUT
	Status    string    `json:"status"` // CREATED, DRAFT, IN_PROGRESS, DONE, CANCELLED
	CreatedAt time.Time `json:"createdAt"`
}

type InventoryLog struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Type          string    `json:"type"` // IN, OUT, ADJUST
	SKU           string    `json:"sku"`
	Quantity      int       `json:"quantity"`
	PreviousStock int       `json:"previousStock"`
	NewStock      int       `json:"newStock"`
	CreatedAt     time.Time `json:"createdAt"`
}

var db *gorm.DB

func initDB() {
	var err error
	// Menggunakan SQLite sesuai permintaan
	db, err = gorm.Open(sqlite.Open("inventory.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto Migration
	db.AutoMigrate(&Product{}, &Transaction{}, &InventoryLog{})
}

func main() {
	initDB()

	r := gin.Default()

	// API Routes
	api := r.Group("/api")
	{
		api.GET("/products", getProducts)
		api.POST("/products", createProduct)
		api.PUT("/products/:sku/adjust", adjustStock)
		api.GET("/transactions", getTransactions)
		api.POST("/stock-in", createStockIn)
		api.PUT("/stock-in/:id/status", updateStockInStatus)
		api.POST("/stock-out", createStockOut)
		api.PUT("/stock-out/:id/status", updateStockOutStatus)
		api.GET("/logs", getLogs)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}

// Handlers
func getProducts(c *gin.Context) {
	var products []Product
	db.Find(&products)
	c.JSON(http.StatusOK, products)
}

func createProduct(c *gin.Context) {
	var p Product
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p.AvailableStock = p.PhysicalStock
	db.Create(&p)

	db.Create(&InventoryLog{
		Type:          "ADJUST",
		SKU:           p.SKU,
		Quantity:      p.PhysicalStock,
		PreviousStock: 0,
		NewStock:      p.PhysicalStock,
	})

	c.JSON(http.StatusOK, p)
}

func adjustStock(c *gin.Context) {
	sku := c.Param("sku")
	var input struct {
		NewPhysical int `json:"newPhysical"`
	}
	c.ShouldBindJSON(&input)

	err := db.Transaction(func(tx *gorm.DB) error {
		var p Product
		if err := tx.First(&p, "sku = ?", sku).Error; err != nil {
			return err
		}

		diff := input.NewPhysical - p.PhysicalStock
		prev := p.PhysicalStock

		p.PhysicalStock = input.NewPhysical
		p.AvailableStock += diff
		tx.Save(&p)

		tx.Create(&InventoryLog{
			Type:          "ADJUST",
			SKU:           sku,
			Quantity:      diff,
			PreviousStock: prev,
			NewStock:      input.NewPhysical,
		})
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func getTransactions(c *gin.Context) {
	var transactions []Transaction
	db.Order("created_at desc").Find(&transactions)
	c.JSON(http.StatusOK, transactions)
}

func createStockIn(c *gin.Context) {
	var t Transaction
	c.ShouldBindJSON(&t)
	t.Type = "IN"
	t.Status = "CREATED"
	db.Create(&t)
	c.JSON(http.StatusOK, t)
}

func updateStockInStatus(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Status string `json:"status"`
	}
	c.ShouldBindJSON(&input)

	err := db.Transaction(func(tx *gorm.DB) error {
		var t Transaction
		if err := tx.First(&t, id).Error; err != nil {
			return err
		}
		if t.Status == "DONE" {
			return gorm.ErrInvalidData
		}

		t.Status = input.Status
		tx.Save(&t)

		if input.Status == "DONE" {
			var p Product
			tx.First(&p, "sku = ?", t.SKU)
			prev := p.PhysicalStock
			p.PhysicalStock += t.Quantity
			p.AvailableStock += t.Quantity
			tx.Save(&p)

			tx.Create(&InventoryLog{
				Type:          "IN",
				SKU:           t.SKU,
				Quantity:      t.Quantity,
				PreviousStock: prev,
				NewStock:      p.PhysicalStock,
			})
		}
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func createStockOut(c *gin.Context) {
	var t Transaction
	c.ShouldBindJSON(&t)

	err := db.Transaction(func(tx *gorm.DB) error {
		var p Product
		if err := tx.First(&p, "sku = ?", t.SKU).Error; err != nil {
			return err
		}
		if p.AvailableStock < t.Quantity {
			return gorm.ErrInvalidData
		}

		// Stage 1: Allocation
		p.AvailableStock -= t.Quantity
		tx.Save(&p)

		t.Type = "OUT"
		t.Status = "DRAFT"
		tx.Create(&t)
		return nil
	})

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock or product not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func updateStockOutStatus(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Status string `json:"status"`
	}
	c.ShouldBindJSON(&input)

	err := db.Transaction(func(tx *gorm.DB) error {
		var t Transaction
		if err := tx.First(&t, id).Error; err != nil {
			return err
		}
		if t.Status == "DONE" {
			return gorm.ErrInvalidData
		}

		var p Product
		tx.First(&p, "sku = ?", t.SKU)

		if input.Status == "DONE" {
			// Stage 2: Execution
			prev := p.PhysicalStock
			p.PhysicalStock -= t.Quantity
			tx.Save(&p)

			tx.Create(&InventoryLog{
				Type:          "OUT",
				SKU:           t.SKU,
				Quantity:      t.Quantity,
				PreviousStock: prev,
				NewStock:      p.PhysicalStock,
			})
		} else if input.Status == "CANCELLED" {
			// Rollback allocation
			p.AvailableStock += t.Quantity
			tx.Save(&p)
		}

		t.Status = input.Status
		tx.Save(&t)
		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

func getLogs(c *gin.Context) {
	var logs []InventoryLog
	db.Order("created_at desc").Find(&logs)
	c.JSON(http.StatusOK, logs)
}
