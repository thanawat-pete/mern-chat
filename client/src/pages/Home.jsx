import React from 'react'
import { MessageCircle } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useChatStore } from '../store/useChatStore'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'

const Home = () => {
  const { authUser } = useAuthStore()
  const { selectedUser } = useChatStore()

  return (
    <div className="h-screen bg-base-100 flex transition-colors duration-300">
      {/* Load Sidebar Component Here */}
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center bg-base-100/50">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <MessageCircle size={60} className="text-primary animate-bounce" />
              </div>
              <h2 className="text-3xl font-bold text-base-content mb-2">Welcome to SE Chat!</h2>
              {authUser && (
                <p className="text-base-content/80 text-lg mb-4">
                  Hello, {authUser.fullname || authUser.user?.fullname}! 👋
                </p>
              )}
              <p className="text-base-content/60">Select a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        ) : (
          <ChatContainer />
        )}
      </div>
    </div>
  )
}

export default Home
