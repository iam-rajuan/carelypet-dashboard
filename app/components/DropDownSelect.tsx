"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownSelectProps {
  label: string;
  options: string[];
  onChange?: (value: string) => void;
}

export default function DropdownSelect({
  label,
  options,
  onChange,
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(label);

  const handleSelect = (value: string) => {
    setSelected(value);
    setOpen(false);
    onChange?.(value);
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between min-w-[110px] px-4 py-2 bg-[#D6F2F8] text-gray-700 rounded-lg text-sm hover:bg-[#c9edf5] transition"
      >
        <span>{selected}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-md z-30">
          {options.map((item) => (
            <button
              key={item}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
