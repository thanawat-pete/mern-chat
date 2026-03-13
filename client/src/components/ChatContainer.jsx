import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Send, Image as ImageIcon, X } from "lucide-react";
import ChatboxSkeleton from "./skeletons/ChatboxSkeleton";

const ChatContainer = () => {
  const { messages, getMessages, isMessageLoading, selectedUser, sendMessage, subscribeToMessages, unsubscribeFromMessages, setSelectedUser } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
    }
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImagePreview(reader.result);
    };
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        file: imagePreview,
      });

      // Clear form
      setText("");
      removeImage();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (isMessageLoading) {
    return <ChatboxSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto h-full">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 p-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedUser?.profilePicture || "/avatar.webp"}
              alt={selectedUser?.fullname}
              className="w-10 h-10 object-cover rounded-full bg-base-300"
            />
            {onlineUsers.includes(selectedUser?._id) && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-base-content">{selectedUser?.fullname}</h3>
            <p className="text-xs text-base-content/60">
              {onlineUsers.includes(selectedUser?._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setSelectedUser(null)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-200">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-base-content/60">
            Send a message to start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender === authUser?._id || msg.sender === authUser?.user?._id;
            const profilePic = isMe
              ? (authUser?.profilePicture || authUser?.user?.profilePicture || "/avatar.webp")
              : (selectedUser?.profilePicture || "/avatar.webp");

            return (
              <div key={msg._id || idx} className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <img src={profilePic} alt="profile" />
                  </div>
                </div>
                <div className="chat-header mb-1 text-xs opacity-50 flex gap-1">
                  <time>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                </div>

                <div className={`chat-bubble flex flex-col gap-2 ${isMe ? "bg-primary text-primary-content" : "bg-base-100 text-base-content"}`}>
                  {msg.file && (
                    <img
                      src={msg.file}
                      alt="Attachment"
                      className="max-w-[200px] rounded-md sm:max-w-xs"
                    />
                  )}
                  {msg.text && <p>{msg.text}</p>}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Container */}
      <div className="p-4 bg-base-100 border-t border-base-300 shrink-0">
        {imagePreview && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-base-300"
              />
              <button
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                flex items-center justify-center text-base-content/70"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`btn btn-circle ${imagePreview ? "btn-primary" : "btn-ghost"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={20} />
          </button>

          <input
            type="text"
            className="input input-bordered flex-1 w-full"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            type="submit"
            className="btn btn-primary btn-circle"
            disabled={!text.trim() && !imagePreview}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContainer;