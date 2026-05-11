// src/components/ui/MathTextInput.jsx
// A regular text input/textarea with an embedded math keyboard button.
// Clicking π opens a MathLive panel; the formula is inserted at cursor position.

import React, { useState, useRef, useEffect } from 'react';
import 'mathlive';

export default function MathTextInput({
  value,
  onChange,
  placeholder,
  rows,          // if rows is set → renders a <textarea>, otherwise <input>
  style = {},
  required = false,
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const textRef = useRef(null);  // ref to the <textarea> or <input>
  const mfRef   = useRef(null);  // ref to the <math-field>
  const panelRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [panelOpen]);

  // Configure mathlive when panel opens
  useEffect(() => {
    const mf = mfRef.current;
    if (!mf || !panelOpen) return;
    mf.smartMode = true;
    mf.virtualKeyboardMode = 'auto';
    // Clear the panel each time it opens
    mf.setValue('', { suppressChangeNotifications: true });
    setTimeout(() => mf.focus(), 50);
  }, [panelOpen]);

  // Insert formula into the text field at cursor position
  const insertFormula = () => {
    const mf = mfRef.current;
    const el = textRef.current;
    if (!mf || !el) return;
    const latex = mf.value?.trim();
    if (!latex) return;

    const formula = `$${latex}$`;
    const start = el.selectionStart ?? value.length;
    const end   = el.selectionEnd   ?? value.length;
    const newVal = value.slice(0, start) + formula + value.slice(end);
    onChange(newVal);

    // Restore focus & cursor after insertion
    setTimeout(() => {
      el.focus();
      const pos = start + formula.length;
      el.setSelectionRange(pos, pos);
    }, 10);

    setPanelOpen(false);
  };

  const baseStyle = {
    width: '100%',
    padding: '14px 50px 14px 16px',
    borderRadius: 12,
    background: '#0F172A',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    resize: rows ? 'vertical' : undefined,
    fontFamily: 'inherit',
    lineHeight: 1.6,
    ...style,
  };

  return (
    <div style={{ position: 'relative' }}>
      {rows ? (
        <textarea
          ref={textRef}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          style={baseStyle}
        />
      ) : (
        <input
          ref={textRef}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={baseStyle}
        />
      )}

      {/* Math keyboard trigger button */}
      <button
        type="button"
        title="Matematik klaviatura"
        onClick={() => setPanelOpen(p => !p)}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          background: panelOpen ? 'rgba(52,97,255,0.15)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: panelOpen ? '#3461FF' : '#94A3B8',
          fontSize: '1rem',
          lineHeight: 1,
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
      >
        π
      </button>

      {/* Floating math keyboard panel */}
      {panelOpen && (
        <div
          ref={panelRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 99999,
            background: '#1E293B',
            border: '1px solid rgba(52,97,255,0.3)',
            borderRadius: 16,
            padding: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <p style={{ margin: '0 0 10px', fontSize: '0.8125rem', color: '#94A3B8', fontWeight: 600 }}>
            Formulani yozing, keyin "Qo'shish" tugmasini bosing
          </p>

          {/* MathLive field */}
          <div style={{ borderRadius: 12, overflow: 'hidden', background: 'white', marginBottom: 12 }}>
            <math-field
              ref={mfRef}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                padding: '12px 16px',
                fontSize: '1.25rem',
                minHeight: '56px',
                display: 'block',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              style={{
                flex: 1, padding: '10px', borderRadius: 10,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94A3B8', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              Bekor
            </button>
            <button
              type="button"
              onClick={insertFormula}
              style={{
                flex: 2, padding: '10px', borderRadius: 10,
                background: '#3461FF', border: 'none',
                color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
              }}
            >
              ✓ Qo'shish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
