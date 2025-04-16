# 📊 ClickHouse Data Ingestion & Querying Tool

This is a full-stack data ingestion and exploration tool built with **ClickHouse**, **Next.js**, and **Node.js (Express)**. The project allows users to:

- 🔗 Connect to a ClickHouse DB
- 📤 Upload CSV files
- 🧠 Dynamically create tables and ingest data
- 🔍 Query and visualize data using a custom SQL interface
- 📦 Export query results

---

## 📁 Folder Structure

- /frontend → Next.js frontend using Tailwind + HeroUI
- /backend → Node.js (Express) backend using ClickHouse JS client

---

## 🛠️ Tech Stack

| Layer    | Tools Used                                                                   |
| -------- | ---------------------------------------------------------------------------- |
| Frontend | Next.js, Tailwind CSS, HeroUI, React Hot Toast                               |
| Backend  | Node.js, Express.js, @clickhouse/client, Multer, csv-parser, cors csv-writer |
| Database | ClickHouse (local or remote instance)                                        |

---

## 🚀 Features

- ✅ ClickHouse DB connection via UI
- ✅ CSV file upload with schema inference
- ✅ Dynamic table creation based on file
- ✅ SQL query execution with JSON/table toggle
- ✅ Query result export to CSV
- ✅ Multi-row selection, pagination, filtering

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, TailwindCSS, HeroUI, React Hot Toast
- **Backend:** Express.js, @clickhouse/client, Multer, csv-parser
- **Database:** ClickHouse (Local or Cloud)

---

## ⚙️ Setup Instructions

### 🔧 Prerequisites

- Node.js (v16+)
- ClickHouse (local or cloud)
- Git

---

### 🖥️ Clone the Repository

```bash
git clone https://github.com/yourusername/zeotap-clickhouse-tool.git
cd zeotap-clickhouse-tool
```

### Spin up the docker containers

- docker configuration file is already setup

```bash
cd backend/clickhouse-docker
docker compose up -d
```

- 🔧 Start ClickHouse on localhost:8123

### ▶️ Run Backend

```bash
cd backend
npm install
npm run start
```

- Server will start on: http://localhost:8000

### 💻 Run Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend will run on: http://localhost:3000

### 🔐 ClickHouse DB Credentials

- Before using the features, connect your ClickHouse instance from the UI using:

- Host (e.g. http://localhost:8123)

- Username

- Password or Token

- ⚠️ The connection is required to use other features.

### 📤 CSV Upload Notes

- Files must be .csv

- Tables will be auto-created if not present

- Data will be appended if table exists

- Column types are inferred (Int, Float, Date, Bool, String)

### 🔎 Query Interface

- Choose a database

- Enter any valid SQL query (e.g. SELECT \* FROM my_table)

- Supports:

- Table rendering for SELECT queries

- JSON display for others

- Export results using the CSV button

## 📬 Contact

Built with ❤️ by **Arshdeep Rooprai**  
📧 **Email:** [arshdeeprooprai@gmail.com](mailto:arshdeeprooprai@gmail.com)  
🔗 **GitHub:** [github.com/arshdeeprooprai](https://github.com/arshdeeprooprai)  
💼 **LinkedIn:** [linkedin.com/in/arshdeep-rooprai](https://linkedin.com/in/arshdeep-rooprai)
