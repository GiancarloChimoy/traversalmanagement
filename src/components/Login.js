// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import './Login.css'; 
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importar la función correctamente

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Hook para redirigir

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Hacer la solicitud POST para el login
            const response = await axios.post('http://localhost:9092/traversal/api/auth/login', {
                email: email,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Verificar si el servidor ha devuelto un JWT (suponiendo que la respuesta es un token)
            if (response && response.data) {
                const jwtToken = response.data; // Guardar el token
                localStorage.setItem('token', jwtToken); // Guardar el token en localStorage

                // Decodificar el token para obtener los datos
                const decoded = jwtDecode(jwtToken);
                
                // Redirigir según el valor de `type`
                if (decoded.type === 1) {
                    navigate('/admin'); // Redirigir a Admin.js
                } else if (decoded.type === 2) {
                    navigate('/asesor'); // Redirigir a Asesor.js
                } else {
                    setError('Tipo de usuario desconocido');
                }
            }
        } catch (error) {
            // Manejo de error: mostramos el mensaje de error correctamente
            if (error.response) {
                setError(error.response.data || 'Error al iniciar sesión. Verifique sus credenciales');
            } else {
                setError('Error de conexión o inesperado');
            }
        }
    };

    return (
        <div className="container">
            <h2 className="title">Iniciar Sesión</h2>
            <form onSubmit={handleLogin} className="form">
                <div className="inputGroup">
                    <label className="label">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input"
                    />
                </div>
                <div className="inputGroup">
                    <label className="label">Contraseña:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="input"
                    />
                </div>
                <button type="submit" className="button">Iniciar Sesión</button>
            </form>

            {/* Mostrar mensaje de error si lo hay */}
            {error && <p className="error">{error}</p>}
        </div>
    );
}


export default Login;
