"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const csv_writer_1 = require("csv-writer");
const client_1 = require("@clickhouse/client");
const router = express_1.default.Router();
router.post("/export", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { db, table, columns, host, user, password } = req.body;
    if (!columns || !Array.isArray(columns) || columns.length === 0) {
        return res
            .status(400)
            .json({ success: false, message: "No columns provided" });
    }
    try {
        const client = (0, client_1.createClient)({
            url: host,
            username: user,
            password,
        });
        const colList = columns.join(", ");
        const query = `SELECT ${colList} FROM ${db}.${table}`;
        const resultSet = yield client.query({ query, format: "JSONEachRow" });
        const rows = yield resultSet.json();
        const filename = `${table}_${Date.now()}.csv`;
        const filePath = path_1.default.join("uploads", filename);
        const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
            path: filePath,
            header: columns.map((col) => ({ id: col, title: col })),
        });
        yield csvWriter.writeRecords(rows);
        res.json({
            success: true,
            message: "Export successful ✅",
            file: `/exports/${filename}`,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Export failed ❌",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}));
exports.default = router;
