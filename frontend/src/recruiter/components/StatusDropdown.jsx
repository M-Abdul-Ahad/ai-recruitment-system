import React, { useState, useRef, useEffect } from "react";

const STATUS_CONFIG = {
  APPLIED: {
    label: "Applied",
    bg: "bg-[#3E7285]/10 dark:bg-[#3E7285]/20",
    text: "text-[#3E7285] dark:text-[#5B9DB5]",
    ring: "ring-[#3E7285]/20",
    dot: "bg-[#3E7285]",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    bg: "bg-[#4E7A33]/10 dark:bg-[#4E7A33]/20",
    text: "text-[#4E7A33] dark:text-[#74AB50]",
    ring: "ring-[#4E7A33]/20",
    dot: "bg-[#4E7A33]",
  },
  INTERVIEW: {
    label: "Interview",
    bg: "bg-[#C99A3E]/10 dark:bg-[#C99A3E]/20",
    text: "text-[#C99A3E] dark:text-[#E0B55C]",
    ring: "ring-[#C99A3E]/20",
    dot: "bg-[#C99A3E]",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-[#B4453D]/10 dark:bg-[#B4453D]/20",
    text: "text-[#B4453D] dark:text-[#D96B63]",
    ring: "ring-[#B4453D]/20",
    dot: "bg-[#B4453D]",
  },
};

const ALL_STATUSES = ["APPLIED", "SHORTLISTED", "INTERVIEW", "REJECTED"];

/**
 * Dropdown for changing application status.
 * @param {{ currentStatus: string, onStatusChange: (newStatus: string) => void, disabled?: boolean }} props
 */
const StatusDropdown = ({ currentStatus, onStatusChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.APPLIED;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold
          ring-1 ring-inset transition-all cursor-pointer
          ${cfg.bg} ${cfg.text} ${cfg.ring}
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm"}
        `}
      >
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        {cfg.label}
        {!disabled && (
          <svg className={`w-3.5 h-3.5 ml-0.5 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 right-0 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 animate-dropdown-in">
          {ALL_STATUSES.map((s) => {
            const sc = STATUS_CONFIG[s];
            const isActive = s === currentStatus;
            return (
              <button
                key={s}
                onClick={() => {
                  onStatusChange(s);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors
                  ${isActive ? "bg-gray-50 font-bold" : "hover:bg-gray-50"}
                `}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dot}`} />
                <span className={isActive ? sc.text : "text-gray-700"}>{sc.label}</span>
                {isActive && (
                  <svg className="w-3.5 h-3.5 ml-auto text-[#3D4127] dark:text-[#D4DE95]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes dropdownIn {
            from { opacity: 0; transform: translateY(-4px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-dropdown-in { animation: dropdownIn 0.15s ease-out forwards; }
        `
      }} />
    </div>
  );
};

export default StatusDropdown;
