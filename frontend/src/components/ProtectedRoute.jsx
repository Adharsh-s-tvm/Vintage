import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('jwt');
    const userInfo = localStorage.getItem('userInfo');

    if (!token || !userInfo) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute; 