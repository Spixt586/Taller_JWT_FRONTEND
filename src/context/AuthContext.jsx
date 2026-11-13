import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvaider(props) {
    const { children } = props;
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    const login = (nuevoToken) => {
        localStorage.setItem("token", nuevoToken);

        setToken(nuevoToken);
    };
    const logOut = () => {
        localStorage.removeItem("token");
        setToken(null);
    }

    return (
        <AuthContext.Provider value={{ token, login, logOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    return useContext(AuthContext);
}