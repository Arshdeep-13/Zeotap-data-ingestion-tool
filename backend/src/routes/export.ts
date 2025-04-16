import express from "express";
import fs from "fs";
import path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { createClient } from "@clickhouse/client";

const router = express.Router();

router.post("/export", async (req: any, res: any) => {
  const { db, table, columns, host, user, password } = req.body;

  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No columns provided" });
  }

  try {
    const client = createClient({
      url: host,
      username: user,
      password,
    });

    const colList = columns.join(", ");
    const query = `SELECT ${colList} FROM ${db}.${table}`;

    const resultSet = await client.query({ query, format: "JSONEachRow" });
    const rows: any = await resultSet.json();

    const filename = `${table}_${Date.now()}.csv`;
    const filePath = path.join("uploads", filename);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: columns.map((col: string) => ({ id: col, title: col })),
    });

    await csvWriter.writeRecords(rows);

    res.json({
      success: true,
      message: "Export successful ✅",
      file: `/exports/${filename}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Export failed ❌",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

export default router;
