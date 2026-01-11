import React, { createContext, useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import useStore from '../../store/useStore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const setAuthUser = useStore((state) => state.setAuthUser);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, [setAuthUser]);

    return (
        <AuthContext.Provider value={{ loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
