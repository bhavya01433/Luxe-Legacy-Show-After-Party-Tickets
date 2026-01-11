
"use client";

import { useState } from "react";

type UserInfoFormProps = {
  onSubmit: (data: { userName: string; whatsappNumber: string; email: string }) => void;
  onCancel?: () => void;
};

export function UserInfoForm({ onSubmit, onCancel }: UserInfoFormProps) {
  const [userName, setUserName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!userName.trim()) {
      newErrors.userName = "Name is required";
    }

    if (!whatsappNumber.trim()) {
      newErrors.whatsappNumber = "WhatsApp number is required";
    } else if (!/^[\d\s\+\-\(\)]+$/.test(whatsappNumber)) {
      newErrors.whatsappNumber = "Invalid phone number format";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        userName: userName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim().toLowerCase(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="userName"
          className="block text-sm font-medium text-neutral-300 mb-1.5"
        >
          Full Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-neutral-50 placeholder-neutral-500 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
          placeholder="Enter your full name"
          required
        />
        {errors.userName && (
          <p className="mt-1 text-xs text-red-400">{errors.userName}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="whatsappNumber"
          className="block text-sm font-medium text-neutral-300 mb-1.5"
        >
          WhatsApp Number <span className="text-red-400">*</span>
        </label>
        <input
          type="tel"
          id="whatsappNumber"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-neutral-50 placeholder-neutral-500 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
          placeholder="+91 9876543210 or 9876543210"
          required
        />
        <p className="mt-1 text-xs text-neutral-400">
          We&apos;ll send your entry QR code to this number
        </p>
        {errors.whatsappNumber && (
          <p className="mt-1 text-xs text-red-400">{errors.whatsappNumber}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-neutral-300 mb-1.5"
        >
          Email Address <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-neutral-50 placeholder-neutral-500 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/20"
          placeholder="your.email@example.com"
          required
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-400">{errors.email}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-neutral-700 bg-neutral-900/50 px-4 py-2.5 text-sm font-medium text-neutral-100 transition hover:border-neutral-500 hover:bg-neutral-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex-1 rounded-full bg-amber-300 px-4 py-2.5 text-sm font-semibold tracking-wide text-neutral-950 shadow-sm transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300/70"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

