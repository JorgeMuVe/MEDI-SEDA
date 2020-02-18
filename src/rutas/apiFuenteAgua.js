/**
 * @class FuenteAgua(Router)
 * @file apiFuenteAgua.js
 * @author {carrillog.luis[at]gmail[dot]com,jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Luis.Carrillo.Gutiérrez__Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

/*
DROP TABLE IF EXISTS fuenteAgua;
DELIMITER $$
CREATE TABLE IF NOT EXISTS fuenteAgua (
    codigoFuente INTEGER UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    denominacionFuente VARCHAR(80) NOT NULL,
    datoProvisto BINARY(1) NOT NULL DEFAULT 0,
    habilitado BINARY(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
$$
DELIMITER ;
-- NUM TABLE = 3;
-- NUM PROCE = 8;
*/

'use strict';
const gestorRutaFuenteAgua = require('express').Router();
const proveedorDeDatos = require('../conexiondb.js');

/**
 * @description Gestionar Ruta para Listar las FUENTES de Agua registradas (para un COMPONENTE) (GET) "/api/fuente"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaFuenteAgua.get('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarFuentesDeAguaParaComponente;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarFuentesDeAguaParaComponente( ) 
    BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        SELECT codigoFuente, denominacionFuente 
        FROM fuenteAgua 
        WHERE HEX(UNHEX(habilitado))='01';
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query( "CALL listarFuentesDeAguaParaComponente()", 
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
 * @description Gestionar Ruta para Lista las FUENTES de Agua registradas (incluyendo las DESHABILITADAS) (GET) "/api/fuente/registradas"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaFuenteAgua.get('/registradas', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarFuentesDeAguaRegistradas;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarFuentesDeAguaRegistradas( ) 
    BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        SELECT codigoFuente, denominacionFuente, CAST(habilitado AS INTEGER) AS habilitado 
        FROM fuenteAgua;
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query("CALL listarFuentesDeAguaRegistradas()", 
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
 * @description Gestionar Ruta para Lista las FUENTES de Agua para Paginado (POST) "/api/fuente/paginado"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaFuenteAgua.post('/paginado', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarFuentesDeAguaPaginado;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarFuentesDeAguaPaginado(
        IN `@inicio` INTEGER UNSIGNED,
        IN `@resultados` INTEGER UNSIGNED 
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        SELECT codigoFuente, denominacionFuente, CAST(habilitado AS INTEGER) AS habilitado 
        FROM fuenteAgua fuenteAgua LIMIT `@inicio`,`@resultados`;
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query("CALL listarFuentesDeAguaPaginado(?,?)", 
        [ parseInt(solicitud.body.inicio), parseInt(solicitud.body.resultados) ],
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
 * @description Gestionar Ruta para Agregar una NUEVA Fuente de Agua (POST) "/api/fuente"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaFuenteAgua.post('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS agregarNuevaFuenteAgua;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS agregarNuevaFuenteAgua (
        IN `@denominacion` VARCHAR(80) CHARACTER SET utf8,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        INSERT INTO fuenteAgua(denominacionFuente) VALUES (`@denominacion`);
        SET @codigoFuenteTemporal = LAST_INSERT_ID();
        INSERT INTO bitacora VALUES (`@quien`, 3, @codigoFuenteTemporal, 0, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        let nombreFuenteAgua = solicitud.body.denominacion; 
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query("CALL agregarNuevaFuenteAgua(?, ?)", 
            [
                nombreFuenteAgua, 
                operador
            ], 
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
 * @description Gestionar Ruta para Modificar la denominación (nombre) de una Fuente de Agua registrada (PUT) "/api/fuente"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
 gestorRutaFuenteAgua.put('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS modificarNombreFuenteAgua;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarNombreFuenteAgua (
        IN `@codigoFuente` INTEGER UNSIGNED,
        IN `@nuevoNombre` VARCHAR(80) CHARACTER SET utf8,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        UPDATE fuenteAgua SET denominacionFuente=`@nuevoNombre` 
        WHERE codigoFuente=`@codigoFuente` AND HEX(UNHEX(habilitado))='01';
        INSERT INTO bitacora VALUES (`@quien`, 3, `@codigoFuente`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        let codigoFuenteAgua = solicitud.body.codigo;
        let nuevoNombreFuente = solicitud.body.denominacion;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL modificarNombreFuenteAgua(?, ?, ?)", 
            [
                codigoFuenteAgua, 
                nuevoNombreFuente, 
                operador
            ], 
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
 * @description Gestionar Ruta para Habilitar una Fuente de Agua registrada (PUT) "/api/fuente/habilitar"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaFuenteAgua.put('/habilitar', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS habilitarFuenteAgua;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS habilitarFuenteAgua (
        IN `@codigoFuente` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        UPDATE fuenteAgua SET habilitado = HEX(1) WHERE codigoFuente=`@codigoFuente` AND HEX(UNHEX(habilitado))='00';
        INSERT INTO bitacora VALUES (`@quien`, 3, `@codigoFuente`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        let codigoFuenteAgua = solicitud.body.codigo;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL habilitarFuenteAgua(?, ?)", 
            [
                parseInt(codigoFuenteAgua), 
                operador
            ], 
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
 * @description Gestionar Ruta para Deshabilitar una FUENTE de AGUA registrada (DELETE) "/api/fuente"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaFuenteAgua.delete('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS deshabilitarFuenteAgua;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS deshabilitarFuenteAgua (
        IN `@codigoFuente` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        UPDATE fuenteAgua SET habilitado = HEX(0) WHERE codigoFuente=`@codigoFuente` AND HEX(UNHEX(habilitado))='01';
        INSERT INTO bitacora VALUES (`@quien`, 3, `@codigoFuente`, 3, CURRENT_TIMESTAMP);
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try {
        let codigoFuenteAgua = solicitud.body.codigo;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL deshabilitarFuenteAgua(?, ?)",
            [
                codigoFuenteAgua, 
                operador
            ], 
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
 * @description Gestionar Ruta que Devuelve el Número de FUENTES de AGUA registrados (incluyendo deshabilitados) (GET) "/api/fuente/total"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaFuenteAgua.get('/total', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarFuentesDeAguaRegistradas;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarFuentesDeAguaRegistradas ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total FROM fuenteAgua; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query( "CALL contarFuentesDeAguaRegistradas()",
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
 * @description Gestionar Ruta para Rellenar Datos a Fuente de Agua (GET) "/api/conexion/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaFuenteAgua.post('/rellenar', async (solicitud, respuesta) => { 
    /*
    DROP PROCEDURE IF EXISTS rellenarDeExcel_FuenteAgua;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS rellenarDeExcel_FuenteAgua (
    IN `@codigo` INTEGER UNSIGNED,
    IN `@denominacion` VARCHAR(80),
    IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    INSERT INTO fuenteAgua(codigoFuente, denominacionFuente, datoProvisto)
    VALUES (`@codigo`, LOWER(`@denominacion`), HEX(1));
    INSERT INTO bitacora VALUES (`@quien`, 3, CONCAT(`@codigo`, ''), 0, CURRENT_TIMESTAMP);

    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    const { codigoFuente,denominacion,quien } = solicitud.body;
    try {   
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL rellenarDeExcel_FuenteAgua(?,?,?)", 
            [ codigoFuente,denominacion,quien ],
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
 * @description Gestionar Ruta para Verificar el Número de Procedimientos Almacenados para el módulo de FUENTE de AGUA (GET) "/api/fuente/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaFuenteAgua.get('/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosFuenteDeAgua;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosFuenteDeAgua ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total
        FROM information_schema.routines
        WHERE specific_name='listarFuentesDeAguaParaComponente' OR
              specific_name='listarFuentesDeAguaRegistradas' OR
              specific_name='agregarNuevaFuenteAgua' OR
              specific_name='modificarNombreFuenteAgua' OR 
              specific_name='habilitarFuenteAgua' OR 
              specific_name='deshabilitarFuenteAgua' OR
              specific_name='contarFuentesDeAguaRegistradas' OR
              specific_name='rellenarDeExcel_FuenteAgua'; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [8] */
        await proveedorDeDatos.query("CALL contarProcedimientosFuenteDeAgua()",
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

module.exports = gestorRutaFuenteAgua;

/** DATOS DE CONEXIONES DEL DEPARTAMENTO DE PRODUCCIÓN DE AGUA
TRUNCATE fuenteAgua;

CALL rellenarDeExcel_FuenteAgua(1, 'Korkor', '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteAgua(2, 'Piuray', '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteAgua(3, 'Jaquira', '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteAgua(4, 'Vilcanota', '00000000000000000000000000000001');
CALL rellenarDeExcel_FuenteAgua(5, 'Salkantay', '00000000000000000000000000000001');
*/