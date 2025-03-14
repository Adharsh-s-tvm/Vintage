import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router'

const ProtectedRoute = () => {


  const  user  = useSelector((state) => state.auth.userInfo)
  console.log("user", user);

  return user ? <Outlet /> : <Navigate to="/login" replace />;

}

export default ProtectedRoute;