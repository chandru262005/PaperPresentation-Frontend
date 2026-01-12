import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { type ChatRoom } from '../types/chat';
import ChatRoomsList from '../pages/ChatRoomsList';
import ChatInterface from '../pages/ChatInterface';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ChatWindow() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch chatrooms on component mount
  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!user?.role) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/events/papers/${user?.role}/chats`);
        console.log(response);
        if (response.data.success) {
          setChatRooms(response.data.chats || []);
        } else {
          setError('Failed to fetch chatrooms');
        }
      } catch (err) {
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : 'Failed to fetch chatrooms';
        setError(errorMessage);
        console.error('Chatrooms fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [user?.role]);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ChatRoomsList 
            chatRooms={chatRooms}
            loading={loading}
            error={error}
          />
        } 
      />
      <Route 
        path="/chat/:chatRoomId" 
        element={
          <ChatInterface chatRooms={chatRooms} />
        } 
      />
    </Routes>
  );
}