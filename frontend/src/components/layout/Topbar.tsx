"use client";

import type { User } from "@/src/types";
import { mediaUrl } from "@/src/lib/api";

export function Topbar({
  active,
  user,
  online,
  onMenu,
}: {
  active: string;
  user: User | null;
  online: boolean;
  onMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-[var(--line)] bg-white/90 px-4 py-3 backdrop-blur-md md:min-h-[86px] md:flex-row md:items-center md:justify-between md:gap-6 md:px-9 md:py-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg border border-[#dfe6f2] bg-[#f2f5fb] text-slate-600 transition-colors hover:bg-[#e6edf8] hover:text-slate-900 lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/kp-logo.png" alt="KP WWB" className="h-10 w-10 flex-shrink-0 rounded-lg object-contain" />
        <div className="min-w-0">
          <h1 className="m-0 truncate text-xl leading-tight text-[#111827] md:text-[26px]">{active}</h1>
          <p className="m-0 hidden text-sm text-[#95a1b3] sm:block">KP Workers Welfare Board — Labour Colony Management</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 md:flex-nowrap">
        <label className="hidden h-11 flex-1 items-center gap-2 rounded-xl border border-[#dfe6f2] bg-[#f2f5fb] px-3.5 text-[#9aa6b7] md:flex md:w-[260px] md:flex-none xl:w-[320px]">
          <span aria-hidden>⌕</span>
          <input className="w-full border-0 bg-transparent text-[#172033] outline-none" placeholder="Search records..." />
        </label>
        <span
          className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-bold ${
            online ? "bg-[#ecfdf5] text-[#059669]" : "bg-[#fff7ed] text-[#c2410c]"
          }`}
        >
          {online ? "API Live" : "Mock Data"}
        </span>
        <div className="ml-auto flex items-center gap-2.5 border-l border-[var(--line)] pl-3 md:ml-0">
          {user?.profile_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaUrl(user.profile_photo)}
              alt={user.name}
              className="h-[42px] w-[42px] rounded-full object-cover"
            />
          ) : (
            <div className="grid h-[42px] w-[42px] place-items-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 font-extrabold text-white">
              {user?.name?.slice(0, 1) || "A"}
            </div>
          )}
          <div className="leading-tight">
            <strong className="block text-sm text-[#111827]">{user?.name || "Admin User"}</strong>
            <small className="block text-xs capitalize text-[#8a95a8]">{(user?.role || "Super Admin").replace(/_/g, " ")}</small>
          </div>
        </div>
      </div>
    </header>
  );
}
