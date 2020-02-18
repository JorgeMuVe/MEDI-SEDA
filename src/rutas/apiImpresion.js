/**
 * @class Impresion(Router)
 * @file apiImpresion.js
 * @author {jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

/*
DROP TABLE IF EXISTS impresion;
DELIMITER $$
CREATE TABLE IF NOT EXISTS impresion (

paginaImpresion INTEGER UNSIGNED NOT NULL,
codigoUrbano INTEGER UNSIGNED NOT NULL,
ordenImpresion INTEGER UNSIGNED NOT NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8;
$$
DELIMITER ;
-- NUM TABLE = 14;
*/

'use strict';
const gestorRutaImpresion = require('express').Router();// INICIAR ENRUTADOR DE EXPRESS SERVER
const proveedorDeDatos = require('../conexiondb.js'); /* Conectar al POOL de CONEXIONES de la Base de Datos */

/**
 * @description Gestionar Ruta para Cantidad de Paginas (GET) "/api/impresion/paginas"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaImpresion.get('/paginas', async (solicitud, respuesta) => {
    try {
        await proveedorDeDatos.query("SELECT COUNT(DISTINCT(paginaImpresion)) as paginas FROM impresion"
        , (error, resultado) => {
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else
            respuesta.send(resultado[0]); // Enviar resultado de consulta en JSON
        })
        proveedorDeDatos.release();
    }catch(error){ respuesta.json({ error : error.code }) }  // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Eliminar un Bloque Impresion (DELETE) "/api/impresion/eliminar"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaImpresion.delete('/eliminar', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS eliminarBloqueImpresion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS eliminarBloqueImpresion (
    IN `@pagina` INTEGER UNSIGNED,
    IN `@urbano` INTEGER UNSIGNED
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    DELETE FROM impresion WHERE
    paginaImpresion=`@pagina` AND codigoUrbano=`@urbano`;

    COMMIT;
    END; $$
    DELIMITER ;
    */

    try {
        const { pagina, urbano } = solicitud.body;
        await proveedorDeDatos.query("CALL eliminarBloqueImpresion(?,?)", // Consulta a procedimiento almacenado
        [ parseInt(pagina),parseInt(urbano) ]
        , (error, resultado) => {
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else
            respuesta.send(resultado); // Enviar resultado de consulta en JSON
        })
        proveedorDeDatos.release();
    }catch(error){ respuesta.json({ error : error.code }) }  // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Agregar un Bloque Impresion (POST) "/api/impresion/agregar"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaImpresion.post('/agregar', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS agregarBloqueImpresion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS agregarBloqueImpresion (
    IN `@pagina` INTEGER UNSIGNED,
    IN `@urbano` INTEGER UNSIGNED,
    IN `@orden` INTEGER UNSIGNED
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    IF NOT EXISTS (SELECT paginaImpresion FROM impresion WHERE paginaImpresion=`@pagina` AND codigoUrbano=`@urbano`)
    THEN INSERT INTO impresion (paginaImpresion,codigoUrbano,ordenImpresion)
         VALUES (`@pagina`,`@urbano`,`@orden`);
    ELSE SELECT "0" as error;
    END IF;
    COMMIT;
    END; $$
    DELIMITER ;
    */

    try {
        const { pagina, urbano, orden } = solicitud.body;
        await proveedorDeDatos.query("CALL agregarBloqueImpresion(?,?,?)", // Consulta a procedimiento almacenado
        [ parseInt(pagina),parseInt(urbano) ,parseInt(orden) ]
        , (error, resultado) => {
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else
            respuesta.send(resultado); // Enviar resultado de consulta en JSON
        })
        proveedorDeDatos.release();
    }catch(error){ respuesta.json({ error : error.code }) }  // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Mostrar Lista Impresion por Pagina y tipo Actividad  (POST) "/api/impresion/lista"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaImpresion.post('/lista', async (solicitud, respuesta) => {
    /*
        DROP PROCEDURE IF EXISTS listaBloqueImpresionPaginaActividad;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listaBloqueImpresionPaginaActividad (
    IN `@pagina` CHAR(3)
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
    
    SET @paginaImpresion = "%";
    IF `@pagina` <> "%"
    THEN SET @paginaImpresion = CAST(`@pagina` AS INTEGER);
    END IF;

    SELECT I.paginaImpresion,I.ordenImpresion,U.codigoUrbano,FA.denominacionFuente,Z.denominacionZona,U.denominacionBloque,Z.sector,Z.subSector,Z.microSector
    FROM impresion I
    INNER JOIN bloqueUrbano U ON U.codigoUrbano = I.codigoUrbano
    INNER JOIN zona Z ON Z.codigoZona = U.codigoZona
    INNER JOIN fuenteZona FZ ON FZ.codigoZona = Z.codigoZona 
    INNER JOIN fuenteAgua FA ON FA.codigoFuente = FZ.codigoFuente  
    WHERE I.paginaImpresion LIKE @paginaImpresion
    ORDER BY I.paginaImpresion, I.ordenImpresion;

    COMMIT;
    END;
    $$
    DELIMITER ;
    */

    try {
        const { pagina } = solicitud.body;
        await proveedorDeDatos.query("CALL listaBloqueImpresionPaginaActividad(?)", // Consulta a procedimiento almacenado
        [ pagina ]
        , (error, resultado) => {
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else
            respuesta.send(resultado); // Enviar resultado de consulta en JSON
        })
        proveedorDeDatos.release();
    }catch(error){ respuesta.json({ error : error.code }) }  // Enviar error en JSON
});

/**
 * @description Verificar el Número de Procedimientos Almacenados para el módulo de Impresion (GET) "/api/impresion/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaImpresion.get('/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosImpresion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosImpresion ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total
        FROM information_schema.routines WHERE 
        specific_name='eliminarBloqueImpresion' OR
        specific_name='agregarBloqueImpresion' OR
        specific_name='listaBloqueImpresionPaginaActividad'; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [3] */
        await proveedorDeDatos.query( "CALL contarProcedimientosImpresion()",
        (error, resultado) => {
            if (error)
                respuesta.json({ "error" : error });
            else
                respuesta.json( resultado[0] );
        });
        proveedorDeDatos.release();
    } catch(errorExcepcion) { 
        respuesta.json({ "error" : errorExcepcion.code });
    }
});

module.exports = gestorRutaImpresion; //EXPORTAR FUNCIONES AL ROUTER

/*
INSERT INTO impresion (paginaImpresion,codigoUrbano,ordenImpresion) VALUES
(1,  1,  1),
(1,  2,  2),
(1,  3,  3),
(2,  4,  1),
(2,  5,  2),
(3,  6,  1),
(4,  7,  1),
(4,  8,  2),
(5,  9,  1),
(6,  10, 1),
(6,  11, 2),
(7,  12, 1),
(7,  13, 2),
(8,  14, 1),
(8,  15, 2),
(9,  16, 1),
(9,  17, 2),
(10, 18, 1),
(10, 20, 2),
(10, 19, 3),
(11, 21, 1),
(12, 22, 1),
(12, 23, 2),
(12, 32, 3), 
(13, 25, 1),
(13, 26, 2),
(14, 27, 1),
(14, 28, 2),
(14, 29, 3),
(15, 30, 1),
(15, 31, 2),
(16, 33, 1),
(16, 34, 2),
(16, 24, 3),
(17, 35, 1),
(17, 36, 2),
(17, 37, 3),
(18, 38, 1),
(18, 39, 2),
(18, 40, 3),
(18, 41, 4),
(19, 42, 1),
(19, 43, 2),
(19, 44, 3);
*/


/* BLOQUE DE IMPRESIÓN CONTINUIDAD
 N°Pg => codigoBloqueUrbano
 1 =>  (1,2,3)
 2 =>  (4,5)
 3 =>  (6)
 4 =>  (7,8)
 5 =>  (9)
 6 =>  (10,11)
 7 =>  (12,13)
 8 =>  (14,15)
 9 =>  (16,17)
 10 =>  (18,20,19)
 11 => (21)
 12 => (22,23,32)
 13 => (25,26)
 14 => (27,28,29)
 15 => (30,31)
 16 => (33,34,24)
 17 => (35,36,37)
 18 => (38,39,40,41)
 19 => (42,43,44)
*/

