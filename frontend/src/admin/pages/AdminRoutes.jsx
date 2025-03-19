import React from 'react'
import { Route, Routes } from 'react-router'
import AdminSignIn from './AdminSignIn'
// import AdminSignUp from './AdminSignUp'
import Dashboard from './Index'
import Products from './Products'
import Users from './Users'
import NotFound from '../../ui/NotFound'
import Blog from './Blog'
import { AdminLayout } from '../layout/AdminLayout'
import Brand from './Brand'
import Category from './Category'
import Orders from './Orders'
import Returns from './Returns'

function AdminRoutes() {
  return (
    <Routes>
      <Route path='/signin' element={<AdminSignIn />} />
      <Route path='/' element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path='products' element={<Products />} />
        <Route path='users' element={<Users />} />
        <Route path='brand' element={<Brand/>} />
        <Route path='category' element={<Category/>} />
        <Route path='orders' element={<Orders />} />
        <Route path='returns' element={<Returns />} />
      </Route>
      <Route path='/*' element={<NotFound redirectPageType={'admin'} />} />
      {/* <Route path='/signup' element={<AdminSignUp/>} /> */}
    </Routes>
  )
}

export default AdminRoutes