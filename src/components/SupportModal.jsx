// import React, { useState } from "react";
// import axios from "axios";

// export default function SupportModal({ onClose }) {
//   const [email, setEmail] = useState("");
//   const [amount, setAmount] = useState(5); // default 5 KES (or change to USD)
//   const [loading, setLoading] = useState(false);
//   const PAYSTACK_PUBLIC_KEY = "pk_test_847613fcff931bd667f8ec6c39562b2a6a66c575";

//   const startPayment = async () => {
//     if (!email || amount <= 0) return alert("Please enter email and amount");

//     setLoading(true);
//     try {
//       const resp = await axios.post("/api/payments/initiate/", {
//         email,
//         amount,
//         currency: "KES",  // or "USD" if you want
//       });

//       // Removed unused variable 'paystack'
//       // open Paystack inline
//       const handler = window.PaystackPop ? window.PaystackPop.setup({
//         key: PAYSTACK_PUBLIC_KEY,
//         email,
//         amount: Math.round(amount * 100), // amount in smallest currency unit
//         currency: "KES",
//         ref: resp.data.reference,
//         onClose: function(){
//           // user closed the modal
//         },
//         callback: function(response){
//           // response.reference is the paystack reference. You should verify on backend if needed
//           alert("Payment completed. Reference: " + response.reference);
//           onClose();
//         }
//       }) : null;

//       if (handler) handler.openIframe();

//     } catch (err) {
//       console.error(err);
//       alert("Failed to initialize payment");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/40" onClick={onClose} />
//       <div className="relative bg-white dark:bg-[#0A0A0C] p-6 rounded-lg w-full max-w-md z-10">
//         <h3 className="text-xl font-semibold mb-3">Support Knowledge Hub</h3>

//         <label className="block mb-2">Email</label>
//         <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full mb-3 p-2 rounded border" />

//         <label className="block mb-2">Amount (KES)</label>
//         <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} className="w-full mb-4 p-2 rounded border" />

//         <div className="flex justify-end gap-2">
//           <button onClick={onClose} className="px-4 py-2">Cancel</button>
//           <button onClick={startPayment} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
//             {loading ? "Processing..." : "Pay"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
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
        <h3 className="text-xl font-semibold mb-3">Support Knowledge Hub</h3>

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
          {loading ? "Processing..." : "Donate"}
        </button>
      </div>
    </div>
  );
};

export default SupportModal;