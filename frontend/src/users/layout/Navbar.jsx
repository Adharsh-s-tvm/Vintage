import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
  LogOut,
  UserCircle,
  Wallet
} from 'lucide-react';
import { useSelector } from 'react-redux';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../ui/DropdownMenu';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { cartCountApi } from '../../services/api/userApis/cartApi';
import { wishlistCountApi } from '../../services/api/userApis/wishlistApi';

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
        <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.userInfo);
  const [storedUser, setStoredUser] = useState(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch user info from localStorage on component mount
  useEffect(() => {
    const userFromStorage = localStorage.getItem('userInfo');
    if (userFromStorage) {
      setStoredUser(JSON.parse(userFromStorage));
    }
  }, []);

  // Fetch cart count and wishlist count when component mounts and when user changes
  useEffect(() => {
    if (user || storedUser) {
      fetchCartCount();
      fetchWishlistCount();
    }
  }, [user, storedUser]);

  const fetchCartCount = async () => {
    if (user || storedUser) {
      try {
        const response = await cartCountApi();

        if (response.data && response.data.items) {
          // Calculate total quantity of all items in cart
          const totalQuantity = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalQuantity);
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartCount(0);
      }
    }
  };

  const fetchWishlistCount = async () => {
    if (user || storedUser) {
      try {
        const response = await wishlistCountApi();

        if (response.data) {
          // Set the count of wishlist items
          setWishlistCount(response.data.length || 0);
        }
      } catch (error) {
        console.error('Error fetching wishlist count:', error);
        setWishlistCount(0);
      }
    }
  };

  const categories = [
    { name: '', href: '/products' },

  ];

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('jwt');
    navigate('/login');
    window.location.reload();
    setShowLogoutConfirmation(false);
  };

  // Get current user data (either from Redux or localStorage)
  const currentUser = user || storedUser;
  
  // Create full name from first name and last name
  const getFullName = () => {
    if (!currentUser) return '';
    
    const firstName = currentUser.firstname || '';
    const lastName = currentUser.lastname || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (currentUser.email) {
      return currentUser.email.split('@')[0];
    } else {
      return 'User';
    }
  };

  // Get profile image URL
  const getProfileImage = () => {

    console.log(currentUser);
    
    if (!currentUser) return null;
    return currentUser.profileImage || currentUser.image || null;
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-900">
                VINT<span className="text-danger">AGE</span>
              </Link>
            </div>

            {/* Navigation links - desktop */}
            <nav className="hidden md:flex space-x-8">
              {categories.map((category) => (
                <a
                  key={category.name}
                  href={category.href}
                  className="text-gray-700 hover:text-primary font-medium px-3 py-2 text-sm"
                >
                  {category.name}
                </a>
              ))}
            </nav>

            {/* Check if user is logged in */}
            {user || storedUser ? (
              <div className="hidden md:flex items-center space-x-4">
                <button
                  className="p-2 text-gray-500 hover:text-primary"
                  onClick={() => setSearchOpen(!searchOpen)}
                >
                  {/* <Search className="h-5 w-5" /> */}
                </button>

                <Link to="/wishlist" className="p-2 text-gray-500 hover:text-primary relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link to="/cart" className="p-2 text-gray-500 hover:text-primary relative">
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      {/* {getProfileImage() ? (
                        <img 
                          src={getProfileImage()}
                          alt="Profile"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {getFullName().charAt(0)}
                        </div>
                      )} */}
                      <span className="text-sm font-medium">
                        {getFullName()}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>My Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>My Wishlist</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wallet')}>
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Wallet</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
              <Button onClick={() => navigate('/login')} variant="outline">
                Sign In
              </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <LogoutConfirmationModal
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={confirmLogout}
      />
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-xl font-bold text-900">
              VINT<span className="text-danger">AGE</span>
            </Link>
          </div>
  
          {/* Navigation links - desktop */}
          <nav className="hidden md:flex space-x-8">
            {categories.map((category) => (
              <a
                key={category.name}
                href={category.href}
                className="text-gray-700 hover:text-primary font-medium px-3 py-2 text-sm"
              >
                {category.name}
              </a>
            ))}
          </nav>
  
          {/* Check if user is logged in */}
          {user || storedUser ? (
            <div className="hidden md:flex items-center space-x-4">
              <button
                className="p-2 text-gray-500 hover:text-primary"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                {/* <Search className="h-5 w-5" /> */}
              </button>
  
              <Link to="/wishlist" className="p-2 text-gray-500 hover:text-primary relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
  
              <Link to="/cart" className="p-2 text-gray-500 hover:text-primary relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
  
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    {/* {getProfileImage() ? (
                      <img 
                        src={getProfileImage()}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {getFullName().charAt(0)}
                      </div>
                    )} */}
                    <span className="text-sm font-medium">
                      {getFullName()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>My Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>My Wishlist</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wallet')}>
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Wallet</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
            <Button onClick={() => navigate('/login')} variant="outline">
              Sign In
            </Button>
            </>
          )}
        </div>
      </div>
  
      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96' : 'max-h-0'} overflow-hidden bg-white`}>
        <div className="px-4 py-2 space-y-3">
          {/* User Profile Section for Mobile */}
          {currentUser && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg animate-fade-in">
              <UserCircle className="h-8 w-8 text-gray-600" />
              <div>
                <p className="font-medium text-sm">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
            </div>
          )}
  
          {/* Navigation Links */}
          <div className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {category.name}
              </Link>
            ))}
          </div>
  
          {/* Mobile Actions */}
          <div className="space-y-2 border-t pt-2">
            <Link to="/cart" className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded-lg">
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/wishlist" className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded-lg">
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg"
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
