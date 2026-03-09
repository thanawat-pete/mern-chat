// Skeleton for loading messages

const ChatboxSkeleton = () => {
  // Create 6 skeleton messages
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 flex flex-col overflow-auto">

      {/* Header Skeleton */}
      <div className="bg-base-100 border-b border-base-300 p-4 shrink-0 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-full shrink-0" />

          <div>
            <div className="skeleton h-4 w-32 mb-2" />
            <div className="skeleton h-3 w-16" />
          </div>
        </div>

        <button className="btn btn-sm btn-circle btn-ghost">
          ✕
        </button>

      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {skeletonMessages.map((_, idx) => (
          <div
            key={idx}
            className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}
          >
            <div className="chat-image avatar">
              <div className="skeleton w-10 h-10 rounded-full" />
            </div>

            <div className="chat-header mb-1">
              <div className="skeleton h-3 w-12" />
            </div>

            <div className="chat-bubble skeleton h-12 w-48" />
          </div>
        ))}
      </div>

      {/* Message Input Skeleton */}
      <div className="p-4 w-full bg-base-100 border-t border-base-300 shrink-0">
        <div className="flex items-center gap-2">
          <div className="skeleton h-10 w-10 rounded-full shrink-0" />
          <div className="skeleton h-10 w-full rounded-lg" />
          <div className="skeleton h-10 w-10 rounded-full shrink-0" />
        </div>
      </div>

    </div>
  );
};

export default ChatboxSkeleton;