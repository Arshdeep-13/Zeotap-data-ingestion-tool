"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const ConnectPage = () => {
  const [loading, setLoading] = useState(false);

  const handleDbConnection = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const host = formData.get("host") as string;
    const user = formData.get("user") as string;
    const password = formData.get("password") as string;
    const token = formData.get("token") as string;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clickhouse/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ host, user, password, token }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Connected to ClickHouse successfully!");
        console.log("Connected to database successfully!");
      } else {
        toast.error(`${data.message}`);
        console.error("Failed to connect to database:", data.message);
      }
    } catch (error: any) {
      toast.error("❌ Error connecting to ClickHouse");
      console.error("Error connecting to database:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="h-screen pt-16 flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold mb-4">🔗 Connect to ClickHouse</h1>

        <form
          onSubmit={handleDbConnection}
          className="flex flex-col gap-4 border border-white/20 p-6 rounded-lg w-full max-w-md bg-white/5 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="host" className="text-sm">
              Host (e.g., http://localhost:8123)
            </label>
            <input
              className="rounded px-3 py-2 bg-gray-800 text-white"
              type="text"
              name="host"
              id="host"
              required
              placeholder="http://localhost:8123"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="user" className="text-sm">
              Username
            </label>
            <input
              className="rounded px-3 py-2 bg-gray-800 text-white"
              type="text"
              name="user"
              id="user"
              required
              placeholder="default"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm">
              Password
            </label>
            <input
              className="rounded px-3 py-2 bg-gray-800 text-white"
              type="password"
              name="password"
              id="password"
              placeholder="Optional"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="token" className="text-sm">
              JWT Token
            </label>
            <input
              className="rounded px-3 py-2 bg-gray-800 text-white"
              type="text"
              name="token"
              id="token"
              placeholder="Only for cloud usage"
            />
          </div>

          <button
            className={`mt-4 border py-2 px-4 rounded font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-white text-black hover:bg-gray-200"
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
        </form>
      </div>
    </>
  );
};

export default ConnectPage;
