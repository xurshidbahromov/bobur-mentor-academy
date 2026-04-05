// src/components/layout/PageWrapper.jsx
// Wraps every page with consistent max-width, padding, and page-enter animation
// Used in routes.jsx as the outer container for all Route elements

export default function PageWrapper({ children }) {
  return (
    <div className="page-enter" style={{ width: '100%' }}>
      {children}
    </div>
  )
}
