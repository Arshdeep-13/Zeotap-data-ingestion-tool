import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { createClient } from "@clickhouse/client";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

function inferType(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Date";
  if (!isNaN(Number(value))) return value.includes(".") ? "Float64" : "UInt64";
  if (["true", "false"].includes(value.toLowerCase())) return "UInt8"; // boolean
  return "String";
}

function inferSchemaFromSample(rows: any[]): { name: string; type: string }[] {
  const sample = rows[0];
  const columns = Object.keys(sample);
  return columns.map((col) => ({
    name: col,
    type: inferType(sample[col]),
  }));
}

router.post("/", upload.any(), async (req: any, res: any) => {
  const filePath = req.files?.[0]?.path;
  const db = "default";
  const table = req.body?.table || "uploaded_table";

  if (!filePath) {
    return res
      .status(400)
      .json({ success: false, message: "CSV file missing" });
  }

  try {
    const client = createClient({
      url: "http://localhost:8123",
      username: "default",
      password: "default", // or token if using JWT
    });

    // Step 1: Read first 3 rows from CSV
    const sampleRows: any[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row: any) => {
          if (sampleRows.length < 3) sampleRows.push(row);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    if (sampleRows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "CSV file is empty" });
    }

    // Step 2: Infer schema
    const schema = inferSchemaFromSample(sampleRows);

    // Step 3: Create table
    const createQuery = `
      CREATE TABLE IF NOT EXISTS ${db}.${table} (
        ${schema.map((col) => `\`${col.name}\` ${col.type}`).join(",\n")}
      )
      ENGINE = MergeTree()
      ORDER BY ${schema[0].name};
    `;

    await client.command({ query: createQuery });

    // Step 4: Insert full data
    const readStream = fs.createReadStream(filePath);

    await client.insert({
      table: `${db}.${table}`,
      values: readStream,
      format: "CSV",
    });

    fs.unlinkSync(filePath); // Cleanup uploaded file

    res.json({
      success: true,
      message: `CSV imported into '${table}' successfully ✅`,
      columns: schema,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Import failed ❌",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

export default router;
