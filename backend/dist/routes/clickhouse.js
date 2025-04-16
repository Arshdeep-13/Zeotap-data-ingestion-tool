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
const client_1 = require("@clickhouse/client");
const router = express_1.default.Router();
let client;
router.post("/connect", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { host, user, password, token } = req.body;
    try {
        client = (0, client_1.createClient)({
            url: host !== null && host !== void 0 ? host : "http://localhost:8123",
            username: user !== null && user !== void 0 ? user : "default",
            password: password || token,
        });
        yield client.ping(); // confirms connection
        return res
            .status(200)
            .json({ success: true, message: "Connection successful" });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Connection failed",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}));
router.post("/tables", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { host, user, password, db } = req.body;
    try {
        const result = yield client.query({
            query: `SHOW TABLES FROM ${db}`,
            format: "JSONEachRow",
        });
        const rows = yield result.json();
        const tables = rows.map((row) => Object.values(row)[0]); // get table names
        res.json({ success: true, tables });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch tables ❌",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}));
router.post("/columns", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { host, user, password, db, table } = req.body;
    try {
        const result = yield client.query({
            query: `DESCRIBE TABLE ${db}.${table}`,
            format: "JSONEachRow",
        });
        const rows = yield result.json();
        const columns = rows.map((row) => row.name); // Get column names from the describe output
        res.json({ success: true, columns });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch columns ❌",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}));
router.post("/get-all-data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { db, table } = req.body;
    try {
        const result = yield client.query({
            query: `SELECT * FROM ${db}.${table}`,
            format: "JSONEachRow",
        });
        const rows = yield result.json();
        res.json({ success: true, data: rows });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch data ❌",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}));
router.post("/query", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { db, query } = req.body;
    try {
        const result = yield client.query({
            query: `${query}`,
            format: "JSONEachRow",
            database: db,
        });
        const rows = yield result.json();
        res.json({ success: true, data: rows });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch data ❌",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}));
exports.default = router;
