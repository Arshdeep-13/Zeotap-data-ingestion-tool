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
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const client_1 = require("@clickhouse/client");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: "uploads/" });
function inferType(value) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value))
        return "Date";
    if (!isNaN(Number(value)))
        return value.includes(".") ? "Float64" : "UInt64";
    if (["true", "false"].includes(value.toLowerCase()))
        return "UInt8"; // boolean
    return "String";
}
function inferSchemaFromSample(rows) {
    const sample = rows[0];
    const columns = Object.keys(sample);
    return columns.map((col) => ({
        name: col,
        type: inferType(sample[col]),
    }));
}
router.post("/", upload.any(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const filePath = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path;
    const db = "default";
    const table = ((_c = req.body) === null || _c === void 0 ? void 0 : _c.table) || "uploaded_table";
    if (!filePath) {
        return res
            .status(400)
            .json({ success: false, message: "CSV file missing" });
    }
    try {
        const client = (0, client_1.createClient)({
            url: "http://localhost:8123",
            username: "default",
            password: "default", // or token if using JWT
        });
        // Step 1: Read first 3 rows from CSV
        const sampleRows = [];
        yield new Promise((resolve, reject) => {
            fs_1.default.createReadStream(filePath)
                .pipe((0, csv_parser_1.default)())
                .on("data", (row) => {
                if (sampleRows.length < 3)
                    sampleRows.push(row);
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
        yield client.command({ query: createQuery });
        // Step 4: Insert full data
        const readStream = fs_1.default.createReadStream(filePath);
        yield client.insert({
            table: `${db}.${table}`,
            values: readStream,
            format: "CSV",
        });
        fs_1.default.unlinkSync(filePath); // Cleanup uploaded file
        res.json({
            success: true,
            message: `CSV imported into '${table}' successfully ✅`,
            columns: schema,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Import failed ❌",
            error: err instanceof Error ? err.message : "Unknown error",
        });
    }
}));
exports.default = router;
