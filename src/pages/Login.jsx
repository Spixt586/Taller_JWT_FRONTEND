import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/apiConfig";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formulario, setFormulario] = useState({
        username: "",
        password: ""
    });
    const [message, setMessage] = useState("");
    const [cargando, setCargando] = useState(false);

    function manejarCambios(event) {
        const { name, value } = event.target;
        setFormulario((anterior) => ({
            ...anterior,
            [name]: value
        }));
    }

    async function manejarEnvio(event) {
        event.preventDefault();
        setMessage("");
        setCargando(true);

        try {
            const respuesta = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formulario)
            });

            const contenido = await respuesta.text();
            let datos = null;
            try {
                datos = contenido ? JSON.parse(contenido) : null;
            } catch {
                datos = null;
            }

            if (!respuesta.ok) {
                throw new Error(
                    datos?.message || datos?.error || contenido || "Usuario o contraseña incorrecta"
                );
            }
            if (!datos?.token) {
                throw new Error("El servidor no devolvió un token JWT");
            }

            login(datos.token);
            navigate("/perfil");
        } catch (error) {
            setMessage(error.message);
        } finally {
            setCargando(false);
        }
    }

    return (
        <main className="login-page">
            <span className="login-blob login-blob--uno" aria-hidden="true" />
            <span className="login-blob login-blob--dos" aria-hidden="true" />
            <span className="login-ring" aria-hidden="true" />

            <section className="login-hero">
                <h1 className="login-hero__titulo">Bienvenido de nuevo</h1>
                <p className="login-hero__texto">
                    Ingresa con tu cuenta para ver tu perfil.
                </p>
            </section>

            <form className="login-card" onSubmit={manejarEnvio}>
                <div className="login-card__inner">
                    <h2 className="login-card__titulo">Iniciar sesión</h2>

                    <div className="login-campo">
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder=" "
                            autoComplete="username"
                            value={formulario.username}
                            onChange={manejarCambios}
                            required
                        />
                        <label htmlFor="username">Usuario</label>
                    </div>

                    <div className="login-campo">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder=" "
                            autoComplete="current-password"
                            value={formulario.password}
                            onChange={manejarCambios}
                            required
                        />
                        <label htmlFor="password">Contraseña</label>
                    </div>

                    <p className="login-mensaje" role="alert">{message}</p>

                    <button
                        className="login-boton"
                        type="submit"
                        disabled={cargando}
                        aria-busy={cargando}
                    >
                        {cargando && <span className="login-spinner" aria-hidden="true" />}
                        {cargando ? "Ingresando" : "Iniciar sesión"}
                    </button>

                    <p className="login-pie">
                        ¿No tienes cuenta?{" "}
                        <Link className="login-enlace" to="/registrar">
                            Regístrate
                        </Link>
                    </p>
                </div>
            </form>
        </main>
    );
}

export default Login;