// src/utils/katex.js
// KaTeX rendering helpers — used in QuizQuestion and QuizBlock

import katex from 'katex'
import 'katex/dist/katex.min.css'

/**
 * Renders a LaTeX string to an HTML string using KaTeX
 * Returns the original string if rendering fails (safe fallback)
 *
 * Usage:
 *   <span dangerouslySetInnerHTML={{ __html: renderLatex('\\frac{2x+1}{3}=5') }} />
 */
export const renderLatex = (text) => {
  if (!text) return ''
  try {
    return katex.renderToString(text, {
      throwOnError: false,        // never crash — show error inline
      displayMode: false,         // inline mode by default
      output: 'html',
    })
  } catch {
    return text                   // fallback: show raw text
  }
}

/**
 * Renders a LaTeX string in display (block) mode — centered, larger
 * Use for standalone equations, not inline options
 */
export const renderLatexDisplay = (text) => {
  if (!text) return ''
  try {
    return katex.renderToString(text, {
      throwOnError: false,
      displayMode: true,
      output: 'html',
    })
  } catch {
    return text
  }
}

/**
 * Detects whether a string likely contains LaTeX
 * Used to decide render strategy for mixed content
 */
export const hasLatex = (text) => {
  if (!text) return false
  return /\\[a-zA-Z{]|[\^_]|\$/.test(text)
}
