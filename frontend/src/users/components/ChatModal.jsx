import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { useSelector } from 'react-redux';
import { API } from '../../services/api/api'


const RECIEVER_ID = import.meta.env.VITE_REACT_APP_ADMIN_ID; 
const RECIEVER_IDd = import.meta.env.VITE_RAZORPAY_KEY_ID; 
export default function ChatModal({ open, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { userInfo } = useSelector((state) => state.auth);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await API.get('/chat/user/messages');
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();    
    if (!newMessage.trim()) return;

    try {
      const response = await API.post('/chat/user/messages', {
        text: newMessage,
        receiverId: RECIEVER_ID, // Set this in your environment variables
        time: new Date(),
      });

      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Chat with Admin</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">
              No messages yet. Start a conversation!
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.senderId === userInfo._id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.senderId === userInfo._id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  <p>{message.text}</p>
                  <span className="text-xs opacity-75">
                    {new Date(message.time).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}