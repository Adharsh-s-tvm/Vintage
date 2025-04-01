import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useUserAuthNavigation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      navigate('/');
    }
  }, [navigate]);

  return { navigate };
}; 