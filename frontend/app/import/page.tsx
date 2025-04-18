"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "universal-cookie";
import Loading from "../components/Loading";

const UploadPage: React.FC = () => {
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const cookie = new Cookies();

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const files = event.dataTransfer.files;
    if (files.length) uploadFile(files[0]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files ? event.target.files[0] : null;
    if (file) uploadFile(file);
  };

  const uploadFile = (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("table", "default");

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cookie.get("token")}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success(data.message || "✅ File uploaded successfully!");
        } else {
          toast.error(data.message || "❌ Upload failed.");
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error("❌ Error uploading file.");
        }
      })
      .finally(() => setLoading(false));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="flex flex-col justify-center items-center gap-6 pt-8 h-screen px-4">
      <Toaster position="top-center" />
      {loading && <Loading />}
      <h2 className="text-2xl font-bold text-center dark:text-white">
        📤 Upload a CSV File to ClickHouse
      </h2>

      <span className="w-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 px-6 py-4 text-sm md:text-base text-center">
        ⚠️ Please ensure you&#39;re connected to ClickHouse before uploading. We
        will auto-create the table if it doesn&#39;t exist or append data to it
        if it does.
      </span>

      <form onSubmit={(e) => e.preventDefault()} encType="multipart/form-data">
        <div
          className={`flex items-center justify-center w-screen ${
            dragOver ? "border-blue-500 bg-gray-100" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                CSV files only
              </p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              name="avatar"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </form>
    </div>
  );
};

export default UploadPage;
