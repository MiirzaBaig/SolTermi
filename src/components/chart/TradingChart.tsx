"use client";

import { memo, useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, HistogramSeries } from "lightweight-charts";
import type { IChartApi, Time } from "lightweight-charts";
import { priceEngine } from "@/lib/priceEngine";
import { useTradingStore } from "@/stores/tradingStore";
import { cn } from "@/lib/cn";

interface CrosshairDisplay {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
}

export const TradingChart = memo(function TradingChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ReturnType<IChartApi["addSeries"]> | null>(null);
  const volumeRef = useRef<ReturnType<IChartApi["addSeries"]> | null>(null);
  const hasInitialDataRef = useRef(false);
  const lastDataFingerprintRef = useRef<string>("");
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activePair = useTradingStore((s) => s.activePair);
  const timeframe = useTradingStore((s) => s.timeframe);
  const [livePrice, setLivePrice] = useState(priceEngine.getCurrentPrice());
  const [flashPrice, setFlashPrice] = useState(false);
  const [switchingTf, setSwitchingTf] = useState(false);
  const [crosshair, setCrosshair] = useState<CrosshairDisplay | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "#0A0A0A" },
        textColor: "#B8B8B8",
      },
      grid: {
        vertLines: { color: "#333333" },
        horzLines: { color: "#333333" },
      },
      rightPriceScale: {
        borderColor: "#FFFFFF",
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: "#FFFFFF",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: { color: "#FFE600" },
        horzLine: { color: "#FFE600" },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00FF41",
      downColor: "#FF3366",
      borderUpColor: "#00FF41",
      borderDownColor: "#FF3366",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#333333",
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

    chartRef.current = chart;
    candleRef.current = candleSeries;
    volumeRef.current = volumeSeries;
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData || !candleRef.current || !volumeRef.current) {
        setCrosshair(null);
        return;
      }
      const candleAtPoint = param.seriesData.get(candleRef.current as never) as
        | { open?: number; high?: number; low?: number; close?: number }
        | undefined;
      const volAtPoint = param.seriesData.get(volumeRef.current as never) as
        | { value?: number }
        | undefined;
      if (
        candleAtPoint?.open === undefined ||
        candleAtPoint.high === undefined ||
        candleAtPoint.low === undefined ||
        candleAtPoint.close === undefined
      ) {
        setCrosshair(null);
        return;
      }
      setCrosshair({
        open: candleAtPoint.open,
        high: candleAtPoint.high,
        low: candleAtPoint.low,
        close: candleAtPoint.close,
        volume: volAtPoint?.value ?? 0,
        time: Number(param.time),
      });
    });

    return () => {
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
      hasInitialDataRef.current = false;
    };
  }, []);

  useEffect(() => {
    priceEngine.setPair(activePair);
  }, [activePair]);

  useEffect(() => {
    setSwitchingTf(true);
    const id = setTimeout(() => setSwitchingTf(false), 240);
    return () => clearTimeout(id);
  }, [timeframe]);

  useEffect(() => {
    const candleSeries = candleRef.current;
    const volumeSeries = volumeRef.current;
    if (!candleSeries || !volumeSeries) return;

    const unsub = priceEngine.subscribe(({ candles, tick }) => {
      if (candles.length === 0) return;
      const last = candles[candles.length - 1];
      const fingerprint = `${candles.length}:${candles[0]?.time}:${last.time}`;

      if (!hasInitialDataRef.current || fingerprint !== lastDataFingerprintRef.current) {
        const ohlcv = candles.map((c) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        const vol = candles.map((c) => ({
          time: c.time as Time,
          value: c.volume,
          color: c.close >= c.open ? "rgba(0, 255, 65, 0.6)" : "rgba(255, 51, 102, 0.6)",
        }));
        candleSeries.setData(ohlcv);
        volumeSeries.setData(vol);
        hasInitialDataRef.current = true;
        lastDataFingerprintRef.current = fingerprint;
      } else {
        candleSeries.update({
          time: last.time as Time,
          open: last.open,
          high: last.high,
          low: last.low,
          close: last.close,
        });
        volumeSeries.update({
          time: last.time as Time,
          value: last.volume,
          color: last.close >= last.open ? "rgba(0, 255, 65, 0.6)" : "rgba(255, 51, 102, 0.6)",
        });
      }
      setLivePrice(last.close);
      if (tick) {
        setFlashPrice(true);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => setFlashPrice(false), 160);
      }
    });

    return () => {
      unsub();
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !containerRef.current) return;

    const ro = new ResizeObserver(() => chart.applyOptions({ width: containerRef.current!.clientWidth }));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="h-full w-full relative">
      <div
        ref={containerRef}
        className="h-full w-full opacity-100"
      />
      {switchingTf && (
        <div className="absolute inset-0 bg-terminal-bg/75 animate-loading-pulse pointer-events-none" />
      )}
      <div className="absolute top-2 right-2 border-2 border-border bg-panel-bg/95 backdrop-blur-sm px-2 py-1.5 text-xs font-mono pointer-events-none shadow-brutal-sm max-w-[calc(100%-1rem)]">
        {crosshair ? (
          <span className="tabular-nums block truncate" title={`O ${crosshair.open.toFixed(2)} H ${crosshair.high.toFixed(2)} L ${crosshair.low.toFixed(2)} C ${crosshair.close.toFixed(2)} V ${Math.round(crosshair.volume)}`}>
            O {crosshair.open.toFixed(2)} H {crosshair.high.toFixed(2)} L {crosshair.low.toFixed(2)} C {crosshair.close.toFixed(2)} V {Math.round(crosshair.volume)}
          </span>
        ) : (
          <span className={cn("tabular-nums", flashPrice ? "text-accent transition-colors" : "text-text-secondary")}>
            Live {livePrice.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
});
