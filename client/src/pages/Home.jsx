import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Settings, User } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

const Home = () => {
  const [isOnlineOnly, setIsOnlineOnly] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [contacts] = useState([
    // Placeholder contacts
  ])
  const navigate = useNavigate()

  const { authUser } = useAuthStore()

  return (
    <div className="h-screen bg-base-100 flex transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-80 bg-base-200 border-r border-base-300 flex flex-col transition-colors duration-300">
        {/* Header */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary rounded-lg">
              <MessageCircle size={20} className="text-primary-content" />
            </div>
            <h1 className="text-base-content font-bold text-lg">SE Chat</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-base-300 rounded-lg transition text-base-content/60 hover:text-base-content">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Contacts Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <User size={20} className="text-base-content/60" />
                <span className="text-base-content/80 font-medium">Contacts</span>
                <span className="text-base-content/60 text-sm">({contacts.length} online)</span>
              </div>
            </div>

            {/* Show online only toggle */}
            <label className="flex items-center space-x-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={isOnlineOnly}
                onChange={(e) => setIsOnlineOnly(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-base-content/60 text-sm">Show online only</span>
            </label>

            {/* No online users message */}
            {contacts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-base-content/60 text-sm">No online users</p>
              </div>
            )}

            {/* Contacts list */}
            <div className="space-y-2">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${selectedContact === contact.id
                      ? 'bg-base-300'
                      : 'hover:bg-base-300'
                    }`}
                >
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-content font-semibold">
                    {contact.name?.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-base-content font-medium">{contact.name}</p>
                    <p className="text-base-content/60 text-sm">{contact.status}</p>
                  </div>
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top navigation moved to global Navbar (MainLayout) */}

        {/* Welcome Message */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <MessageCircle size={60} className="text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-base-content mb-2">Welcome to SE Chat!</h2>
            {authUser && <p className="text-base-content/80 text-lg mb-4">Hello, {authUser.user?.fullname || authUser.fullname}! 👋</p>}
            <p className="text-base-content/60">Select a conversation from the sidebar to start chatting</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
