"use client";

import { useEffect, useRef, useState } from "react";

export function SearchSelect({
  options,
  placeholder,
  selectedLabel,
  onSearch,
  onSelect,
  disabled,
}: {
  options: { value: string; label: string }[];
  placeholder: string;
  /** Current external search value (kept for API compatibility; menu filtering is internal). */
  searchValue?: string;
  selectedLabel?: string;
  onSearch: (value: string) => void;
  onSelect: (option: { value: string; label: string }) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const selectRef = useRef<HTMLDivElement | null>(null);
  const visibleOptions = options.filter((option) => option.label.toLowerCase().includes(menuSearch.toLowerCase())).slice(0, 20);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!selectRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div className="search-select" ref={selectRef}>
      <button
        type="button"
        className="search-select-trigger"
        onClick={() => {
          setOpen((value) => !value);
          setMenuSearch("");
          onSearch("");
        }}
        disabled={disabled}
      >
        <span>{selectedLabel || placeholder}</span>
        <b>⌄</b>
      </button>
      {open && !disabled ? (
        <div className="search-select-menu">
          <input value={menuSearch} onChange={(event) => setMenuSearch(event.target.value)} placeholder="Search..." autoFocus />
          {visibleOptions.length ? (
            visibleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSearch(option.label);
                  onSelect(option);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            ))
          ) : (
            <span>No matching records</span>
          )}
        </div>
      ) : null}
    </div>
  );
}
