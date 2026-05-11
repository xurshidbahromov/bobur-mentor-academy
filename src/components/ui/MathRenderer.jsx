import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathRenderer({ math, block = false }) {
  if (!math) return null;
  const str = String(math);

  const hasMath = str.includes('$');
  
  if (!hasMath) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{str}</span>;
  }

  const parts = str.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);

  return (
    <span style={{ 
      fontSize: block ? '1.1em' : '1em',
      lineHeight: '1.5',
      whiteSpace: 'pre-wrap'
    }} className="katex-wrapper">
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2);
          try {
            const html = katex.renderToString(formula, { displayMode: true, throwOnError: false });
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (e) {
            return <span key={i} style={{ color: '#EF4444' }}>{part}</span>;
          }
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1);
          try {
            const html = katex.renderToString(formula, { displayMode: false, throwOnError: false });
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (e) {
            return <span key={i} style={{ color: '#EF4444' }}>{part}</span>;
          }
        } else {
          return <React.Fragment key={i}>{part}</React.Fragment>;
        }
      })}
    </span>
  );
}
