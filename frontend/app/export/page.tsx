"use client";

import { useState, useEffect, useMemo } from "react";
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
import toast from "react-hot-toast";
import type { Key } from "@react-types/shared";
import type { Selection } from "@nextui-org/react";

const Page: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [toggler, setToggler] = useState<boolean>(false);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState<{ key: string; label: string }[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set<Key>());
  const [page, setPage] = useState<number>(1);
  const rowsPerPage = 5;

  const pages = Math.ceil(rows.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return rows.slice(start, end);
  }, [page, rows]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clickhouse/tables`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              db: "default",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result?.tables);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error("❌ Error connecting to ClickHouse: " + error.message);
        } else {
          toast.error("❌ Unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTableClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      setToggler(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clickhouse/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            db: "default",
            query: `SELECT * FROM ${(e.target as HTMLButtonElement).innerText}`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      // setTableData(result?.data);

      setColumns(
        Object.keys(result?.data[0]).map((key) => ({
          key: key,
          label: key,
        }))
      );
      setRows(
        result?.data.map((item: unknown, idx: number) =>
          typeof item === "object" && item !== null
            ? { key: idx, ...item }
            : { key: idx }
        )
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unknow message");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    console.log(selectedKeys);

    let columnArr: string[];
    const selectedArray = Array.from(selectedKeys as Set<unknown>);

    if (selectedArray.length > 0) {
      columnArr = columns.map(
        (col: { key: string; label: string }) => col.label
      );
    } else {
      columnArr = columns.map(
        (col: { key: string; label: string }) => col.label
      );
    }

    const csvHeader = columnArr.join(",") + "\n";

    let csvRows: unknown;

    if (selectedArray.length > 0) {
      console.log(rows[0], rows[1], selectedArray);
      csvRows = rows
        .filter((row: { key: string }) =>
          selectedArray.includes(row.key.toString())
        )
        .map((row: unknown) =>
          columns
            .map((col: { key: string; label: string }) =>
              JSON.stringify((row as Record<string, unknown>)[col.label] ?? "")
            )
            .join(",")
        )
        .join("\n");
    } else {
      csvRows = rows
        .map((row: unknown) =>
          columns
            .map((col: { key: string; label: string }) =>
              JSON.stringify((row as Record<string, unknown>)[col.label] ?? "")
            )
            .join(",")
        )
        .join("\n");
    }

    const csvContent = csvHeader + csvRows;

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
    <div className={`flex flex-col items-center justify-center h-screen`}>
      {error && toast("Error fetching data: " + error)}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="w-2/3">
            {toggler && (
              <>
                <button
                  onClick={() => {
                    setToggler(false);
                  }}
                  className="p-2 mb-4 text-white bg-gray-500 rounded hover:bg-gray-700 cursor-pointer"
                >
                  🔙 Back to Table List
                </button>
                <button
                  className="p-2 border rounded cursor-pointer absolute top-20 right-5"
                  onClick={handleExportData}
                >
                  ⬇️ Export Selected as CSV
                </button>
              </>
            )}
          </div>
          {!toggler && (
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold mb-4">📋 Available Tables</h1>
              <p className="text-gray-400 mb-6">
                Click on a table to view its data.
              </p>
            </div>
          )}
          {toggler ? (
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
                  wrapper: "min-h-[222px]",
                }}
                className="h-32 top-24"
                selectedKeys={selectedKeys}
                selectionMode="multiple"
                onSelectionChange={setSelectedKeys}
                color="primary"
                bottomContent={
                  <div className="flex w-full justify-center">
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
                  </div>
                }
              >
                <TableHeader columns={columns}>
                  {(column: { key: string; label: string }) => (
                    <TableColumn key={column.key}>{column.label}</TableColumn>
                  )}
                </TableHeader>
                <TableBody items={items}>
                  {(item: { key: string | number; [key: string]: unknown }) => (
                    <TableRow key={item.key}>
                      {(columnKey) => (
                        <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 ml-4">
              {data && data.length > 0 ? (
                data?.map((item: unknown, idx: number) => (
                  <button
                    className="p-2 border cursor-pointer rounded"
                    onClick={handleTableClick}
                    key={idx}
                  >
                    {String(item)}
                  </button>
                ))
              ) : (
                <div>No data available</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Page;
