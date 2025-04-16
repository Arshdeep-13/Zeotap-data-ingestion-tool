import express from "express";
import { createClient } from "@clickhouse/client";

const router = express.Router();
let client: any;

router.post("/connect", async (req: any, res: any) => {
  const { host, user, password, token } = req.body;

  try {
    client = createClient({
      url: host ?? "http://localhost:8123",
      username: user ?? "default",
      password: password || token,
    });

    await client.ping(); // confirms connection
    return res
      .status(200)
      .json({ success: true, message: "Connection successful" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Connection failed",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

router.post("/tables", async (req, res) => {
  const { host, user, password, db } = req.body;

  try {
    const result = await client.query({
      query: `SHOW TABLES FROM ${db}`,
      format: "JSONEachRow",
    });
    const rows = await result.json();
    const tables = rows.map((row: any) => Object.values(row)[0]); // get table names

    res.json({ success: true, tables });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tables ❌",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

router.post("/columns", async (req, res) => {
  const { host, user, password, db, table } = req.body;

  try {
    const result = await client.query({
      query: `DESCRIBE TABLE ${db}.${table}`,
      format: "JSONEachRow",
    });

    const rows = await result.json();
    const columns = rows.map((row: any) => row.name); // Get column names from the describe output

    res.json({ success: true, columns });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch columns ❌",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

router.post("/get-all-data", async (req, res) => {
  const { db, table } = req.body;

  try {
    const result = await client.query({
      query: `SELECT * FROM ${db}.${table}`,
      format: "JSONEachRow",
    });

    const rows = await result.json();

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch data ❌",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

router.post("/query", async (req, res) => {
  const { db, query } = req.body;

  try {
    const result = await client.query({
      query: `${query}`,
      format: "JSONEachRow",
      database: db,
    });

    const rows = await result.json();

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch data ❌",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

export default router;
