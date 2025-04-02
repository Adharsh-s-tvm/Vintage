import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearUserInfo } from '../redux/slices/authSlice';
import { toast } from 'sonner';

export const useBlockedStatus = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleBlockedUser = () => {
    dispatch(clearUserInfo());
    localStorage.removeItem('userInfo');
    localStorage.removeItem('jwt');
    navigate('/login');
    toast.error('Your account has been blocked. Contact support for assistance.');
  };

  return { handleBlockedUser };
}; 