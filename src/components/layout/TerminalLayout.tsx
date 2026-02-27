"use client";

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { cn } from "@/lib/cn";

interface TerminalLayoutProps {
  sidebar?: React.ReactNode;
  chart?: React.ReactNode;
  orderPanel?: React.ReactNode;
  bottom?: React.ReactNode;
}

export function TerminalLayout({ sidebar, chart, orderPanel, bottom }: TerminalLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileOrderExpanded, setMobileOrderExpanded] = useState(false);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setBottomCollapsed(true);
    }
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = () => {
      if (mq.matches) setMobileMenuOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="flex min-h-dvh sm:h-screen w-full flex-col bg-terminal-bg text-text-primary overflow-y-auto sm:overflow-hidden safe-area-inset">
      <header className="flex-shrink-0 border-b-3 border-border bg-panel-bg shadow-brutal-sm">
        <Header onMenuClick={() => setMobileMenuOpen((o) => !o)} menuOpen={mobileMenuOpen} />
      </header>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            aria-hidden
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            className="fixed left-0 top-0 z-50 h-full w-[min(280px,85vw)] border-r-3 border-border bg-panel-bg shadow-brutal lg:hidden flex flex-col"
            aria-label="Watchlist"
          >
            <div className="panel-header flex items-center justify-between flex-shrink-0 border-b-3 border-border px-3 py-2">
              <span className="uppercase text-text-secondary font-bold tracking-widest text-[0.7rem]">
                Watchlist
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="border-3 border-border px-2 py-1 bg-terminal-bg text-text-primary font-bold shadow-brutal-press"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="panel-content flex-1 overflow-auto border-t-3 border-border min-h-0">
              {sidebar}
            </div>
          </aside>
        </>
      )}

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {/* Desktop sidebar: hidden on mobile, collapsible on lg+ */}
        <aside
          className={cn(
            "hidden lg:flex flex-shrink-0 border-r-3 border-border bg-panel-bg transition-[width] duration-smooth ease-smooth overflow-hidden shadow-brutal-sm flex-col",
            sidebarCollapsed ? "w-14" : "w-64"
          )}
        >
          <div className="panel-header flex items-center justify-between flex-shrink-0 px-3">
            <span className={cn("uppercase text-text-secondary font-bold tracking-widest text-[0.7rem]", sidebarCollapsed && "hidden")}>
              Watchlist
            </span>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="border-3 border-border px-2 py-1 bg-terminal-bg text-text-primary font-bold shadow-brutal-press hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-smooth ease-smooth"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? "»" : "«"}
            </button>
          </div>
          {!sidebarCollapsed && (
            <div className="panel-content overflow-auto flex-1 min-h-0 border-t-3 border-border">
              {sidebar}
            </div>
          )}
        </aside>

        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto xl:overflow-hidden">
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_360px] min-h-0">
            <section className="flex flex-col min-h-0 min-w-0 border-r-3 border-border border-r-0 xl:border-r-3 bg-terminal-bg">
              <div className="panel-header flex items-center justify-between flex-shrink-0 border-b-3 border-border px-2 sm:px-3 py-2">
                <span className="uppercase text-text-secondary text-xs sm:text-sm">Chart</span>
              </div>
              {/* Chart: on mobile give min height so it stays large when order collapsed; smaller when order expanded so both fit */}
              <div
                className={cn(
                  "flex-1 min-h-0",
                  "xl:min-h-0",
                  !mobileOrderExpanded && "min-h-[48vh] sm:min-h-[54vh]",
                  mobileOrderExpanded && "min-h-[32vh] sm:min-h-[38vh]"
                )}
              >
                {chart}
              </div>
              {/* Order panel below chart on mobile/tablet (< xl): collapsible so chart can use full height */}
              <div className="xl:hidden flex flex-col border-t-3 border-border bg-panel-bg flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileOrderExpanded((e) => !e)}
                  className="panel-header h-10 flex-shrink-0 border-b-3 border-border px-3 py-2 flex items-center justify-between w-full text-left hover:bg-panel-bg/80 transition-colors"
                  aria-expanded={mobileOrderExpanded}
                >
                  <span className="uppercase text-text-secondary text-xs font-bold tracking-widest">Order & Book</span>
                  <span className="text-text-primary text-sm font-bold" aria-hidden>
                    {mobileOrderExpanded ? "˄" : "˅"}
                  </span>
                </button>
                {mobileOrderExpanded && (
                  <div className="max-h-[58vh] min-h-0 overflow-auto flex flex-col border-t-0">{orderPanel}</div>
                )}
              </div>
            </section>
            <section className="flex flex-col min-h-0 xl:min-w-[360px] bg-panel-bg border-l-3 border-border hidden xl:flex shadow-brutal-sm">
              <div className="panel-header h-10 flex-shrink-0 border-b-3 border-border px-3">
                <span className="uppercase text-text-secondary">Order & Book</span>
              </div>
              <div className="flex-1 min-h-0 overflow-auto flex flex-col min-w-0">{orderPanel}</div>
            </section>
          </div>

          <div
            className={cn(
              "flex-shrink-0 border-t-3 border-border bg-panel-bg transition-all duration-smooth ease-smooth overflow-hidden shadow-brutal-sm",
              bottomCollapsed ? "h-10" : "h-40 sm:h-52"
            )}
          >
            <div className="panel-header flex items-center justify-between border-b-3 border-border px-2 sm:px-3 py-1.5">
              <span className="uppercase text-text-secondary text-xs sm:text-sm">Positions & History</span>
              <button
                type="button"
                onClick={() => setBottomCollapsed((c) => !c)}
                className="border-2 border-border px-1.5 py-0.5 bg-terminal-bg text-text-primary hover:shadow-brutal-press active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-smooth ease-smooth"
                aria-label={bottomCollapsed ? "Expand" : "Collapse"}
              >
                {bottomCollapsed ? "˄" : "˅"}
              </button>
            </div>
            {!bottomCollapsed && (
              <div className="panel-content h-32 sm:h-44 overflow-auto">{bottom}</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
