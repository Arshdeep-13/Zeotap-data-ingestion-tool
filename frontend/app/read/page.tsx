"use client";

import { useEffect, useMemo, useState } from "react";
import Loading from "../components/Loading";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  getKeyValue,
  Pagination,
} from "@heroui/react";

const QueryExecutorPage = () => {
  const [databases, setDatabases] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [queryData, setQueryData] = useState([]);
  const [curDatabase, setCurDatabase] = useState("");
  const [tableView, setTableView] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<any>(new Set([]));
  const [columns, setColumns] = useState<any>([]);
  const [rows, setRows] = useState<any>([]);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const pages = Math.ceil(rows.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return rows.slice(start, end);
  }, [page, rows]);

  useEffect(() => {
    async function getDatabases() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clickhouse/query`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ db: "default", query: `SHOW DATABASES` }),
          }
        );

        const result = await response.json();
        setDatabases(result?.data || []);
      } catch (error: any) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    getDatabases();
  }, []);

  async function getQueryData() {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clickhouse/query`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ db: curDatabase, query }),
        }
      );

      const result = await response.json();
      setQueryData(result?.data || []);

      if (/select/i.test(query)) {
        setTableView(true);
        setColumns(
          Object.keys(result?.data[0] || {}).map((key) => ({ key, label: key }))
        );
        setRows(
          result?.data.map((item: any, idx: number) => ({ key: idx, ...item }))
        );
      } else {
        setTableView(false);
      }
    } catch (error: any) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const handleExportData = () => {
    const selectedArray = Array.from(selectedKeys);
    const columnArr = columns.map((col: any) => col.label);
    const csvHeader = columnArr.join(",") + "\n";

    const csvRows = (
      selectedArray.length > 0
        ? rows.filter((row: any) => selectedArray.includes(row.key.toString()))
        : rows
    ).map((row: any) =>
      columnArr.map((col: any) => JSON.stringify(row[col] ?? "")).join(",")
    );

    const csvContent = csvHeader + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const fileName = prompt("Enter file name", "query_results.csv");
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName || "query_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {loading && <Loading />}
      <div className="h-[150vh] px-6 pt-28 text-white flex flex-col gap-6 items-center bg-[#111]">
        <h1 className="text-2xl font-semibold">
          📊 Run SQL Queries on ClickHouse
        </h1>

        <div className="flex flex-wrap justify-center items-center gap-4 w-full max-w-4xl">
          <div className="flex flex-col gap-1">
            <label className="text-sm">Choose Database</label>
            <select
              className="p-2 border rounded w-64 placeholder:text-gray-400"
              value={curDatabase}
              onChange={(e) => setCurDatabase(e.target.value)}
            >
              <option className="placeholder:text-gray-400 bg-black" value="">
                Select DB
              </option>
              {databases.map((val: any, idx) => (
                <option
                  className="bg-black placeholder:text-gray-400"
                  value={val.name}
                  key={idx}
                >
                  {val.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full max-w-xl">
            <label className="text-sm">Write Query</label>
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="p-2 border rounded text-white w-full placeholder:text-gray-400"
                type="text"
                placeholder="e.g. SELECT * FROM your_table"
              />
              <button
                onClick={getQueryData}
                className="p-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Execute
              </button>
            </div>
          </div>
        </div>

        {queryData.length > 0 && tableView && (
          <button
            onClick={handleExportData}
            className="p-2 px-4 border rounded hover:bg-white hover:text-black absolute right-5 top-20"
          >
            ⬇️ Export as CSV
          </button>
        )}

        <div className="w-full flex justify-center">
          {tableView ? (
            <div className="flex flex-col w-2/3 justify-center items-center">
              <style>
                {`tr[data-selected="true"] {
                    background-color: #222225;
                  }

                  tr:hover {
                    background-color: #222225;
                  }

                  input[type="checkbox"] {
                    cursor: pointer;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                  }`}
              </style>
              <Table
                aria-label="Example table with dynamic content"
                classNames={{
                  tr: "text-center cursor-pointer !p-0",
                  th: "bg-gray-700 !p-0",
                  td: "!p-0",
                  // wrapper: "min-h-[222px]",
                }}
                className="top-24"
                selectedKeys={selectedKeys}
                selectionMode="multiple"
                onSelectionChange={setSelectedKeys}
                color="primary"
                bottomContent={
                  <Pagination
                    classNames={{
                      wrapper: "flex items-center gap-2 justify-center",
                      next: "text-sm text-gray-500 hover:text-gray-700 border p-2 rounded",
                      prev: "text-sm text-gray-500 hover:text-gray-700 border p-2 rounded",
                      item: "text-sm text-gray-500 hover:text-gray-700 border p-2 rounded",
                      cursor:
                        "text-sm text-gray-500 text-gray-200 border p-2 rounded",
                      chevronNext: "rotate-180",
                    }}
                    isCompact
                    showControls
                    showShadow
                    color="secondary"
                    page={page}
                    total={pages}
                    onChange={(page) => setPage(page)}
                  />
                }
              >
                <TableHeader columns={columns}>
                  {(column: any) => (
                    <TableColumn key={column.key}>{column.label}</TableColumn>
                  )}
                </TableHeader>
                <TableBody items={items}>
                  {(item: any) => (
                    <TableRow key={item.key}>
                      {(columnKey) => (
                        <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : queryData.length > 0 ? (
            <div className="max-w-5xl bg-gray-900 p-4 rounded shadow">
              <pre className="text-sm text-gray-200 whitespace-pre-wrap break-words overflow-auto">
                {JSON.stringify(queryData, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>

        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </>
  );
};

export default QueryExecutorPage;
