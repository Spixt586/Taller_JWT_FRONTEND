import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/apiConfig";

function Registrar() {
    const navigate = useNavigate();

    const [formulario, setFormulario] = useState({
        username: "",
        password: "",
        rol: "USER"
    });
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");
    const [cargando, setCargando] = useState(false);

    function manejarCambios(event) {
        const { name, value } = event.target;
        setFormulario((anterior) => ({ ...anterior, [name]: value }));
    }

    async function manejarEnvio(event) {
        event.preventDefault();
        setError("");
        setExito("");
        setCargando(true);

        try {
            const respuesta = await fetch(`${API_BASE_URL}/registrar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formulario)
            });

            if (!respuesta.ok) {
                const texto = await respuesta.text();
                throw new Error(texto || "No se pudo registrar el usuario");
            }

            setExito("Usuario registrado. Redirigiendo al login...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setError(err.message);
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
                <h1 className="login-hero__titulo">Crea tu cuenta</h1>
                <p className="login-hero__texto">
                    Regístrate para acceder al sistema.
                </p>
            </section>

            <form className="login-card" onSubmit={manejarEnvio}>
                <div className="login-card__inner">
                    <h2 className="login-card__titulo">Registro</h2>

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
                            autoComplete="new-password"
                            value={formulario.password}
                            onChange={manejarCambios}
                            required
                        />
                        <label htmlFor="password">Contraseña</label>
                    </div>

                    <div className="login-campo login-campo--select">
                        <select
                            id="rol"
                            name="rol"
                            value={formulario.rol}
                            onChange={manejarCambios}
                        >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="INVERSIONISTA">INVERSIONISTA</option>
                        </select>
                        <label htmlFor="rol">Rol</label>
                    </div>

                    <p className="login-mensaje" role="alert">{error}</p>
                    <p className="login-mensaje login-mensaje--exito" role="status">{exito}</p>

                    <button
                        className="login-boton"
                        type="submit"
                        disabled={cargando}
                        aria-busy={cargando}
                    >
                        {cargando && <span className="login-spinner" aria-hidden="true" />}
                        {cargando ? "Registrando" : "Registrarse"}
                    </button>

                    <p className="login-pie">
                        ¿Ya tienes cuenta?{" "}
                        <Link className="login-enlace" to="/login">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </form>
        </main>
    );
}

export default Registrar;