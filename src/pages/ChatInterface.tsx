import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Send } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { type ChatRoom, type Message } from '../types/chat';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ChatInterfaceProps {
  chatRooms: ChatRoom[];
}

export default function ChatInterface({ chatRooms }: ChatInterfaceProps) {
  const { chatRoomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedChatRoom = chatRooms.find(room => room._id === chatRoomId);

  useEffect(() => {
    if (!selectedChatRoom) {
      const basePath = location.pathname.includes('/reviewer') ? '/reviewer' : '/author';
      navigate(basePath);
      return;
    }

    const fetchMessages = async () => {
      try {
        setMessagesLoading(true);
        setMessages([]);
        
        const response = await axios.get(
          `${API_BASE_URL}/inf/api/events/paper/chats/messages/${selectedChatRoom._id}`
        );
        console.log(response);
        if (response.data.success) {
          setMessages(response.data.messages || []);
        } else {
          setError('Failed to fetch messages');
        }
      } catch (err) {
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : 'Failed to fetch messages';
        setError(errorMessage);
        console.error('Messages fetch error:', err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChatRoom, navigate]);

  const handleSend = async () => {
    if (!input.trim() || !selectedChatRoom || !user?.role) return;

    try {
      const ReviewerId = localStorage.getItem('reviewer_id');
      
      // Add user message to UI immediately (optimistic update)
      const newMessage: Message = {
        message: input,
        sender_type: user.role,
        createdAt: new Date().toISOString()
      };

      setMessages(prevMessages => [...prevMessages, newMessage]);
      const currentInput = input;
      setInput("");

      // Send message to backend
      const response = await axios.post(
        `${API_BASE_URL}/inf/api/events/paper/${user.role}/chats/messages/${selectedChatRoom._id}`,
        {
          ReviewerId,
          message: currentInput,
          sender: user.role,
          timestamp: new Date().toISOString()
        }
      );

      if (!response.data.success) {
        setError('Failed to send message');
        // Revert optimistic update on failure
        setMessages(prevMessages => prevMessages.slice(0, -1));
        setInput(currentInput);
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to send message';
      setError(errorMessage);
      console.error('Send message error:', err);
      // Revert optimistic update on failure
      setMessages(prevMessages => prevMessages.slice(0, -1));
      setInput(input);
    }
  };

  if (!selectedChatRoom) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-600">Chat room not found</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error: {error}</p>
          <button 
            onClick={() => setError(null)} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => {
                const basePath = location.pathname.includes('/reviewer') ? '/reviewer' : '/author';
                navigate(basePath);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm mb-1"
            >
              ← Back to chatrooms
            </button>
            <h2 className="font-semibold text-gray-800">
              {selectedChatRoom.paperTitle || `Paper ID: ${selectedChatRoom.paperId}`}
            </h2>
            <p className="text-xs text-gray-500">
              Reviewer: {selectedChatRoom.reviewerName || 'Assigned Reviewer'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            selectedChatRoom.status === 'completed' ? 'bg-green-100 text-green-700' : 
            selectedChatRoom.status === 'declined' ? 'bg-red-100 text-red-700' : 
            'bg-yellow-100 text-yellow-700'
          }`}>
            {selectedChatRoom.status}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-center">No messages yet. Start a conversation with your reviewer.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
      
            const timestamp = new Date(msg.createdAt);
            const msgTime = !isNaN(timestamp.getTime()) 
              ? timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })
              : '--:--';
            return (
              <div 
                key={msg._id || idx}
                className={`flex ${msg.sender_type === user?.role ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] p-4 rounded-xl text-sm ${
                  msg.sender_type === user?.role 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  <p>{msg.message}</p>
                  <span className={`text-[10px] block mt-2 ${
                    msg.sender_type === user?.role ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {msgTime}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area - Disabled if chat is completed or declined */}
      <div className="p-4 bg-white border-t border-gray-200">
        {selectedChatRoom.status !== 'pending' && (
          <p className="text-xs text-gray-500 mb-3 text-center">
            Chat is {selectedChatRoom.status}. No new messages can be sent.
          </p>
        )}
        <div className="relative">
          <textarea
            className="w-full bg-gray-100 border-0 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-blue-500 resize-none h-24 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={selectedChatRoom.status === 'pending' ? "Type your message here..." : "Chat is closed"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={selectedChatRoom.status !== 'pending'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && selectedChatRoom.status === 'pending') {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button 
            onClick={handleSend}
            disabled={selectedChatRoom.status !== 'pending' || !input.trim()}
            className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}