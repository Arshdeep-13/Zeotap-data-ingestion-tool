import React from "react";
import {
  FaFileCsv,
  FaDatabase,
  FaLock,
  FaRocket,
  FaExchangeAlt,
  FaTable,
} from "react-icons/fa";

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <FaFileCsv size={24} />,
      title: "CSV to ClickHouse",
      description:
        "Upload flat files and dynamically ingest them into a new or existing ClickHouse table with schema auto-detection.",
    },
    {
      icon: <FaDatabase size={24} />,
      title: "Run Queries",
      description:
        "Execute any SQL query directly from the frontend and view live results in table or JSON format.",
    },
    {
      icon: <FaTable size={24} />,
      title: "Data Preview",
      description: "View table structure and select rows before exporting.",
    },
    {
      icon: <FaExchangeAlt size={24} />,
      title: "Export to CSV",
      description:
        "Easily export any query result or selected rows as downloadable CSV files.",
    },
    {
      icon: <FaLock size={24} />,
      title: "JWT Auth Support",
      description:
        "Secure connection to ClickHouse Cloud using token-based JWT authentication and user inputs.",
    },
    {
      icon: <FaRocket size={24} />,
      title: "Fast & Clean UI",
      description:
        "Powered by React + Tailwind + HeroUI. Optimized for speed, clarity, and mobile responsiveness.",
    },
  ];

  return (
    <section className="h-[110vh] pt-24 px-8 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 flex flex-col gap-4">
        ⚙️ Key Features
        <span className="w-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 px-6 py-4 text-sm md:text-base text-center">
          ⚠️ Before using ClickHouse features like querying, importing, or
          exporting — please connect to your ClickHouse database first.
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 hover:scale-105 transform transition"
          >
            <div className="text-blue-600 mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
