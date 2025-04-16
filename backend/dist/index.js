"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const clickhouse_1 = __importDefault(require("./routes/clickhouse"));
const upload_1 = __importDefault(require("./routes/upload"));
const export_1 = __importDefault(require("./routes/export"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("Zeotap Ingestion Tool Backend is up and running");
});
app.use("/api/clickhouse", clickhouse_1.default);
app.use("/api/upload", upload_1.default);
app.use("/api/upload", export_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
