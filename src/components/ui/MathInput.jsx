import React, { useEffect, useRef } from 'react';
import 'mathlive';

export default function MathInput({ value, onChange, placeholder = "Formulani kiriting..." }) {
  const mfRef = useRef(null);

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;

    // Set initial configuration
    mf.smartMode = true;
    mf.virtualKeyboardMode = "manual";

    // Set value if it changes externally
    if (mf.value !== value) {
      mf.setValue(value || '', { suppressChangeNotifications: true });
    }
  }, [value]);

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;

    const handleInput = (ev) => {
      if (onChange) {
        onChange(ev.target.value);
      }
    };

    mf.addEventListener('input', handleInput);
    return () => mf.removeEventListener('input', handleInput);
  }, [onChange]);

  return (
    <div style={{
      border: '1px solid var(--border-medium)',
      borderRadius: '16px',
      overflow: 'hidden',
      background: '#fff',
      boxShadow: 'inset 0 2px 4px rgba(15,23,42,0.02)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* We use class math-field which gets styled/handled by mathlive */}
      <math-field
        ref={mfRef}
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          padding: '16px',
          fontSize: '1.25rem',
          minHeight: '60px',
          fontFamily: '"Outfit", sans-serif',
          background: 'transparent'
        }}
      >
      </math-field>
    </div>
  );
}
