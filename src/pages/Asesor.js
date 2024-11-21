// ./pages/Asesor.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Asesor.css';

const Asesor = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeQuote, setActiveQuote] = useState(null); // Cotización activa
    const [productDetails, setProductDetails] = useState(null); // Detalles del producto
    const token = localStorage.getItem('token');

    // Crear un objeto de audio
    const audio = new Audio('/message-alert-190042.mp3'); // Ruta sea correcta

    // Función para reproducir el sonido
    const playAudio = () => {
        audio.play();
    };

    // Función para formatear la fecha
    const formatDate = (isoDate) => {
        const date = new Date(isoDate); // Convertir la cadena ISO a un objeto Date
        const day = date.getDate().toString().padStart(2, '0'); // Día con dos dígitos
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mes con dos dígitos
        const year = date.getFullYear(); // Año
        const hours = date.getHours().toString().padStart(2, '0'); // Horas con dos dígitos
        const minutes = date.getMinutes().toString().padStart(2, '0'); // Minutos con dos dígitos
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    useEffect(() => {
        if (!token) {
            setError('Token no disponible, por favor inicie sesión.');
            setLoading(false);
            return;
        }

        const fetchQuotes = () => {
            axios.get('http://localhost:9092/traversal/api/quote/', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    if (response.data && response.data.length > 0) {
                        // Ordenar las cotizaciones por fecha, de más reciente a más antigua
                        const sortedQuotes = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));

                        // Reproducir sonido solo si hay nuevas cotizaciones
                        if (quotes.length !== sortedQuotes.length) {
                            setQuotes(sortedQuotes);
                            playAudio(); // Reproducir el sonido cuando hay nuevas cotizaciones
                        }
                        setLoading(false);
                    } else {
                        setError('No se encontraron cotizaciones.');
                        setLoading(false);
                    }
                })
                .catch(error => {
                    console.error('Error al cargar las cotizaciones', error);
                    setError('Error al cargar las cotizaciones.');
                    setLoading(false);
                });
        };

        fetchQuotes(); // Obtener cotizaciones al inicio

        // Hacer polling cada 10 segundos para obtener cotizaciones nuevas
        const intervalId = setInterval(fetchQuotes, 10000);

        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(intervalId);
    }, [token, quotes]); // Dependencia agregada para detectar cambios en quotes

    const changeState = (id, state) => {
        axios.put(`http://localhost:9092/traversal/api/quote/${id}/state`, { state }, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(() => {
                setQuotes(prevQuotes =>
                    prevQuotes.map(quote =>
                        quote.id === id ? { ...quote, state: state } : quote
                    )
                );
            })
            .catch(error => {
                console.error('Error al cambiar el estado', error);
            });
    };

    const handleResponder = (quote) => {
        if (quote.phone) {
            window.open(`https://wa.me/${quote.phone}`, '_blank');
        } else {
            window.open(`mailto:${quote.email}`, '_blank');
        }
        changeState(quote.id, 3); // Cambiar el estado a "Respondido"
    };

    const handleRechazar = (quote) => {
        changeState(quote.id, 4); // Cambiar el estado a "Rechazado"
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    const getProductDetails = (code) => {
        setLoading(true);
        setError(null);
        axios.get(`http://localhost:9092/traversal/api/product/code/${code}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(response => {
                setProductDetails(response.data); // Almacena los detalles del producto
                setLoading(false);
            })
            .catch(err => {
                console.error('Error al obtener los detalles del producto', err);
                setError('Error al obtener los detalles del producto');
                setLoading(false);
            });
    };

    return (
        <div>
            <header className="header">
                <h1>Gestión de Cotizaciones</h1>
                <button
                    className="logoutButton"
                    onClick={handleLogout}
                >
                    Cerrar sesión
                </button>
            </header>
            <div className="contentContainer">
                <div className="notificationPanel">
                    <h3>Buzón de Notificaciones</h3>
                    {loading ? (
                        <p>Cargando cotizaciones...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        quotes.map((quote) => (
                            <div
                                key={quote.id}
                                className={`notificationItem ${quote.state === 2 ? 'received' : quote.state === 3 ? 'responded' : quote.state === 4 ? 'rejected' : ''
                                    }`}
                                onClick={() => {
                                    setActiveQuote(quote);
                                    changeState(quote.id, 2);
                                    getProductDetails(quote.productCode); // Obtener detalles del producto cuando se selecciona la cotización
                                }}
                            >
                                <h4>{quote.name}</h4>
                                <p>{quote.phone}</p>
                                <p className="date">{formatDate(quote.date)}</p> {/* Formatear la fecha */}
                                <p>Estado: {['Enviado', 'Recibido', 'Respondido', 'Rechazado'][quote.state - 1]}</p>
                            </div>
                        ))
                    )}
                </div>

                {activeQuote && (
                    <div className="chatPanel">
                        <h3>Detalle de la Cotización</h3>
                        <p><strong>Nombre:</strong> {activeQuote.name}</p>
                        <p><strong>Descripción:</strong> {activeQuote.description}</p>
                        <p><strong>Fecha:</strong> {formatDate(activeQuote.date)}</p> {/* Formatear la fecha */}
                        <p><strong>Estado:</strong> {['Enviado', 'Recibido', 'Respondido', 'Rechazado'][activeQuote.state - 1]}</p>
                        <p><strong>Cantidad:</strong> {activeQuote.quantity}</p>

                        {loading && <p>Cargando detalles del producto...</p>}
                        {error && <p>{error}</p>}
                        {productDetails && (
                            <div className="productDetailsContainer">
                                <div className="productInfo">
                                    <h4>{productDetails.name}</h4>
                                    <p><strong>Tipo:</strong> {productDetails.type}</p>
                                    <p><strong>Descripción:</strong> {productDetails.description}</p>
                                    <p><strong>Precio:</strong> ${productDetails.price}</p>
                                    {productDetails.offer && <p><strong>Oferta:</strong> ${productDetails.offer}</p>}
                                </div>

                                {productDetails.imagen && (
                                    <div className="productImage">
                                        <img
                                            src={`data:image/jpeg;base64,${productDetails.imagen}`}
                                            alt="Imagen del producto"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="buttonContainer">
                            <button
                                className="button"
                                onClick={() => handleResponder(activeQuote)}
                            >
                                Responder
                            </button>
                            <button
                                className="button"
                                onClick={() => handleRechazar(activeQuote)}
                            >
                                Rechazar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Asesor;


