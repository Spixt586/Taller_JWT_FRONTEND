import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/apiConfig";

function Perfil() {
    const navigate = useNavigate();
    const { token, logOut } = useAuth();

    const [datos, setDatos] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function cargarPerfil() {
            try {
                const respuesta = await fetch(`${API_BASE_URL}/perfil`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (respuesta.status === 401 || respuesta.status === 403) {
                    logOut();
                    navigate("/login", { replace: true });
                    return;
                }
                if (!respuesta.ok) {
                    throw new Error("No se pudo cargar el perfil");
                }

                setDatos(await respuesta.json());
            } catch (err) {
                setError(err.message);
            }
        }

        cargarPerfil();
    }, [token]);

    async function cerrarSesion() {
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.log("No se pudo invalidar el token en el servidor", err);
        }
        logOut();
        navigate("/login", { replace: true });
    }

    return (
        <main className="login-page">
            <span className="login-blob login-blob--uno" aria-hidden="true" />
            <span className="login-blob login-blob--dos" aria-hidden="true" />

            <section className="login-hero">
                <h1 className="login-hero__titulo">Tu perfil</h1>
                <p className="login-hero__texto">
                    {datos ? datos.Mensaje : "Cargando tus datos..."}
                </p>
            </section>

            <div className="login-card">
                <div className="login-card__inner">
                    <h2 className="login-card__titulo">Sesión activa</h2>

                    <p className="login-mensaje" role="alert">{error}</p>

                    {datos && (
                        <>
                            <p className="login-pie">Usuario: <strong>{datos.Usuario}</strong></p>
                            <p className="login-pie">Rol: <strong>{datos.rol_detectado}</strong></p>
                            <p className="login-pie">{datos.status}</p>
                        </>
                    )}

                    <button className="login-boton" onClick={cerrarSesion}>
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </main>
    );
}

export default Perfil;