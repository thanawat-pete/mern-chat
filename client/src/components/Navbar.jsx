import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Settings, User, LogOut, MessageSquare } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

const Navbar = () => {
  const { authUser, logOut } = useAuthStore()
  const isAuthenticated = !!authUser
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logOut()
    navigate('/login')
  }

  return (
    <header className="w-full bg-base-100 border-b border-base-300 px-6 py-4 flex items-center justify-between transition-colors duration-300">
      <Link to="/" className="flex items-center space-x-3 group">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <span className="text-base-content font-bold text-lg">SE Chat</span>
      </Link>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-base-content/80 hover:text-base-content hover:bg-base-200 transition-colors"
        >
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </button>

        {isAuthenticated && (
          <>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-base-content/80 hover:text-base-content hover:bg-base-200 transition-colors"
              onClick={() => navigate('/profile')}
            >
              <User size={18} />
              <span className="text-sm font-medium">Profile</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-base-content/80 hover:text-base-content hover:bg-base-200 transition-colors"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar
