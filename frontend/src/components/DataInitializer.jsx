import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCartItems } from '../redux/slices/cartSlice';
import { fetchWishlistItems } from '../redux/slices/wishlistSlice';

export function DataInitializer() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userInfo);

  useEffect(() => {
    if (user) {
      dispatch(fetchCartItems());
      dispatch(fetchWishlistItems());
    }
  }, [dispatch, user]);

  return null; // This component doesn't render anything
} 