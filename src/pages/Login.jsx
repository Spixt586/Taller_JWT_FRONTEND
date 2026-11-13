import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/apiConfig";
import { useAuth } from "../context/AuthContext";

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

    async function manejarSubmit(event) {
        event.preventDefault();
        setMessage("");
        setCargando(true);

        try {
            const respuesta = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
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
                    datos?.message ||
                    datos?.error ||
                    contenido ||
                    "Usuario o contraseña incorrecta"
                );
            }
            if (!datos?.token) {
                throw new Error("El servidor no devolvió un token JWT");
            }

            login(datos.token);
            localStorage.setItem("username", formulario.username);

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
                <h1 className="login-hero__titulo">Hola de nuevo</h1>
                <p className="login-hero__texto">
                    Entra con tu usuario para ver tu perfil. Tu sesión dura una hora.
                </p>
            </section>

            <section className="login-card">
                <form className="login-card__inner" onSubmit={manejarSubmit} noValidate>
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

                    <p className="login-mensaje" role="alert" aria-live="polite" key={message}>
                        {message}
                    </p>

                    <button
                        className="login-boton"
                        type="submit"
                        disabled={cargando || !formulario.username || !formulario.password}
                        aria-busy={cargando}
                    >
                        {cargando ? <span className="login-spinner" aria-hidden="true" /> : null}
                        {cargando ? "Entrando…" : "Entrar"}
                    </button>
                </form>
            </section>
        </main>
    );
}

export default Login;