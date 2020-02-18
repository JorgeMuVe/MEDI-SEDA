/**
 * @class FuenteZona(Router)
 * @file apiFuenteZona.js
 * @author {carrillog.luis[at]gmail[dot]com,jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Luis.Carrillo.Gutiérrez__Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

/*
DROP TABLE IF EXISTS fuenteZona;
DELIMITER $$
CREATE TABLE IF NOT EXISTS fuenteZona (
    codigoFuenteZona INTEGER UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
	codigoFuente INTEGER UNSIGNED NOT NULL,
    codigoZona INTEGER UNSIGNED NOT NULL,
	datoProvisto BINARY(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
$$
DELIMITER ;

ALTER TABLE fuenteZona ADD CONSTRAINT UNIQUE KEY (codigoFuente, codigoZona);
-- NUM TABLA = 4;
-- NUM PROCE = 2;
*/

'use strict';
const gestorRutaFuenteZona = require('express').Router();
const proveedorDeDatos = require('../conexiondb.js');

/**
 * @description Gestionar Ruta para Listar las relaciones de Zona y Fuente de Agua para Paginado (POST) "/api/fuentezona/paginado"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaFuenteZona.post('/paginado', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarFuenteZonaPaginado;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarFuenteZonaPaginado (
        IN `@inicio` INTEGER UNSIGNED,
        IN `@resultados` INTEGER UNSIGNED
     ) 
    BEGIN
        SELECT F.codigoFuenteZona, F.codigoFuente, Z.codigoZona, Z.sector, Z.subSector, Z.microSector
        FROM fuenteZona F
        INNER JOIN zona Z ON F.codigoZona=Z.codigoZona
        ORDER BY Z.sector ASC, Z.subSector ASC, Z.microSector ASC LIMIT `@inicio`,`@resultados`;;
    END;
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query( "CALL listarFuenteZonaPaginado(?,?)",
        [ parseInt(solicitud.body.inicio), parseInt(solicitud.body.resultados)],
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

/**
 * @description Gestionar Ruta para Establecer las relaciones entre una Fuente de Agua y una Zona Comercial (POST) "/api/fuenteZona/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaFuenteZona.post('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS establecerRelacionFuenteZona;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS establecerRelacionFuenteZona (
        IN `@fuente` INTEGER UNSIGNED,
        IN `@zona` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    IF NOT EXISTS (SELECT * from fuenteZona where codigoFuente = `@fuente` AND codigoZona = `@zona`)
    THEN 
        INSERT INTO fuenteZona (codigoFuente,codigoZona,datoProvisto) VALUES (`@fuente`, `@zona`, HEX(1));
        INSERT INTO bitacora VALUES (`@quien`, 4, CONCAT(`@fuente`,'-',`@zona`), 0, CURRENT_TIMESTAMP);
         SELECT "REGISTRADO" registrado;
    ELSE SELECT "ERROR" error;
    END IF;    

    COMMIT;
    END;
    $$
    DELIMITER ;
    */ 
    try {
        const { fuente, zona , firma } = solicitud.body;
        if (firma.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL establecerRelacionFuenteZona(?, ?, ?)", 
            [ parseInt(fuente), parseInt(zona), firma ],
            (error, resultado) => {
                if (error)
                    respuesta.json({ "error" : error });
                else
                    respuesta.json( resultado[0] );
            }
        );
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    } catch(errorExcepcion) { respuesta.json({ "error" : errorExcepcion.code })}
});

/**
 * @description Gestionar Ruta para Cambiar relacion entre una Fuente de Agua y una Zona Comercial (PUT) "/api/fuenteZona/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaFuenteZona.put('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS modificarRelacionFuenteZona;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarRelacionFuenteZona (
        IN `@codigo` INTEGER UNSIGNED,
        IN `@fuente` INTEGER UNSIGNED,
        IN `@zona` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    IF NOT EXISTS (SELECT * from fuenteZona where codigoFuente = `@fuente` AND codigoZona = `@zona`)
    THEN 
        UPDATE fuenteZona SET codigoFuente = `@fuente`, codigoZona = `@zona` WHERE codigoFuenteZona = `@codigo`;
        INSERT INTO bitacora VALUES (`@quien`, 4, CONCAT(`@codigo`,'-',`@fuente`,'-',`@zona`), 2, CURRENT_TIMESTAMP);
         SELECT "MODIFICADO" registrado;
    ELSE SELECT "ERROR" error;
    END IF;    

    COMMIT;
    END;
    $$
    DELIMITER ;
    */ 
    try {
        const { codigo, fuente, zona , firma } = solicitud.body;
        if (firma.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL modificarRelacionFuenteZona(?, ?, ?, ?)", 
            [ codigo, parseInt(fuente), parseInt(zona), firma ],
            (error, resultado) => {
                if (error)
                    respuesta.json({ "error" : error });
                else
                    respuesta.json( resultado[0] );
            }
        );
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    } catch(errorExcepcion) { respuesta.json({ "error" : errorExcepcion.code })}
});

/**
 * @description Gestionar Ruta para Eliminar la relación existente en una Fuente de Agua y una Zona Comercial (DELETE) "/api/fuenteZona/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaFuenteZona.delete('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS eliminarRelacionFuenteZona;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS eliminarRelacionFuenteZona (
        IN `@fuente` INTEGER UNSIGNED,
        IN `@zona` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    -- DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    -- START TRANSACTION;
        DELETE FROM fuenteZona WHERE codigoFuente=`@fuente` AND codigoZona=`@zona`;
        -- UPDATE fuenteZona SET habilitado = HEX(1) WHERE codigoFuenteZona = `@codigo`;
        INSERT INTO bitacora VALUES (`@quien`, 4, CONCAT(`@fuente`,'-',`@zona`), 3, CURRENT_TIMESTAMP);
    -- COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        let fuente = solicitud.body.fuente;
        let zona = solicitud.body.zona;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        await proveedorDeDatos.query( "CALL eliminarRelacionFuenteZona(?, ?, ?)", 
            [
                parseInt(fuente), 
                parseInt(zona),
                operador
            ],
            (error, resultado) => {
                if (error)
                    respuesta.json({ "error" : error });
                else
                    respuesta.json( resultado[0] );
            }
        );
    } catch(errorExcepcion) { 
        respuesta.json({ "error" : errorExcepcion.code });
    }
});

/**
 * @description Gestionar Ruta para Rellenar Datos a Fuente de Zona (GET) "/api/conexion/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */

gestorRutaFuenteZona.post('/rellenar', async (solicitud, respuesta) => { 
    /*
    DROP PROCEDURE IF EXISTS rellenarDeExcel_FuenteZona;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS rellenarDeExcel_FuenteZona (
    IN `@fuente` INTEGER UNSIGNED,
    IN `@zona` VARCHAR(80),
    IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    INSERT INTO fuenteZona(codigoFuente, codigoZona, datoProvisto)
    VALUES (`@fuente`, `@zona`, HEX(1));
    INSERT INTO bitacora VALUES (`@quien`, 4, CONCAT(`@fuente`,'-',`@zona`), 0, CURRENT_TIMESTAMP);

    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    const { codigoFuente,codigoZona,quien } = solicitud.body;
    try {   
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL rellenarDeExcel_FuenteZona(?,?,?)", 
            [ codigoFuente,codigoZona,quien ],
            (error, resultado) => { 
                if (error)
                    respuesta.json({ "error" : error });
                else
                    respuesta.json( resultado[0] );
        }); 
    } catch(errorExcepcion) { 
        respuesta.json({ "error" : errorExcepcion.code });
    }
});

/**
 * @description Verificar el Número de Procedimientos Almacenados para el módulo de RELACION entre Fuentes de Agua y Zonas Comercial (GET) "/api/fuenteZona/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaFuenteZona.get('/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosFuenteZona;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosFuenteZona ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total FROM information_schema.routines
        WHERE specific_name='establecerRelacionFuenteZona' OR specific_name='agregarActividad'; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [2] */
        await proveedorDeDatos.query( "CALL contarProcedimientosFuenteZona()",
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

module.exports = gestorRutaFuenteZona;

/** DATOS DE LA RELACION DE FUENTE CON ZONA
TRUNCATE fuenteZona;

CALL rellenarDeExcel_FuenteZona(1, 1,  '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(1, 2,  '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(1, 3,  '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(1, 4,  '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(1, 5,  '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(1, 6,  '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(1, 7,  '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(1, 8,  '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(2, 9,  '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(2, 10, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(2, 11, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(2, 12, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(2, 13, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(2, 14, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(2, 15, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(2, 16, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(2, 17, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(3, 18, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(3, 19, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(3, 20, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(3, 21, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(3, 22, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 23, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 24, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 25, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 26, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(2, 27, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(2, 28, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(2, 29, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(2, 30, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(2, 31, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 32, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 33, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 34, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 35, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 36, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 37, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 38, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 39, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(5, 40, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 41, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 42, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 43, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 44, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 45, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 46, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 47, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 48, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 49, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 50, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 51, '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteZona(4, 52, '00000000000000000000000000000001');

*/
