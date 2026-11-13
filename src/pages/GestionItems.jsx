import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/apiConfig";
import ListaItems from "../components/ListaItems";

function GestionItems() {
    const navigate = useNavigate();
    const { token, logOut } = useAuth();

    // Formulario de creación
    const [titulo, setTitulo] = useState("");
    const [genero, setGenero] = useState("");
    const [foto, setFoto] = useState(null);
    const [claveArchivo, setClaveArchivo] = useState(0); // fuerza a limpiar el input file
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");
    const [cargando, setCargando] = useState(false);

    // Edición (modal) con su propio estado para no mezclarlo con el de creación
    const [editando, setEditando] = useState(null);
    const [tituloEdit, setTituloEdit] = useState("");
    const [generoEdit, setGeneroEdit] = useState("");
    const [fotoEdit, setFotoEdit] = useState(null);
    const [errorEdit, setErrorEdit] = useState("");
    const [guardando, setGuardando] = useState(false);

    const [recargar, setRecargar] = useState(0);

    function sesionExpirada() {
        logOut();
        navigate("/login", { replace: true });
    }

    async function leerError(respuesta, mensajePorDefecto) {
        const texto = await respuesta.text();
        return texto || mensajePorDefecto;
    }

    // ===== Crear =====
    async function manejarCrear(event) {
        event.preventDefault();
        setError("");
        setExito("");
        setCargando(true);

        try {
            const datos = new FormData();
            datos.append("titulo", titulo);
            datos.append("genero", genero);
            if (foto) datos.append("file", foto);

            // No se define Content-Type: el navegador lo calcula con el boundary
            const respuesta = await fetch(`${API_BASE_URL}/items/registro`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: datos
            });

            if (respuesta.status === 401 || respuesta.status === 403) {
                sesionExpirada();
                return;
            }
            if (!respuesta.ok) {
                throw new Error(await leerError(respuesta, "No se pudo registrar la película"));
            }

            setTitulo("");
            setGenero("");
            setFoto(null);
            setClaveArchivo((n) => n + 1);
            setExito("Película registrada con éxito");
            setRecargar((n) => n + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    // ===== Editar =====
    function abrirEdicion(pelicula) {
        setEditando(pelicula);
        setTituloEdit(pelicula.titulo);
        setGeneroEdit(pelicula.genero);
        setFotoEdit(null);
        setErrorEdit("");
    }

    function cerrarEdicion() {
        setEditando(null);
        setFotoEdit(null);
        setErrorEdit("");
    }

    async function manejarEditar(event) {
        event.preventDefault();
        setErrorEdit("");
        setGuardando(true);

        try {
            const datos = new FormData();
            datos.append("titulo", tituloEdit);
            datos.append("genero", generoEdit);
            if (fotoEdit) datos.append("file", fotoEdit);

            const respuesta = await fetch(`${API_BASE_URL}/items/${editando.id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: datos
            });

            if (respuesta.status === 401 || respuesta.status === 403) {
                sesionExpirada();
                return;
            }
            if (!respuesta.ok) {
                throw new Error(await leerError(respuesta, "No se pudo actualizar la película"));
            }

            cerrarEdicion();
            setExito("Película actualizada con éxito");
            setRecargar((n) => n + 1);
        } catch (err) {
            setErrorEdit(err.message);
        } finally {
            setGuardando(false);
        }
    }

    // ===== Cerrar sesión =====
    async function cerrarSesion() {
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.log("No se pudo invalidar el token en el servidor", err);
        }
        sesionExpirada();
    }

    return (
        <main className="login-page gestion-page">
            <span className="login-blob login-blob--uno" aria-hidden="true" />
            <span className="login-blob login-blob--dos" aria-hidden="true" />
            <span className="login-ring" aria-hidden="true" />

            <header className="gestion-cabecera">
                <section className="login-hero">
                    <h1 className="login-hero__titulo">Películas</h1>
                    <p className="login-hero__texto">
                        Agrega, edita y elimina las películas del catálogo.
                    </p>
                </section>

                <nav className="gestion-acciones">
                    <Link className="login-boton login-boton--secundario login-boton--chico" to="/perfil">
                        Mi perfil
                    </Link>
                    <button
                        className="login-boton login-boton--chico"
                        type="button"
                        onClick={cerrarSesion}
                    >
                        Cerrar sesión
                    </button>
                </nav>
            </header>

            {/* Formulario de creación */}
            <form className="login-card gestion-panel" onSubmit={manejarCrear}>
                <div className="login-card__inner">
                    <h2 className="login-card__titulo">Nueva película</h2>

                    <div className="gestion-campos">
                        <div className="login-campo">
                            <input
                                id="titulo"
                                name="titulo"
                                type="text"
                                placeholder=" "
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                required
                            />
                            <label htmlFor="titulo">Título</label>
                        </div>

                        <div className="login-campo">
                            <input
                                id="genero"
                                name="genero"
                                type="text"
                                placeholder=" "
                                value={genero}
                                onChange={(e) => setGenero(e.target.value)}
                                required
                            />
                            <label htmlFor="genero">Género</label>
                        </div>

                        <div className="login-campo login-campo--archivo">
                            <label htmlFor="foto">Póster (opcional)</label>
                            <input
                                key={claveArchivo}
                                id="foto"
                                name="foto"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFoto(e.target.files[0] || null)}
                            />
                        </div>
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
                        {cargando ? "Guardando" : "Agregar película"}
                    </button>
                </div>
            </form>

            {/* Listado */}
            <ListaItems recargar={recargar} onEditar={abrirEdicion} />

            {/* Modal de edición */}
            {editando && (
                <div className="gestion-overlay" onClick={cerrarEdicion}>
                    <form
                        className="login-card"
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={manejarEditar}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-modal"
                    >
                        <div className="login-card__inner">
                            <h2 className="login-card__titulo" id="titulo-modal">
                                Editar película
                            </h2>

                            <div className="login-campo">
                                <input
                                    id="titulo-edit"
                                    type="text"
                                    placeholder=" "
                                    value={tituloEdit}
                                    onChange={(e) => setTituloEdit(e.target.value)}
                                    required
                                />
                                <label htmlFor="titulo-edit">Título</label>
                            </div>

                            <div className="login-campo">
                                <input
                                    id="genero-edit"
                                    type="text"
                                    placeholder=" "
                                    value={generoEdit}
                                    onChange={(e) => setGeneroEdit(e.target.value)}
                                    required
                                />
                                <label htmlFor="genero-edit">Género</label>
                            </div>

                            <div className="login-campo login-campo--archivo">
                                <label htmlFor="foto-edit">Nueva foto (opcional)</label>
                                <input
                                    id="foto-edit"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFotoEdit(e.target.files[0] || null)}
                                />
                            </div>

                            <p className="login-mensaje" role="alert">{errorEdit}</p>

                            <div className="gestion-modal-acciones">
                                <button
                                    className="login-boton"
                                    type="submit"
                                    disabled={guardando}
                                    aria-busy={guardando}
                                >
                                    {guardando && <span className="login-spinner" aria-hidden="true" />}
                                    {guardando ? "Guardando" : "Guardar"}
                                </button>
                                <button
                                    className="login-boton login-boton--secundario"
                                    type="button"
                                    onClick={cerrarEdicion}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </main>
    );
}

export default GestionItems;