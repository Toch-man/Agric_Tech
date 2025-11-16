import React from "react";
import {
  FaWallet,
  FaQrcode,
  FaUserCheck,
  FaDownload,
  FaTruckMoving,
} from "react-icons/fa";

const HowToUse = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 md:px-20">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-green-700 mb-3">
          How to Use the Farm-to-Store Traceability App
        </h1>
        <p className="text-gray-600 text-lg">
          Follow these simple steps to connect your wallet, register your role,
          track farm products, and verify authenticity with QR codes.
        </p>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Step 1 - Connect Wallet */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center hover:shadow-xl transition">
          <FaWallet className="text-green-600 w-10 h-10 mb-3" />
          <h2 className="text-xl font-semibold mb-2 text-green-700">
            1. Connect Your Wallet
          </h2>
          <p className="text-gray-600 text-sm text-center">
            Click <span className="font-semibold">“Connect Wallet”</span> to
            link your decentralized ID. This ensures secure authentication and
            traceable transactions.
          </p>
          <a
            href="https://metamask.io/download.html"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center text-sm text-blue-600 hover:underline"
          >
            <FaDownload className="mr-1" /> Download MetaMask
          </a>
        </div>

        {/* Step 2 - Apply for Role */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center hover:shadow-xl transition">
          <FaUserCheck className="text-green-600 w-10 h-10 mb-3" />
          <h2 className="text-xl font-semibold mb-2 text-green-700">
            2. Apply for a Role
          </h2>
          <p className="text-gray-600 text-sm text-center">
            Choose your role — <span className="font-semibold">Farmer</span>,{" "}
            <span className="font-semibold">Transporter</span>, or{" "}
            <span className="font-semibold">Store Manager</span> — and complete
            the registration process.
          </p>
        </div>

        {/* Step 3 - Add or Track Produce */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center hover:shadow-xl transition">
          <FaTruckMoving className="text-green-600 w-10 h-10 mb-3" />
          <h2 className="text-xl font-semibold mb-2 text-green-700">
            3. Add or Track Products
          </h2>
          <p className="text-gray-600 text-sm text-center">
            Farmers upload produce details for delivery. Each batch generates a{" "}
            <span className="font-semibold">unique QR code</span> that tracks
            movement from farm to store.
          </p>
        </div>

        {/* Step 4 - Scan & Verify */}
        <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center hover:shadow-xl transition">
          <FaQrcode className="text-green-600 w-10 h-10 mb-3" />
          <h2 className="text-xl font-semibold mb-2 text-green-700">
            4. Scan & Verify
          </h2>
          <p className="text-gray-600 text-sm text-center">
            Use your camera or scanner to verify the product’s authenticity,
            ensuring transparency and trust between all stakeholders.
          </p>
        </div>
      </div>

      {/* Support Link */}
      <div className="text-center mt-16">
        <p className="text-gray-700 text-sm">
          Need help? Visit our{" "}
          <a
            href="/support"
            className="text-green-700 font-semibold hover:underline"
          >
            Support Page
          </a>{" "}
          for more guidance.
        </p>
      </div>
    </div>
  );
};

export default HowToUse;
