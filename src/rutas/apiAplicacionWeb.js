/**
 * @class AplicationWeb(Router)
 * @file apiAplicacionWeb.js
 * @author {carrillog.luis[at]gmail[dot]com,jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Luis.Carrillo.Gutiérrez__Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

/* 
DROP TABLE IF EXISTS bitacora;
DELIMITER $$

CREATE TABLE IF NOT EXISTS bitacora (
firmaDigital CHAR(32) CHARACTER SET latin1 NOT NULL,
tablaAfectada TINYINT(1) UNSIGNED NOT NULL,
codigoAfectado VARCHAR(20) CHARACTER SET latin1 NOT NULL,
operacionRealizada TINYINT(1) UNSIGNED NOT NULL,
fechaHoraOperacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP

) ENGINE=MyISAM DEFAULT CHARSET=latin1;
$$
DELIMITER ;
-- NUM TABLA = 0;
-- NUM PROCE = 1;
*/

'use strict';
const gestorRutaAplicacionWeb = require('express').Router();
const proveedorDeDatos = require('../conexiondb.js');

/**
 * @description Gestionar Ruta para Obtener la versión del Gestor de Base de Datos, como mecanismo de comprobación de respuesta "/version/repositorio"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaAplicacionWeb.get('/repositorio', async (solicitud, respuesta) => {
    try {
        await proveedorDeDatos.query( "SELECT version() AS version", 
            (error, resultado) => {
                if (error)
                    respuesta.json({ "error" : error }); /* Mensaje de Error provisto por el Motor de Base de Datos */
                else
                    respuesta.json( resultado[0] );
            }
        );
        proveedorDeDatos.release(); /* Liberar la conexión usada del POOL de conexiones */
    } catch(errorExcepcion) {
        respuesta.json({ "error" : errorExcepcion.code }); /* Mensaje de Error provisto por NodeJS */
    }
});

/**
 * @description Gestionar Ruta para Obtener la versión referencial del Aplicativo Web MEDISEDA (GET) "/version/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaAplicacionWeb.get('/', async (solicitud, respuesta) => {
    try {
        await proveedorDeDatos.query( "SELECT 'v0.0.1' AS version", 
            (error, resultado) => {
                if (error)
                    respuesta.json({ "error" : error });
                else
                    respuesta.json( resultado[0] );
            }
        );
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        respuesta.json({ "error" : errorExcepcion.code });
    }
});

/**
 * @description gestionar la ruta "/version/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaAplicacionWeb.get('/datos', async (solicitud, respuesta) => {
    try {
        await proveedorDeDatos.query( "SELECT version() as versionDB, 'v0.0.1' AS versionApp", 
            (error, resultado) => {
                if (error)
                    respuesta.json({ "error" : error });
                else
                    respuesta.json( resultado[0] );
            }
        );
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        respuesta.json({ "error" : errorExcepcion.code });
    }
});

/**
 * @description gestionar la ruta (POST) "/version/bitacora"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaAplicacionWeb.post('/bitacora', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarOperacionesPorUsuario;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarOperacionesPorUsuario (
        IN `@usuario` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        SELECT tablaAfectada, codigoAfectado, operacionRealizada, DATE_FORMAT(fechaHoraEvento,'%d/%m/%Y') as fecha, DATE_FORMAT(fechaHoraEvento,'%H:%i') as hora
        FROM bitacora WHERE BINARY firmaDigital = `@usuario`;
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { 
            respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); 
        } else await proveedorDeDatos.query( "CALL listarOperacionesPorUsuario(?)", [operador],
            (error, resultado) => {
                if (error)
                    respuesta.json({ "error" : error });
                else
                    respuesta.json( resultado[0] );
            }
        );
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        respuesta.json({ "error" : errorExcepcion.code });
    }
});


/**
 * @description gestionar la ruta (GET) "/version/bitacora/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaAplicacionWeb.get('/bitacora/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosBitacora;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosBitacora ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total
        FROM information_schema.routines
        WHERE specific_name='listarOperacionesPorUsuario'; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [1] */
        await proveedorDeDatos.query("CALL contarProcedimientosBitacora()",
            (error, resultado) => {
                if (error)
                    respuesta.json({ "error" : error });
                else
                    respuesta.json( resultado[0] );
            }
        );
        proveedorDeDatos.release();
    } catch(errorExcepcion) { 
        respuesta.json({ "error" : errorExcepcion.code });
    }
});


module.exports = gestorRutaAplicacionWeb;