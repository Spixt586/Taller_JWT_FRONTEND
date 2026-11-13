import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/apiConfig";

function ListaItems({ recargar, onEditar }) {
    const navigate = useNavigate();
    const { token, logOut } = useAuth();

    const [items, setItems] = useState([]);
    const [imagenes, setImagenes] = useState({});
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    // Guarda las Object URL creadas para poder liberarlas
    const urlsRef = useRef([]);

    function liberarUrls() {
        urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        urlsRef.current = [];
    }

    function sesionExpirada() {
        logOut();
        navigate("/login", { replace: true });
    }

    useEffect(() => {
        let cancelado = false;

        async function cargarImagenes(lista) {
            const nuevas = {};

            await Promise.all(
                lista.map(async (p) => {
                    try {
                        const respuesta = await fetch(`${API_BASE_URL}/items/${p.id}/foto`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (!respuesta.ok) return;

                        const blob = await respuesta.blob();
                        // Sin foto el backend puede responder vacío o application/octet-stream
                        if (blob.size === 0 || !blob.type.startsWith("image/")) return;

                        const url = URL.createObjectURL(blob);
                        urlsRef.current.push(url);
                        nuevas[p.id] = url;
                    } catch {
                        // Sin foto: se mostrará el recuadro "Sin imagen"
                    }
                })
            );

            if (!cancelado) setImagenes(nuevas);
        }

        async function cargar() {
            setCargando(true);
            setError("");

            try {
                const respuesta = await fetch(`${API_BASE_URL}/items`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (respuesta.status === 401 || respuesta.status === 403) {
                    sesionExpirada();
                    return;
                }
                if (!respuesta.ok) {
                    throw new Error("No se pudo obtener el listado");
                }

                const datos = await respuesta.json();
                if (cancelado) return;

                liberarUrls();
                setImagenes({});
                setItems(datos);
                setCargando(false);
                cargarImagenes(datos);
            } catch (err) {
                if (!cancelado) {
                    setError(err.message);
                    setCargando(false);
                }
            }
        }

        cargar();

        return () => {
            cancelado = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recargar, token]);

    // Liberar memoria al desmontar
    useEffect(() => liberarUrls, []);

    async function eliminar(id) {
        if (!window.confirm("¿Eliminar esta película?")) return;
        setError("");

        try {
            const respuesta = await fetch(`${API_BASE_URL}/items/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (respuesta.status === 401 || respuesta.status === 403) {
                sesionExpirada();
                return;
            }
            if (!respuesta.ok) {
                throw new Error("No se pudo eliminar la película");
            }

            setItems((anterior) => anterior.filter((p) => p.id !== id));
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <section className="gestion-lista" aria-label="Listado de películas">
            <p className="login-mensaje" role="alert">{error}</p>

            {cargando && <p className="gestion-vacio">Cargando películas...</p>}

            {!cargando && !error && items.length === 0 && (
                <p className="gestion-vacio">Aún no hay películas registradas.</p>
            )}

            <div className="gestion-grid">
                {items.map((p) => (
                    <article className="pelicula-card" key={p.id}>
                        {imagenes[p.id] ? (
                            <img
                                className="pelicula-card__img"
                                src={imagenes[p.id]}
                                alt={`Póster de ${p.titulo}`}
                            />
                        ) : (
                            <div className="pelicula-card__img pelicula-card__img--vacia">
                                Sin imagen
                            </div>
                        )}

                        <div className="pelicula-card__cuerpo">
                            <h3 className="pelicula-card__titulo">{p.titulo}</h3>
                            <p className="pelicula-card__genero">{p.genero}</p>

                            <div className="pelicula-card__acciones">
                                <button
                                    className="login-boton login-boton--chico"
                                    type="button"
                                    onClick={() => onEditar(p)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="login-boton login-boton--chico login-boton--peligro"
                                    type="button"
                                    onClick={() => eliminar(p.id)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default ListaItems;