import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

// Apply the stored/default theme synchronously on module load so the
// initial paint uses the correct theme and avoids a flash of the wrong theme.
const _initialTheme = (() => {
  try {
    return localStorage.getItem('talentbridge-theme') || 'dark'
  } catch (e) {
    return 'dark'
  }
})()

if (typeof document !== 'undefined') {
  if (_initialTheme === 'light') document.documentElement.setAttribute('data-theme', 'light')
  else document.documentElement.removeAttribute('data-theme')
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(_initialTheme)

  useEffect(() => {
    try {
      localStorage.setItem('talentbridge-theme', theme)
    } catch (e) {
      // ignore
    }
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
