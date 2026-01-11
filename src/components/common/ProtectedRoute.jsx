import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useStore from '../../store/useStore';

const ProtectedRoute = () => {
    const parq = useStore((state) => state.parq);

    if (!parq.completed || (!parq.passed && !parq.disclaimerAccepted)) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
