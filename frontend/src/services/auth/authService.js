import { clearCartState } from '../redux/slices/cartSlice';

export const handleLogout = () => {
  return async (dispatch) => {
    try {
      // Clear local storage
      localStorage.removeItem('jwt');
      localStorage.removeItem('userInfo');
      
      // Clear cart state
      dispatch(clearCartState());
      
      // Any other logout logic...
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
};