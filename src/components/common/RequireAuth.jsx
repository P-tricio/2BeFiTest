import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useStore from '../../store/useStore';

const RequireAuth = () => {
    const user = useStore((state) => state.user);

    if (!user || !user.uid) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default RequireAuth;
