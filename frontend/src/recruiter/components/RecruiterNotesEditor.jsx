import React, { useState, useEffect, useRef } from "react";

/**
 * Inline-editable recruiter notes for a candidate.
 * Saves on blur or Enter, with debounced auto-save.
 *
 * @param {{ notes: string, onSave: (newNotes: string) => Promise<void>, saving?: boolean }} props
 */
const RecruiterNotesEditor = ({ notes = "", onSave, saving = false }) => {
  const [value, setValue] = useState(notes);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Sync external changes
  useEffect(() => {
    if (!isEditing) setValue(notes);
  }, [notes, isEditing]);

  // Focus on edit
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (value.trim() === (notes || "").trim()) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(value.trim());
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setValue(notes);
      setIsEditing(false);
    }
  };

  return (
    <div className="group">
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Add recruiter notes..."
            rows={3}
            className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition"
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-400">
              Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px] font-mono">Enter</kbd> to save, <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px] font-mono">Shift+Enter</kbd> for new line
            </p>
            {isSaving && (
              <span className="text-[10px] text-blue-500 font-medium flex items-center gap-1">
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                  <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Saving...
              </span>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer rounded-lg transition-all"
        >
          {value ? (
            <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors whitespace-pre-wrap">
              {value}
              <span className="inline-block ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-3 h-3 text-gray-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic group-hover:text-blue-500 transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add notes...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RecruiterNotesEditor;
