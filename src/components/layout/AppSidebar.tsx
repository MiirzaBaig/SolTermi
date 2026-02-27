"use client";

import { WalletButton } from "@/components/wallet/WalletButton";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { id: "trading", label: "Trading" },
  { id: "portfolio", label: "Portfolio" },
  { id: "transactions", label: "Transactions" },
];

export function AppSidebar({
  watchlist,
  activeNav = "trading",
}: {
  watchlist: React.ReactNode;
  activeNav?: string;
}) {
  return (
    <aside className="flex w-56 flex-col bg-sidebar-bg text-sidebar-text border-r-3 border-main-text overflow-hidden">
      <div className="p-4 border-b-3 border-main-text">
        <h2 className="text-xs font-bold text-sidebar-muted uppercase tracking-widest">
          Navigation
        </h2>
        <nav className="mt-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href="#"
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-all duration-smooth",
                activeNav === item.id
                  ? "bg-sidebar-active text-sidebar-text border-l-4 border-sidebar-accent"
                  : "text-sidebar-muted hover:bg-white/5 hover:text-sidebar-text border-l-4 border-transparent"
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto p-4 border-b-3 border-main-text">
        <h2 className="text-xs font-bold text-sidebar-muted uppercase tracking-widest mb-3">
          Watchlist
        </h2>
        {watchlist}
      </div>

      <div className="p-4 border-t-3 border-main-text">
        <WalletButton className="w-full" />
      </div>
    </aside>
  );
}
