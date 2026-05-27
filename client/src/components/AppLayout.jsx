import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar.jsx'

export function AppLayout() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

