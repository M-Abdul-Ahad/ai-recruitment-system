import React from "react";

/**
 * DonutChart - SVG-based donut chart
 * @param {Array<{label: string, value: number, color: string}>} data
 * @param {string} centerLabel
 * @param {string|number} centerValue
 * @param {number} size
 */
export function DonutChart({ data = [], centerLabel = "", centerValue = "", size = 180 }) {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const radius = size * 0.38;
  const strokeWidth = size * 0.16;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-[#ECEEDF] dark:text-[#2A2E1E]"
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            data.map((slice, i) => {
              const fraction = slice.value / total;
              const strokeDasharray = `${fraction * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += fraction;

              return (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              );
            })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-black text-[#22241B] dark:text-[#EBF0DA] leading-tight font-mono">
            {centerValue !== "" ? centerValue : total}
          </span>
          {centerLabel && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8F76] dark:text-[#9CA485]">
              {centerLabel}
            </span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5 w-full max-w-[200px]">
        {data.map((item, i) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[#52564A] dark:text-[#9CA485] font-medium truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#22241B] dark:text-[#EBF0DA] font-mono">{item.value}</span>
                <span className="text-[10px] text-[#8A8F76] dark:text-[#6C725B] w-7 text-right">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * BarChart - Clean horizontal bar chart
 * @param {Array<{label: string, value: number, max?: number, color?: string}>} items
 */
export function HorizontalBarChart({ items = [], maxHeight = 200 }) {
  const maxVal = Math.max(...items.map((it) => it.value || 0), 1);

  return (
    <div className="space-y-3 w-full" style={{ maxHeight }}>
      {items.map((item, i) => {
        const pct = Math.round(((item.value || 0) / maxVal) * 100);
        return (
          <div key={i} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#22241B] dark:text-[#EBF0DA] truncate max-w-[70%]">
                {item.label}
              </span>
              <span className="font-bold font-mono text-[#3D4127] dark:text-[#D4DE95]">
                {item.value}
              </span>
            </div>
            <div className="w-full bg-[#ECEEDF] dark:bg-[#2A2E1E] h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.color || "var(--apl-accent, #D4DE95)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * FunnelProgress - Hiring funnel / Application pipeline tracker
 * @param {Array<{label: string, count: number, color: string}>} stages
 */
export function FunnelProgress({ stages = [] }) {
  const total = stages[0]?.count || 1;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stages.map((stg, i) => {
        const rate = total > 0 ? Math.round((stg.count / total) * 100) : 0;
        return (
          <div
            key={i}
            className="p-3.5 rounded-xl border border-[#ECEEDF] dark:border-[#2A2E1E] bg-[#F8F9F1]/60 dark:bg-[#1A1D13] flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stg.color }} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A8F76] dark:text-[#9CA485] truncate">
                {stg.label}
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-[#22241B] dark:text-[#EBF0DA] font-mono leading-none">
                {stg.count}
              </div>
              <span className="text-[10px] text-[#8A8F76] dark:text-[#6C725B]">
                {i === 0 ? "Total Inflow" : `${rate}% conversion`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
