const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Path to the SQLite database file
const dbPath = path.resolve(process.cwd(), "taskStatus.db");

// Initialize the SQLite database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create the `task_status` table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS task_status (
    task_id TEXT PRIMARY KEY,
    status TEXT,
    file_path TEXT,
    error TEXT
  )`);
});

// Function to update task status
function updateTaskStatus(taskId, status, filePath = null, error = null) {
  db.run(
    `INSERT OR REPLACE INTO task_status (task_id, status, file_path, error) VALUES (?, ?, ?, ?)`,
    [taskId, status, filePath, error],
    function (err) {
      if (err) {
        console.error("Error updating task status:", err.message);
      } else {
        console.log(`Task ${taskId} status updated to ${status}`);
      }
    }
  );
}

// Function to get task status
async function getTaskStatus(taskId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT status, file_path, error FROM task_status WHERE task_id = ?`,
      [taskId],
      (err, row) => {
        if (err) {
          return reject("Error retrieving task status:", err.message);
        }

        if (!row) {
          return resolve({ status: "not_found", completed: false });
        }

        if (row.status === "completed") {
          return resolve({ completed: true, filePath: row.file_path });
        } else if (row.status === "failed") {
          return resolve({ completed: false, failed: true, error: row.error });
        } else {
          return resolve({ completed: false });
        }
      }
    );
  });
}

module.exports = {
  updateTaskStatus,
  getTaskStatus,
};
