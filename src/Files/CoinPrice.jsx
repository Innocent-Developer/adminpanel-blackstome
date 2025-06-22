import React, { useEffect, useState } from "react";

const SetCoinPrice = () => {
  const [goldCoin, setGoldCoin] = useState("");
  const [diamondCoin, setDiamondCoin] = useState("");
  const [loading, setLoading] = useState(false);
  const [oldPrices, setOldPrices] = useState(null);

  const fetchOldPrices = async () => {
    try {
      const res = await fetch("https://www.blackstonevoicechatroom.online/get/coin-price");
      const data = await res.json();
      if (res.ok && data.coinPrice) {
        setOldPrices(data.coinPrice);
      }
    } catch (err) {
      console.error("Error fetching old prices:", err);
    }
  };

  const handleSubmit = async () => {
    if (!goldCoin || !diamondCoin) {
      alert("Please enter both coin prices.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://www.blackstonevoicechatroom.online/admin/update/coin-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goldCoin, diamondCoin }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Coin prices updated successfully.");
        setGoldCoin("");
        setDiamondCoin("");
        fetchOldPrices(); // refresh displayed old prices
      } else {
        alert(result.message || "Failed to update coin prices.");
      }
    } catch (error) {
      console.error("Error updating coin prices:", error);
      alert("Server error while updating coin prices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOldPrices();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-4">
      <div className="bg-[#1f1f1f] p-6 rounded-lg w-full max-w-md border border-gray-700">
        <h1 className="text-2xl font-semibold mb-4 text-center">Set Coin Prices</h1>

        {oldPrices && (
          <div className="mb-6 text-sm text-gray-300 bg-[#2a2a2a] p-3 rounded">
            <p>
              <strong>Current Gold Coin:</strong> {oldPrices.goldCoin}
            </p>
            <p>
              <strong>Current Diamond Coin:</strong> {oldPrices.diamondCoin}
            </p>
            <p>
              <strong>Last Updated:</strong>{" "}
              {new Date(oldPrices.lastUpdated).toLocaleString()}
            </p>
          </div>
        )}

        <label className="block mb-2 text-sm font-medium">Gold Coin Price</label>
        <input
          type="number"
          value={goldCoin}
          onChange={(e) => setGoldCoin(e.target.value)}
          placeholder="Enter gold coin price"
          className="w-full p-2 mb-4 bg-[#121212] border border-gray-700 rounded text-white"
        />

        <label className="block mb-2 text-sm font-medium">Diamond Coin Price</label>
        <input
          type="number"
          value={diamondCoin}
          onChange={(e) => setDiamondCoin(e.target.value)}
          placeholder="Enter diamond coin price"
          className="w-full p-2 mb-6 bg-[#121212] border border-gray-700 rounded text-white"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded flex items-center justify-center"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          ) : (
            "Update Prices"
          )}
        </button>
      </div>
    </div>
  );
};

export default SetCoinPrice;
