import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        async function checkAuth() {

            try {

                const response = await fetch(
                    "http://localhost:5050/api/auth/me",
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );


                const data = await response.json();


                if (response.ok && data.user) {
                    setUser(data.user);
                }
                else {
                    setUser(null);
                }


            } catch (error) {

                console.error("Authentication check failed:", error);
                setUser(null);

            } finally {

                setLoading(false);

            }

        }


        checkAuth();

    }, []);



    function login(userData) {

        setUser(userData);

    }



    async function logout() {

        try {

            await fetch(
                "http://localhost:5050/api/auth/logout",
                {
                    method: "POST",
                    credentials: "include"
                }
            );


        } catch (error) {

            console.error("Logout failed:", error);

        }


        setUser(null);

    }



    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );

}