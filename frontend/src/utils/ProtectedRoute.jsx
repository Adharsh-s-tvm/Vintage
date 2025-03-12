import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'

const ProtectedRoute = () => {
    
    const { user } =  useSelector((state) => state.auth) 

  return user ? <Outlet /> : <Navigate to="/login" replace />;
    
}

export default ProtectedRoute;