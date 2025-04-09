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
        className="fixed bottom-4 right-4 bg-emerald-500 text-white p-3 rounded-full hover:bg-emerald-600 transition-all z-50 group"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute hidden group-hover:block right-full mr-2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
          Chat with us
        </span>
      </button>

      {userInfo && <ChatModal open={isChatOpen} onClose={() => setIsChatOpen(false)} />}
    </>
  );
}