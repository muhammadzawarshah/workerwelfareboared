"use client";

import { navGroupsForRole, type NavKey } from "@/src/config/navigation";

export function Sidebar({
  active,
  setActive,
  onLogout,
  badges,
  role,
  open,
  onClose,
}: {
  active: NavKey;
  setActive: (key: NavKey) => void;
  onLogout: () => void;
  badges: Partial<Record<NavKey, number>>;
  role?: string;
  open: boolean;
  onClose: () => void;
}) {
  const groups = navGroupsForRole(role);

  function go(key: NavKey) {
    setActive(key);
    onClose();
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`sidebar-scroll fixed inset-y-0 left-0 z-50 flex h-full w-64 max-w-[82%] flex-col overflow-y-auto border-r border-white/10 bg-[#0b1730] text-slate-300 shadow-2xl transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[72px] flex-shrink-0 items-center gap-3 border-b border-white/10 px-5 lg:h-[84px]">
          <div className="grid h-[42px] w-[42px] place-items-center rounded-[10px] bg-[#2f6df3] text-[13px] font-extrabold text-white">
            KP
          </div>
          <div className="leading-tight">
            <strong className="block text-[15px] font-bold text-white">KP Workers</strong>
            <span className="block text-[13px] text-slate-400">Welfare Board</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2">
          {groups.map((group) => (
            <div className="mb-1 pt-3" key={group.label}>
              <p className="mx-2.5 mb-2 text-[11px] font-medium uppercase tracking-[0.04em] text-[#6d7d98]">{group.label}</p>
              {group.items.map((item) => {
                const selected = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => go(item.key)}
                    className={`mb-0.5 flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors duration-150 ${
                      selected ? "bg-[#15376f] text-white" : "text-[#b8c4d9] hover:bg-[#15376f]/70 hover:text-white"
                    }`}
                  >
                    <span className="grid h-[26px] w-[26px] flex-shrink-0 place-items-center rounded-lg bg-white/[0.07] text-xs font-extrabold">
                      {item.label.slice(0, 1)}
                    </span>
                    <span className="truncate">{item.label}</span>
                    {badges[item.key] ? (
                      <b className="ml-auto grid h-6 min-w-[24px] place-items-center rounded-full bg-[#ffd51d] px-1.5 text-xs font-bold text-[#172033]">
                        {badges[item.key]}
                      </b>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <button
          onClick={onLogout}
          className="mt-auto flex-shrink-0 border-t border-white/10 px-6 py-[18px] text-left text-[#b8c4d9] transition-colors hover:bg-[#15376f] hover:text-white"
        >
          Logout
        </button>
      </aside>
    </>
  );
}
