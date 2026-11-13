import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/apiConfig';

function Perfil() {
	const [datosPerfil, setDatosPerfil] = useState(null);
	const [error, setError] = useState('');

	const { token, logOut } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const cargarPerfil = async () => {
			try{
				const response = await fetch(`${API_BASE_URL}/auth/perfil`, {
					headers: {
						'Authorization': `Bearer ${token}`
					}
				});

				if (!response.ok) {
					throw new Error('No se pudo cargar Perfil, inicie sesión nuevamente');
				}

				const datos = await response.json();
				setDatosPerfil(datos);
			} catch (err) {
				setError(err.message);
			}
		};
		
		cargarPerfil();
	}, [token]);

	const manejarLogout = async () => {
		try{
			await fetch(`${API_BASE_URL}/auth/logout`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
		} catch (err) {
			console.log('Error al intentar revocar el token. ' + err)
		}

		logOut();
		navigate('/login')
	}
	return(
		<div>
			<div>
				<h2>Perfil Usuario</h2>
				<button onClick={manejarLogout}>Cerrar Sesión</button>
			</div>

			{error && <p>{error}</p>}
			
			{datosPerfil && (
				<div>
					<p>{datosPerfil.Mensaje}</p>
					<p>{datosPerfil.Usuario}</p>
					<p>{datosPerfil.Rol}</p>
					<p>{datosPerfil.Estatus}</p>
				</div>
			)}
		</div>
	)
}

export default Perfil