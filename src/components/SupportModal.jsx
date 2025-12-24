import React, { useState } from "react";

const SupportModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!email || !amount) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const handler = window.PaystackPop ? window.PaystackPop.setup({
        key: "pk_live_07602661afab53b21553b997e4cd7f566e772113",
        email,
        amount: amount * 100, 
        currency: "KES",
        callback: function (response) {
          alert("Payment completed. Reference: " + response.reference);
          onClose();
        },
        onClose: function () {
          alert("Payment window closed.");
        },
      }) : null;

      if (handler) handler.openIframe();
    } catch (err) {
      console.error(err);
      alert("Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#0A0A0C] p-6 rounded-lg w-full max-w-md z-10">
        <h3 className="text-xl font-semibold mb-3">Support DevNook</h3>

        <label className="block mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 rounded border"
          placeholder="Enter your email"
        />

        <label className="block mb-2">Amount (KES)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full mb-3 p-2 rounded border"
          placeholder="Enter amount"
        />

        <button
          onClick={handlePayment}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Processing..." : "Support"}
        </button>
      </div>
    </div>
  );
};

export default SupportModal;