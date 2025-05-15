import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils"; // Keep if you're using Tailwind utility merging

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/logs`);
        if (!response.ok) throw new Error("Failed to fetch logs");
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "delete":
        return "delete";
      case "addition":
        return "add";
      case "edit":
        return "edit";
      case "invoice":
        return "receipt_long";
      default:
        return "info";
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">Activity Logs</h1>
      <hr className="my-4 border-t-2 border-gray-300" />
      {loading ? (
        <div className="text-center text-gray-500">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center text-gray-500">No logs available</div>
      ) : (
        logs.map((log) => {
          const dateObj = new Date(log.timestamp);
          const dateStr = dateObj.toLocaleDateString();
          const timeStr = dateObj.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          // Convert "archiving" to "delete" for display and styling
          const logType = log.type === "archiving" ? "delete" : log.type;

          return (
            <div
              key={log.id}
              className={cn(
                "grid grid-cols-3 gap-4 items-center p-4 rounded-lg shadow-sm",
                logType === "delete" && "bg-red-100",
                logType === "addition" && "bg-green-100",
                logType === "edit" && "bg-white",
                logType === "invoice" && "bg-blue-100"
              )}
            >
              {/* Date + Time */}
              <div className="text-sm text-gray-600">
                <div className="font-medium">{dateStr}</div>
                <div>{timeStr}</div>
              </div>

              {/* Type with Icon */}
             <div className="text-sm font-semibold text-gray-700 capitalize">
                {log.type === "archiving" ? "delete" : log.type}
             </div>


              {/* Message */}
              <div className="text-gray-800 text-sm">{log.message}</div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default ActivityLogs;
