"use client";

import { useState } from "react";
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

  return (
    <div className="flex h-screen w-full flex-col bg-terminal-bg text-text-primary">
      <header className="flex-shrink-0 border-b-3 border-border bg-panel-bg shadow-brutal-sm">
        <Header />
      </header>

      <div className="flex flex-1 min-h-0">
        <aside
          className={cn(
            "flex-shrink-0 border-r-3 border-border bg-panel-bg transition-[width] duration-smooth ease-smooth overflow-hidden shadow-brutal-sm",
            sidebarCollapsed ? "w-14" : "w-60"
          )}
        >
          <div className="panel-header flex items-center justify-between">
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
            <div className="panel-content overflow-auto h-[calc(100vh-10rem)] border-t-3 border-border">
              {sidebar}
            </div>
          )}
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_300px] min-h-0">
            <section className="flex flex-col min-h-0 border-r-3 border-border bg-terminal-bg">
              <div className="panel-header flex items-center justify-between flex-shrink-0 border-b-3 border-border">
                <span className="uppercase text-text-secondary">Chart</span>
              </div>
              <div className="flex-1 min-h-0">{chart}</div>
            </section>
            <section className="flex flex-col min-h-0 bg-panel-bg border-l-3 border-border hidden xl:flex shadow-brutal-sm">
              <div className="panel-header h-10 flex-shrink-0 border-b-3 border-border">
                <span className="uppercase text-text-secondary">Order & Book</span>
              </div>
              <div className="flex-1 min-h-0 overflow-auto flex flex-col">{orderPanel}</div>
            </section>
          </div>

          <div
            className={cn(
              "flex-shrink-0 border-t-3 border-border bg-panel-bg transition-all duration-smooth ease-smooth overflow-hidden shadow-brutal-sm",
              bottomCollapsed ? "h-10" : "h-52"
            )}
          >
            <div className="panel-header flex items-center justify-between border-b-3 border-border">
              <span className="uppercase text-text-secondary">Positions & History</span>
              <button
                type="button"
                onClick={() => setBottomCollapsed((c) => !c)}
                className="border-2 border-border px-1.5 py-0.5 bg-terminal-bg text-text-primary hover:shadow-brutal-press active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-smooth ease-smooth"
                aria-label={bottomCollapsed ? "Expand" : "Collapse"}
              >
                {bottomCollapsed ? "˄" : "˅"}
              </button>
            </div>
            {!bottomCollapsed && <div className="panel-content h-44 overflow-auto">{bottom}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
