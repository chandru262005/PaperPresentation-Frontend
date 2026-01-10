import { MessageSquare, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { type ChatRoom } from '../types/chat';

interface ChatRoomsListProps {
  chatRooms: ChatRoom[];
  loading: boolean;
  error: string | null;
}

export default function ChatRoomsList({ chatRooms, loading, error }: ChatRoomsListProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleChatRoomClick = (chatRoom: ChatRoom) => {
    // Navigate relative to current route (either /reviewer or /author)
    const basePath = location.pathname.includes('/reviewer') ? '/reviewer' : '/author';
    navigate(`${basePath}/chat/${chatRoom._id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-600">Loading chatrooms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
        <h2 className="font-semibold text-gray-800">Your Chat Rooms</h2>
        <p className="text-xs text-gray-500">Select a chatroom to start messaging</p>
      </div>

      {/* Chatrooms List */}
      <div className="flex-1 overflow-y-auto">
        {chatRooms.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No chatrooms available</p>
              <p className="text-xs text-gray-400 mt-1">You don't have any assigned papers to review</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {chatRooms.map((chatRoom) => (
              <div
                key={chatRoom._id}
                onClick={() => handleChatRoomClick(chatRoom)}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <h3 className="font-medium text-gray-900">
                        {user?.role === 'reviewer' 
                          ? `User ID: ${chatRoom.userId}`
                          : `Reviewer: ${chatRoom.reviewerName || chatRoom.reviewer_id}`
                        }
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        chatRoom.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        chatRoom.status === 'declined' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {chatRoom.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Paper ID: {chatRoom.paperId}
                    </p>
                    {chatRoom.lastMessage && (
                      <p className="text-xs text-gray-500 mt-2 truncate">
                        Last message: {chatRoom.lastMessage.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {new Date(chatRoom.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}