/**
 * @file server.js
 * @author {jorge.muvez[at]gmail[dot]com, carrillog.luis[at]gmail[dot]com}
 * @date 2019
 * @copyright Jorge.Muñiz.Velasquez__Luis.Carrillo.Gutiérrez__World.Connect.Perú
 */

const express = require('express'), aplicacion = express(); // INICIAR SERVIDOR EXPRESS
const cors = require('cors');
const path = require('path');
const PUERTO = process.env.PORT || 5000;

/* APLICACION MEDI-SEDA */

aplicacion.use(express.static(path.join(__dirname,'build')));
aplicacion.get('/app/*', function(req,res){
    res.sendFile(path.join(__dirname,'build','index.html'));
});

/* CORS para establecer la SEGURIDAD en la conexión y envio de los datos */
aplicacion.use(cors());
aplicacion.use(function(solicitud,respuesta,siguiente) {
    respuesta.header('Access-Control-Allow-Origin', '*');
    respuesta.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    respuesta.header('Access-Control-Allow-Headers', 'Content-Type');
    siguiente();
});

/* Estable que la comunicación de datos se generaliza al formato JSON */
aplicacion.use(express.urlencoded({ extended : false, limit : '10mb' }));
aplicacion.use(express.json({ limit : '10mb' }));

/* Sección de las rutas para publicar las API(s) */
aplicacion.use('/api/usuario', require('./src/rutas/apiUsuario.js'));
aplicacion.use('/api/sesion', require('./src/rutas/apiSesion.js'));
aplicacion.use('/api/actividad', require('./src/rutas/apiActividad.js'));
aplicacion.use('/api/continuidad', require('./src/rutas/apiMedicionContinuidad.js'));
aplicacion.use('/api/presion', require('./src/rutas/apiMedicionPresion.js'));
aplicacion.use('/api/observacion', require('./src/rutas/apiObservacion.js'));
aplicacion.use('/api/fuente', require('./src/rutas/apiFuenteAgua.js'));
aplicacion.use('/api/zona', require('./src/rutas/apiZona.js'));
aplicacion.use('/api/conexion', require('./src/rutas/apiTotalConexiones.js'));
aplicacion.use('/api/conexionprod', require('./src/rutas/apiConexionesProdAgua.js'));
aplicacion.use('/api/direccion', require('./src/rutas/apiDireccion.js'));
aplicacion.use('/api/fuentezona', require('./src/rutas/apiFuenteZona.js'));
aplicacion.use('/api/bloque', require('./src/rutas/apiBloqueUrbano.js'));
aplicacion.use('/api/impresion', require('./src/rutas/apiImpresion.js'));
aplicacion.use('/version', require('./src/rutas/apiAplicacionWeb.js'));
aplicacion.use('/reporte',require('./src/rutas/apiReporte.js'));

// Encender el servidor Express/NODEJS - en el PUERTO previamente definido (5000)
aplicacion.listen(PUERTO, () => { console.log('Servidor escuchando en el Puerto : ' + PUERTO); });
