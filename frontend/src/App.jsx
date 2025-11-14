import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/land/waterCondition";

function LandTable() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  const fetchLands = async () => {
    try {
      const response = await axios.get(API_URL);
      setLands(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching lands:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
    const interval = setInterval(fetchLands, 5000);
    return () => clearInterval(interval);
  }, []);

  // Copy row data URL
  const copyToClipboard = async (landId) => {
    const url = `${API_URL}/${landId}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("Land URL copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Submit handler (for testing or manual updates)
  const handleSubmit = (land) => {
    alert(`Submitted Land ID: ${land.landId} with status ${land.status}`);
  };

  // Loading UI
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-green-50">
        <p className="text-lg text-gray-600 animate-pulse">Loading data...</p>
      </div>
    );

  // Main UI
  return (
    
    <div className="min-h-screen bg-green-50 flex flex-col items-center  py-10 px-4">
      <h2 className="text-3xl font-bold text-green-700 mb-6">
        🌱 Land Moisture Monitor
      </h2>

      <div className="overflow-x-auto w-full max-w-5xl bg-white shadow-xl rounded-xl p-6">
        <table className="min-w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="py-3 px-4 border-b text-center">Land ID</th>
              <th className="py-3 px-4 border-b text-center">
                Water Condition (Value)
              </th>
              <th className="py-3 px-4 border-b text-center">Status</th>
              <th className="py-3 px-4 border-b text-center">Last Updated</th>
           
            </tr>
          </thead>

          <tbody>
            {lands.length > 0 ? (
              lands.map((land) => (
                <tr
                  key={land.id}
                  className="hover:bg-green-50 transition border-b"
                >
                  <td className="py-2 px-4 text-center font-semibold">
                    {land.landId}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {land.waterCondition}
                  </td>
                  <td
                    className={`py-2 px-4 text-center font-semibold ${
                      land.status === "DRY"
                        ? "text-red-500"
                        : land.status === "HUMID"
                        ? "text-yellow-500"
                        : land.status === "WATER"
                        ? "text-blue-500"
                        : "text-gray-500"
                    }`}
                  >
                    {land.status}
                  </td>
                  <td className="py-2 px-4 text-center text-gray-600">
                    {new Date(
                      land.updatedAt || land.createdAt
                    ).toLocaleString()}
                  </td>
            
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-6 text-gray-500 italic"
                >
                  No data available yet...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LandTable;
