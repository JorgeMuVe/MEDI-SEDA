/**
 * @class Observacion(Router)
 * @file apiObservacion.js
 * @author {carrillog.luis[at]gmail[dot]com,jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Luis.Carrillo.Gutiérrez__Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

/*
DROP TABLE IF EXISTS observacion; 
DELIMITER $$
CREATE TABLE IF NOT EXISTS observacion (
    codigoObservacion INTEGER UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT, 
    codigoActividad INTEGER UNSIGNED NOT NULL,
    tipoActividad TINYINT(1) UNSIGNED NOT NULL, -- 0 Continuidad  -- 1 Presion 
    tipoObservacion TINYINT(1) UNSIGNED NOT NULL DEFAULT 0, -- abbreviation CHAR(3) NOT NULL,
    textoObservacion VARCHAR(80) NOT NULL, -- previouslyUsed BINARY(1) NOT NULL DEFAULT 0,
    habilitado BINARY(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8; 
$$
DELIMITER ;
-- NUM TABLA = 13;
-- NUM PROCE = 3;
*/

'use strict';
const gestorRutaObservacion = require('express').Router();// INICIAR ENRUTADOR DE EXPRESS SERVER
const proveedorDeDatos = require('../conexiondb.js'); //CONEXIÓN A BASE DE DATOS

/**
 * @description Gestionar Ruta para Listar los datos referidos a una OBSERVACION acontecida en una ACTIVIDAD (GET) "/api/observacion/:actividad"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaObservacion.get('/actividad/:actividad', async function(solicitud, respuesta) { 
    /*
    DROP PROCEDURE IF EXISTS buscarObservacion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS buscarObservacion (
    IN `@actividad` INTEGER UNSIGNED 
    ) BEGIN

        SELECT codigoObservacion,textoObservacion
        FROM observacion
        WHERE codigoActividad LIKE `@actividad` AND HEX(UNHEX(habilitado))='01';
        
    END;
    $$
    DELIMITER ;
    */
    try {     
        await proveedorDeDatos.query("CALL buscarObservacion(?)", solicitud.params.actividad  // Consulta a procedimiento almacenado
        , (error, resultado) => { 
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else{
                if(resultado[0][0])
                respuesta.json( resultado[0][0] ); // Enviar resultado de consulta en JSON 
                else
                respuesta.json({ error : "vacio" }); // Enviar error en JSON
            }
        }); 
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    } catch(error) { respuesta.json({ error : error.code }) } // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Registrar una OBSERVACION para una Actividad determinada (POST) "/api/observacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaObservacion.post('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS agregarObservacion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS agregarObservacion (

    IN `@actividad` INTEGER UNSIGNED,
    IN `@tipo` TINYINT(1), 
    IN `@observacion` VARCHAR(80),
    IN `@quien` CHAR(32) CHARACTER SET utf8

    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    INSERT INTO observacion(codigoActividad,tipoActividad,tipoObservacion,textoObservacion) 
    VALUES (`@actividad`,`@tipo`,0, `@observacion`);
    SET @tmp = LAST_INSERT_ID();
    INSERT INTO bitacora VALUES (`@quien`, 13, @tmp, 0, CURRENT_TIMESTAMP);

    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        const { codigoActividad,tipoActividad,textoObservacion,quien } = solicitud.body;
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }) } 
        else await proveedorDeDatos.query("CALL agregarObservacion(?,?,?,?)",  // Consulta a procedimiento almacenado
                                    [   codigoActividad,
                                        tipoActividad,
                                        textoObservacion,
                                        quien ]
        , (error, resultado) => {
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else
            respuesta.send(resultado);  // Enviar resultado de consulta en JSON
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    } catch(error) { respuesta.json({ error : error.code }) } // Enviar error en JSON
});

/**
 * @description gestionar la ruta (PUT) "/api/observacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaObservacion.put('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS modificarObservacion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarObservacion (

    IN `@codigo` INTEGER UNSIGNED, 
    IN `@observacion` VARCHAR(80),
    IN `@quien` CHAR(32) CHARACTER SET utf8

    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    UPDATE observacion 
    SET textoObservacion = `@observacion`
    WHERE codigoObservacion = `@codigo`;

    INSERT INTO bitacora VALUES (`@quien`, 13, `@codigo`, 2, CURRENT_TIMESTAMP);

    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        const {codigoObservacion, textoObservacion,quien } = solicitud.body;
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }) } 
        else await proveedorDeDatos.query("CALL modificarObservacion(?,?,?)",  // Consulta a procedimiento almacenado
                                        [   codigoObservacion,
                                            textoObservacion,
                                            quien ]
        , (error, resultado) => {
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else
            respuesta.send(resultado);  // Enviar resultado de consulta en JSON
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    } catch(error) { respuesta.json({ error : error.code }) } // Enviar error en JSON
});

/**
 * @description Verificar el Número de Procedimientos Almacenados para el módulo OBSERVACION gestionado con la ruta (GET) "/api/observacion/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaObservacion.get('/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosObservacion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosObservacion ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total
        FROM information_schema.routines
        WHERE specific_name='buscarObservacion' OR
              specific_name='agregarObservacion' OR
              specific_name='modificarObservacion'; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [3] */
        await proveedorDeDatos.query( "CALL contarProcedimientosObservacion()",
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

module.exports = gestorRutaObservacion; //EXPORTAR FUNCIONES AL ROUTER
