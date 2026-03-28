# AI Usage Report (AI_NOTES.md)

## AI Tools Used
- **Model**: Google Gemini 3.1 Pro (via AI Studio Build)
- **Environment**: Antigravity Coding Harness

## Most Complex Prompt
"Implement a Two-Phase Commitment logic for Stock Out transactions in a Golang app using Gin and GORM with SQLite. Stage 1 (Allocation) must check if available stock is sufficient and reserve it by decrementing `availableStock` in a database transaction. Stage 2 (Execution) must finalize the change by decrementing `physicalStock` only when status becomes DONE. If cancelled during IN_PROGRESS, it must rollback the allocation to `availableStock`."

## Manual Best Practice Modification
1. **Database Transactions**: I implemented the stock allocation logic using `db.Transaction(func(tx *gorm.DB) error { ... })` in Go. This ensures that the check for available stock and the decrement operation happen atomically, preventing race conditions where two concurrent requests might allocate the same stock.
2. **Architecture**: I provided a dual implementation. The **Node.js/SQLite** version runs in the live preview for immediate interaction, while the **Golang/SQLite** version is provided in the `/backend-go` folder as the primary deliverable for the technical assessment.
3. **SOLID Principles**: The Go code is structured with clear separation between Models, Handlers, and Database initialization, making it easy to maintain and test.
