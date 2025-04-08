import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatModal from './ChatModal';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function FloatingChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleChatClick = () => {
    if (!userInfo) {
      toast.error('Please login to access chat');
      navigate('/login');
      return;
    }
    setIsChatOpen(true);
  };

  return (
    <>
      <button
        onClick={handleChatClick}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {userInfo && <ChatModal open={isChatOpen} onClose={() => setIsChatOpen(false)} />}
    </>
  );
}