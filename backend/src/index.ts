import express from "express";
import cors from "cors";
import clickhouseRouter from "./routes/clickhouse";
import clickhouseUploadRouter from "./routes/upload";
import clickhouseExportRouter from "./routes/export";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Zeotap Ingestion Tool Backend is up and running");
});
app.use("/api/clickhouse", clickhouseRouter);
app.use("/api/upload", clickhouseUploadRouter);
app.use("/api/upload", clickhouseExportRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
