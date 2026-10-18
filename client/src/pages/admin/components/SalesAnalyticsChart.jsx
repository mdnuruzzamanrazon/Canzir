import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Calendar,
  Filter,
  BarChart3,
  LineChart,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
  X
} from 'lucide-react';
import apiFetch from '../../../utils/api.js';

export default function SalesAnalyticsChart({ formatPrice, autoRefreshSignal }) {
  // Range selection: 'today' | '7d' | '30d' | 'this_month' | 'last_month' | '3m' | '12m' | 'custom'
  const [selectedRange, setSelectedRange] = useState('30d');
  
  // Metric toggle: 'revenue' | 'units' | 'orders' | 'combined'
  const [activeMetric, setActiveMetric] = useState('revenue');
  
  // Visualization style: 'area' | 'bar'
  const [chartType, setChartType] = useState('area');
  
  // Custom date range states
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().slice(0, 10);
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().slice(0, 10));

  // Data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [showTopProducts, setShowTopProducts] = useState(false);

  // SVG Chart Dimensions
  const SVG_WIDTH = 860;
  const SVG_HEIGHT = 280;
  const PADDING = { top: 25, right: 30, bottom: 45, left: 60 };
  const CHART_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
  const CHART_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  // Fetch Analytics from Backend API
  const fetchAnalytics = async (rangeToFetch = selectedRange) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/orders/admin/analytics?range=${rangeToFetch}`;
      if (rangeToFetch === 'custom') {
        url += `&startDate=${customStart}&endDate=${customEnd}`;
      }

      const res = await apiFetch(url);
      if (res.success) {
        setAnalyticsData(res);
      } else {
        setError(res.message || 'Failed to fetch sales analytics');
      }
    } catch (err) {
      console.error('[SalesAnalyticsChart Error]', err);
      setError(err.message || 'Network error fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Initial load & when selectedRange changes
  useEffect(() => {
    fetchAnalytics(selectedRange);
  }, [selectedRange, autoRefreshSignal]);

  // Handle custom date range submit
  const handleApplyCustomRange = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    setShowCustomModal(false);
    setSelectedRange('custom');
    fetchAnalytics('custom');
  };

  const timeline = analyticsData?.timeline || [];
  const summary = analyticsData?.summary || {
    grossRevenue: 0,
    settledRevenue: 0,
    pendingRemittance: 0,
    unitsSold: 0,
    ordersCount: 0,
    averageOrderValue: 0
  };
  const comparison = analyticsData?.comparison || {};
  const topProducts = analyticsData?.topProducts || [];

  // Determine Max Y value based on activeMetric
  const { maxY, yPoints } = useMemo(() => {
    if (!timeline.length) return { maxY: 100, yPoints: [] };

    let maxVal = 0;
    timeline.forEach(d => {
      let val = d.revenue;
      if (activeMetric === 'units') val = d.unitsSold;
      if (activeMetric === 'orders') val = d.ordersCount;
      if (activeMetric === 'combined') val = d.revenue;
      if (val > maxVal) maxVal = val;
    });

    if (maxVal === 0) maxVal = activeMetric === 'revenue' || activeMetric === 'combined' ? 10000 : 10;
    
    // Round to clean ceiling
    let ceiling;
    if (activeMetric === 'revenue' || activeMetric === 'combined') {
      const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
      ceiling = Math.ceil((maxVal * 1.15) / magnitude) * magnitude;
    } else {
      ceiling = Math.ceil(maxVal * 1.25) || 5;
    }

    // 4 step intervals
    const steps = 4;
    const points = [];
    for (let i = 0; i <= steps; i++) {
      points.push(Math.round((ceiling / steps) * i));
    }

    return { maxY: ceiling, yPoints: points };
  }, [timeline, activeMetric]);

  // Secondary Max Y for Units Sold in Combined Mode
  const maxSecondaryY = useMemo(() => {
    if (activeMetric !== 'combined' || !timeline.length) return 10;
    const maxUnits = Math.max(...timeline.map(d => d.unitsSold), 0);
    return Math.ceil((maxUnits || 5) * 1.3);
  }, [timeline, activeMetric]);

  // Generate SVG coordinates for Area/Line chart
  const { pathD, areaD, pointCoordinates } = useMemo(() => {
    if (!timeline.length) return { pathD: '', areaD: '', pointCoordinates: [] };

    const count = timeline.length;
    const xStep = count > 1 ? CHART_WIDTH / (count - 1) : CHART_WIDTH / 2;

    const coords = timeline.map((pt, idx) => {
      let val = pt.revenue;
      if (activeMetric === 'units') val = pt.unitsSold;
      if (activeMetric === 'orders') val = pt.ordersCount;
      if (activeMetric === 'combined') val = pt.revenue;

      const x = PADDING.left + (count > 1 ? idx * xStep : CHART_WIDTH / 2);
      const ratio = Math.min(1, Math.max(0, val / maxY));
      const y = PADDING.top + CHART_HEIGHT - (ratio * CHART_HEIGHT);
      return { x, y, data: pt, index: idx };
    });

    if (coords.length === 1) {
      const c = coords[0];
      return {
        pathD: `M ${c.x - 20} ${c.y} L ${c.x + 20} ${c.y}`,
        areaD: `M ${c.x - 20} ${c.y} L ${c.x + 20} ${c.y} L ${c.x + 20} ${PADDING.top + CHART_HEIGHT} L ${c.x - 20} ${PADDING.top + CHART_HEIGHT} Z`,
        pointCoordinates: coords
      };
    }

    // Smooth Bezier Curve generator
    let linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const midX = (curr.x + next.x) / 2;
      linePath += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
    }

    const first = coords[0];
    const last = coords[coords.length - 1];
    const areaPath = `${linePath} L ${last.x} ${PADDING.top + CHART_HEIGHT} L ${first.x} ${PADDING.top + CHART_HEIGHT} Z`;

    return { pathD: linePath, areaD: areaPath, pointCoordinates: coords };
  }, [timeline, maxY, activeMetric]);

  // Format tick labels
  const formatYLabel = (val) => {
    if (activeMetric === 'revenue' || activeMetric === 'combined') {
      if (val >= 1000000) return `৳${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `৳${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`;
      return `৳${val}`;
    }
    return `${val}`;
  };

  // Determine intelligent X-axis label stride to prevent overlapping
  const xStride = useMemo(() => {
    const len = timeline.length;
    if (len <= 8) return 1;
    if (len <= 15) return 2;
    if (len <= 31) return Math.ceil(len / 8);
    return Math.ceil(len / 10);
  }, [timeline.length]);

  return (
    <div className="bg-[#181513]/90 border border-stone-800/90 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-6">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER & INTERACTIVE CONTROLS BAR                     */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C58B4B] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C58B4B]">
              Atelier Sales Velocity Engine
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-100 tracking-wide mt-0.5">
            Revenue &amp; Product Sales Analytics
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Live database-connected order velocity, settled remittances, and product volume trends.
          </p>
        </div>

        {/* Controls Cluster */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Metric Selector Pills */}
          <div className="inline-flex rounded-xl bg-stone-900/90 p-1 border border-stone-800 text-xs">
            {[
              { id: 'revenue', label: 'Revenue (৳)', icon: DollarSign },
              { id: 'units', label: 'Units Sold', icon: Package },
              { id: 'orders', label: 'Orders', icon: ShoppingBag },
              { id: 'combined', label: 'Dual View', icon: Sparkles }
            ].map(m => {
              const Icon = m.icon;
              const isActive = activeMetric === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveMetric(m.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C58B4B] to-[#b0793c] text-stone-950 shadow-xs'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chart Type Toggle (Area vs Bar) */}
          <div className="inline-flex rounded-xl bg-stone-900/90 p-1 border border-stone-800 text-xs">
            <button
              type="button"
              onClick={() => setChartType('area')}
              title="Smooth Curved Area Chart"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'bg-stone-800 text-[#E6AF68] border border-stone-700/60'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              title="Column Bar Chart"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-stone-800 text-[#E6AF68] border border-stone-700/60'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Date Range Selector Pills */}
          <div className="inline-flex rounded-xl bg-stone-900/90 p-1 border border-stone-800 text-xs flex-wrap">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: '3m', label: '3M' },
              { id: '12m', label: '12M' },
              { id: 'custom', label: 'Custom' }
            ].map(r => {
              const isActive = selectedRange === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    if (r.id === 'custom') {
                      setShowCustomModal(true);
                    } else {
                      setSelectedRange(r.id);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                    isActive
                      ? 'bg-stone-800 text-[#E6AF68] shadow-xs border border-stone-700/60'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={() => fetchAnalytics(selectedRange)}
            disabled={loading}
            title="Refresh Analytics Data"
            className="p-2 rounded-xl bg-stone-900/90 border border-stone-800 text-stone-400 hover:text-[#E6AF68] hover:border-stone-700 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C58B4B]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. DYNAMIC KPI METRIC STRIP (4 Connected Data Cards)         */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 p-4 rounded-xl bg-stone-900/60 border border-stone-800/80">
        {/* Gross Revenue */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Gross Store Volume
            </span>
            {comparison.revenueGrowth !== undefined && (
              <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                comparison.revenueGrowth >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {comparison.revenueGrowth >= 0 ? '+' : ''}{comparison.revenueGrowth}%
              </span>
            )}
          </div>
          <span className="text-lg sm:text-xl xl:text-2xl font-bold font-mono text-stone-100 block">
            {formatPrice(summary.grossRevenue || 0)}
          </span>
          <span className="text-[11px] text-stone-400 block">
            {summary.ordersCount} paid/active {summary.ordersCount === 1 ? 'order' : 'orders'} in period
          </span>
        </div>

        {/* Settled Payments */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Settled Payments
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              {summary.grossRevenue > 0
                ? `${Math.round((summary.settledRevenue / summary.grossRevenue) * 100)}% Settled`
                : '100%'}
            </span>
          </div>
          <span className="text-lg sm:text-xl xl:text-2xl font-bold font-mono text-emerald-400 block">
            {formatPrice(summary.settledRevenue || 0)}
          </span>
          <span className="text-[11px] text-stone-400 block">
            Remitted via bKash, Card, Bank
          </span>
        </div>

        {/* Pending Courier Remittance */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Pending Courier Cash
            </span>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20 font-mono">
              COD In Transit
            </span>
          </div>
          <span className="text-lg sm:text-xl xl:text-2xl font-bold font-mono text-amber-400 block">
            {formatPrice(summary.pendingRemittance || 0)}
          </span>
          <span className="text-[11px] text-stone-400 block">
            Courier settlement upon delivery
          </span>
        </div>

        {/* Units Sold & Average Order Value */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Products Sold / AOV
            </span>
            {comparison.unitsGrowth !== undefined && (
              <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                comparison.unitsGrowth >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {comparison.unitsGrowth >= 0 ? '+' : ''}{comparison.unitsGrowth}% units
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl xl:text-2xl font-bold font-mono text-[#E6AF68]">
              {summary.unitsSold || 0} <span className="text-xs font-normal text-stone-400">units</span>
            </span>
            <span className="text-xs text-stone-500 font-mono">
              • AOV: {formatPrice(summary.averageOrderValue || 0)}
            </span>
          </div>
          <span className="text-[11px] text-stone-400 block">
            {topProducts.length ? `${topProducts[0].title.slice(0, 24)}... (Top)` : 'Handmade atelier fixtures'}
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. RESPONSIVE SVG ANALYTICS CANVAS & TOOLTIPS                */}
      {/* ============================================================ */}
      <div className="relative w-full overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3 bg-stone-900/30 rounded-xl border border-stone-800/60 animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-[#C58B4B] border-t-transparent animate-spin" />
            <span className="text-xs text-stone-400 font-medium">Synchronizing studio sales timeline...</span>
          </div>
        ) : error ? (
          <div className="h-64 flex flex-col items-center justify-center p-6 bg-rose-500/5 rounded-xl border border-rose-500/20 text-center space-y-3">
            <AlertCircle className="w-6 h-6 text-rose-400" />
            <p className="text-xs text-rose-300 font-medium max-w-sm">{error}</p>
            <button
              type="button"
              onClick={() => fetchAnalytics(selectedRange)}
              className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition"
            >
              Retry Sync
            </button>
          </div>
        ) : timeline.length === 0 || summary.grossRevenue === 0 && summary.unitsSold === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center p-6 bg-stone-900/30 rounded-xl border border-stone-800/60 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-center text-stone-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-200">No Sales Recorded for Selected Period</h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                Orders placed or settled during this date range will automatically update this chart in real time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRange('30d')}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-[#E6AF68] text-xs font-semibold border border-stone-700 transition"
            >
              View Last 30 Days
            </button>
          </div>
        ) : (
          <div className="relative select-none">
            {/* SVG Visual Canvas */}
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="w-full h-auto overflow-visible font-sans"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                {/* Radiant Luxury Gold Gradient */}
                <linearGradient id="canzirGoldArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C58B4B" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#925F29" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#181513" stopOpacity="0.0" />
                </linearGradient>

                {/* Secondary Blue Gradient for Units in Combined Mode */}
                <linearGradient id="canzirSecondaryUnits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
                </linearGradient>

                {/* Bar Gradient */}
                <linearGradient id="canzirBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E6AF68" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#8A5A28" stopOpacity="0.7" />
                </linearGradient>

                {/* Glow Filter for Active Curve */}
                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Horizontal Dotted Gridlines & Y-Axis Labels */}
              {yPoints.map((val, idx) => {
                const ratio = val / maxY;
                const y = PADDING.top + CHART_HEIGHT - (ratio * CHART_HEIGHT);
                return (
                  <g key={idx}>
                    <line
                      x1={PADDING.left}
                      y1={y}
                      x2={SVG_WIDTH - PADDING.right}
                      y2={y}
                      stroke="#292524"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={PADDING.left - 10}
                      y={y + 4}
                      fill="#78716c"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {formatYLabel(val)}
                    </text>
                  </g>
                );
              })}

              {/* Combined Mode: Render Translucent Column Bars for Units Sold */}
              {activeMetric === 'combined' && (
                <g>
                  {pointCoordinates.map((pt, idx) => {
                    const barWidth = Math.max(6, Math.min(24, (CHART_WIDTH / timeline.length) * 0.45));
                    const unitRatio = Math.min(1, pt.data.unitsSold / maxSecondaryY);
                    const barH = unitRatio * CHART_HEIGHT;
                    const barY = PADDING.top + CHART_HEIGHT - barH;
                    return (
                      <rect
                        key={idx}
                        x={pt.x - barWidth / 2}
                        y={barY}
                        width={barWidth}
                        height={Math.max(2, barH)}
                        rx="3"
                        fill="url(#canzirSecondaryUnits)"
                        className="transition-all duration-300 opacity-60 hover:opacity-100"
                      />
                    );
                  })}
                </g>
              )}

              {/* Main Visualization: Area Curve OR Bar Columns */}
              {chartType === 'area' && activeMetric !== 'bar' ? (
                <g>
                  {/* Gradient Area Fill */}
                  {areaD && (
                    <path
                      d={areaD}
                      fill="url(#canzirGoldArea)"
                      className="transition-all duration-500 ease-out"
                    />
                  )}

                  {/* Luminous Spline Stroke */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#C58B4B"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#goldGlow)"
                      className="transition-all duration-500 ease-out"
                    />
                  )}

                  {/* Active Dots on Line */}
                  {pointCoordinates.map((pt, idx) => {
                    const isHovered = hoveredPoint?.index === idx;
                    const hasValue = (activeMetric === 'units' ? pt.data.unitsSold : pt.data.revenue) > 0;
                    return (
                      <g key={idx}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 6 : hasValue ? 3.5 : 2}
                          fill={isHovered ? '#FFFFFF' : '#C58B4B'}
                          stroke={isHovered ? '#C58B4B' : '#181513'}
                          strokeWidth={isHovered ? 3 : 1.5}
                          className="transition-all duration-150"
                        />
                      </g>
                    );
                  })}
                </g>
              ) : (
                /* Bar Columns Visualization */
                <g>
                  {pointCoordinates.map((pt, idx) => {
                    const barWidth = Math.max(8, Math.min(36, (CHART_WIDTH / timeline.length) * 0.7));
                    const isHovered = hoveredPoint?.index === idx;
                    const barH = PADDING.top + CHART_HEIGHT - pt.y;

                    return (
                      <g key={idx}>
                        <rect
                          x={pt.x - barWidth / 2}
                          y={pt.y}
                          width={barWidth}
                          height={Math.max(3, barH)}
                          rx="4"
                          fill={isHovered ? '#F0C082' : 'url(#canzirBarGrad)'}
                          className="transition-all duration-200 cursor-pointer"
                          style={{
                            filter: isHovered ? 'drop-shadow(0 0 10px rgba(197,139,75,0.6))' : 'none'
                          }}
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Interactive Hover Vertical Guidelines & Hitboxes */}
              {pointCoordinates.map((pt, idx) => {
                const count = pointCoordinates.length;
                const slotWidth = count > 1 ? CHART_WIDTH / count : CHART_WIDTH;
                const isHovered = hoveredPoint?.index === idx;

                return (
                  <g key={`hitbox-${idx}`}>
                    {/* Vertical Hairline when hovered */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={PADDING.top}
                        x2={pt.x}
                        y2={PADDING.top + CHART_HEIGHT}
                        stroke="#C58B4B"
                        strokeWidth="1.5"
                        strokeDasharray="2 3"
                        className="animate-fadeIn"
                      />
                    )}

                    {/* Invisible Hitbox for Mouse Events */}
                    <rect
                      x={pt.x - slotWidth / 2}
                      y={PADDING.top}
                      width={slotWidth}
                      height={CHART_HEIGHT + PADDING.bottom}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(pt)}
                    />
                  </g>
                );
              })}

              {/* X-Axis Date Labels */}
              {pointCoordinates.map((pt, idx) => {
                const isVisible = idx % xStride === 0 || idx === pointCoordinates.length - 1;
                if (!isVisible) return null;
                const isHovered = hoveredPoint?.index === idx;

                return (
                  <text
                    key={`xlabel-${idx}`}
                    x={pt.x}
                    y={SVG_HEIGHT - 12}
                    fill={isHovered ? '#E6AF68' : '#78716c'}
                    fontSize="10"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                    textAnchor="middle"
                    fontFamily="monospace"
                    className="transition-colors"
                  >
                    {pt.data.shortLabel}
                  </text>
                );
              })}
            </svg>

            {/* Floating Dynamic Rich Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute pointer-events-none transition-all duration-150 z-30"
                style={{
                  left: `${(hoveredPoint.x / SVG_WIDTH) * 100}%`,
                  top: `${(hoveredPoint.y / SVG_HEIGHT) * 100}%`,
                  transform: 'translate(-50%, -115%)'
                }}
              >
                <div className="bg-[#12100E] border border-[#C58B4B]/50 rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-[200px] text-xs space-y-1.5 ring-1 ring-[#C58B4B]/20">
                  <div className="pb-1 border-b border-stone-800 flex items-center justify-between gap-2">
                    <span className="font-semibold text-stone-200">
                      {hoveredPoint.data.label}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {hoveredPoint.data.ordersCount} {hoveredPoint.data.ordersCount === 1 ? 'ord' : 'ords'}
                    </span>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Total Revenue:</span>
                      <strong className="text-[#E6AF68] font-mono text-sm">
                        {formatPrice(hoveredPoint.data.revenue)}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-400">Settled (Remitted):</span>
                      <span className="text-emerald-400 font-mono font-medium">
                        {formatPrice(hoveredPoint.data.settledRevenue)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-400">Products Sold:</span>
                      <span className="text-stone-200 font-mono font-medium">
                        {hoveredPoint.data.unitsSold} units
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 4. FOOTER STATUS & TOP CONTRIBUTING PRODUCTS ACCORDION       */}
      {/* ============================================================ */}
      <div className="pt-3 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-stone-400 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#C58B4B] to-[#b0793c]" />
            <span>Active Non-Cancelled Orders</span>
          </div>
          {activeMetric === 'combined' && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-400/80" />
              <span>Units Sold (Secondary Axis)</span>
            </div>
          )}
          <span>&bull;</span>
          <span className="font-mono text-stone-500">
            Interval: {analyticsData?.interval?.toUpperCase() || 'DAILY'}
          </span>
        </div>

        {/* Top Contributing Products Quick Drawer Toggle */}
        {topProducts.length > 0 && (
          <button
            type="button"
            onClick={() => setShowTopProducts(!showTopProducts)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-800 text-[11px] font-semibold transition cursor-pointer self-start sm:self-auto"
          >
            <Package className="w-3.5 h-3.5 text-[#C58B4B]" />
            <span>{showTopProducts ? 'Hide Top Products' : 'View Top Products in Period'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTopProducts ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Collapsible Top Contributing Products Section */}
      {showTopProducts && topProducts.length > 0 && (
        <div className="pt-3 border-t border-stone-800/60 animate-fadeIn">
          <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-2.5">
            Top Fixtures Driving Revenue in This Period:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topProducts.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#12100E] border border-stone-800/80 hover:border-stone-700 transition"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-10 h-10 rounded-lg object-cover bg-stone-950 flex-shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/canzir-logo.png';
                  }}
                />
                <div className="min-w-0 flex-1 text-xs">
                  <h4 className="font-semibold text-stone-200 truncate">{p.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mt-0.5 font-mono">
                    <span>{p.unitsSold} sold ({p.ordersCount} ords)</span>
                    <strong className="text-[#E6AF68]">{formatPrice(p.revenue)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. CUSTOM DATE RANGE MODAL                                  */}
      {/* ============================================================ */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1c1917] border border-stone-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C58B4B]" />
                <h3 className="font-serif text-lg font-semibold text-stone-100">
                  Select Custom Analytics Range
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="p-1 text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyCustomRange} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-stone-300 font-semibold">Start Date</label>
                  <input
                    type="date"
                    required
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-[#12100E] border border-stone-800 focus:border-[#C58B4B] rounded-xl px-3 py-2 text-stone-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-stone-300 font-semibold">End Date</label>
                  <input
                    type="date"
                    required
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-[#12100E] border border-stone-800 focus:border-[#C58B4B] rounded-xl px-3 py-2 text-stone-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1.5 font-semibold">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Past 14 Days', days: 14 },
                    { label: 'Past 60 Days', days: 60 },
                    { label: 'Quarter to Date', days: 90 }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() - preset.days);
                        setCustomStart(d.toISOString().slice(0, 10));
                        setCustomEnd(new Date().toISOString().slice(0, 10));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-[11px] border border-stone-800 font-mono transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C58B4B] to-[#b0793c] hover:from-[#d19655] hover:to-[#be8445] text-stone-950 font-bold shadow-xs transition cursor-pointer"
                >
                  Apply Date Range
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
