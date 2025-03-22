import React from 'react'
import { Route, Routes } from 'react-router'
import UserLogin from '../../users/pages/UserLogin'
import UserSignUp from './UserSignUp'
import Home from '../../users/pages/Home'
import NotFound from '../../ui/NotFound'
import ProductList from './ProductListing'
import Cart from './Cart'
import WishList from './WishList'
import Orders from './UserOrders'
import UserDashboard from './UserDashboard'
import ProductDetail from './ProductDetail'
import ProtectedRoute from '../../utils/ProtectedRoute'
import Profile from './profile/UserProfile'
import EditProfile from './profile/EditProfile'
import UserAddresses from './profile/UserAddresses'
import ChangePassword from './profile/ChangePassword'
import Checkout from './Checkout'
import OrderSuccess from './OrderSuccess'
import OrderDetails from './OrderDetails'
import PaymentFailure from './PaymentFailure'
import OrderFailed from './OrderFailed';


function UserRoutes() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<UserLogin />} />
        <Route path='/signup' element={<UserSignUp />} />
        <Route path='/products/:id' element={<ProductDetail />} />
        <Route path='/products' element={<ProductList />} />
        <Route path='/*' element={<NotFound />} />

        <Route element={<ProtectedRoute />}>
          <Route path='/cart' element={<Cart />} />
          <Route path='/wishlist' element={<WishList />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/profile' element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/addresses" element={<UserAddresses />} />
          <Route path="/profile/change-password" element={<ChangePassword />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success/:orderId" element={<OrderSuccess />} />
          <Route path="/order-details/:orderId" element={<OrderDetails />} />
          <Route path="/failure/:orderId" element={<PaymentFailure />} />
          <Route path="/order-failed" element={<OrderFailed />} />
        </Route>
      </Routes>
    </>
  )
}

export default UserRoutes