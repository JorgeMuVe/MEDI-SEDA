/**
 * @class BloqueUrbano(Router)
 * @file apiBloqueUrbano.js
 * @author {carrillog.luis[at]gmail[dot]com,jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Luis.Carrillo.Gutiérrez__Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

/*
DROP TABLE IF EXISTS bloqueUrbano;
DELIMITER $$
CREATE TABLE IF NOT EXISTS bloqueUrbano (
	codigoUrbano INTEGER UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
	codigoZona INTEGER UNSIGNED NOT NULL, 
	denominacionBloque VARCHAR(80) CHARACTER SET utf8 NOT NULL,
	datoProvisto BINARY(1) NOT NULL DEFAULT 0, 
	habilitado BINARY(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
$$
DELIMITER ;
-- NUM TABLA = 6;
-- NUM PROCE = 11;
*/

'use strict';
const gestorRutasBloqueUrbano = require('express').Router();
const proveedorDeDatos = require('../conexiondb.js');

/**
 * @description Gestionar Ruta para Listar los Bloques Urbanos (para COMPONENTES) (GET) "/api/bloque/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutasBloqueUrbano.get('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarBloquesUrbanos;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarBloquesUrbanos ( ) 
    BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        SELECT codigoUrbano, denominacionBloque 
        FROM bloqueUrbano WHERE HEX(UNHEX(1))='01';
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query( "CALL listarBloquesUrbanos()", 
            (error, resultado) => {
                if (error)
                    respuesta.json({"error" : error});
                else
                    respuesta.json( resultado[0] );
            }
        );
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        respuesta.json({ "error" : errorExcepcion.code});
    }
});

/**
 * @description Gestionar Ruta para Listar los Bloques Urbanos registrados (habilitados o no) (GET) "/api/bloque/registrados"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
 gestorRutasBloqueUrbano.get('/registrados', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarBloquesUrbanosRegistrados;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarBloquesUrbanosRegistrados () 
    BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        SELECT codigoUrbano, codigoZona, denominacionBloque, CAST(habilitado AS INTEGER) AS habilitado 
        FROM bloqueUrbano;
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query( "CALL listarBloquesUrbanosRegistrados()", 
            (error, resultado) => {
                if (error)
                    respuesta.json({"error" : error});
                else
                    respuesta.json( resultado[0] );
            }
        );
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        respuesta.json({ "error" : errorExcepcion.code});
    }
});

/**
 * @description Gestionar Ruta para Listar los Bloques Urbanos para paginación (POST) "/api/bloque/paginado"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutasBloqueUrbano.post('/paginado', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarBloquesUrbanosPaginado;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarBloquesUrbanosPaginado (
        IN `@inicio` INTEGER UNSIGNED,
        IN `@resultados` INTEGER UNSIGNED
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        SELECT codigoZona, codigoUrbano, denominacionBloque, CAST(habilitado AS INTEGER) AS habilitado
        FROM bloqueUrbano LIMIT `@inicio`,`@resultados`;
    COMMIT;
    END;
    $$
    DELIMITER ;   
    */
    try {
        await proveedorDeDatos.query( "CALL listarBloquesUrbanosPaginado(?, ?)", 
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
        respuesta.json({ "error" : errorExcepcion.code});
    }
});

/**
 * @description Gestionar Ruta para Mostrar detalles de un Bloque Urbano por el codgio de una Zona (POST) "/api/bloque/zona"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutasBloqueUrbano.post('/zona', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarBloquesUrbanosPorZona;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarBloquesUrbanosPorZona (
        IN `@zona` CHAR(2)
    ) BEGIN
    SET @sector = "-", @subSector = "-", @microSector ="-";
    SELECT sector, subSector, microSector INTO @sector,@subSector,@microSector FROM zona where codigoZona = `@zona`;
    IF @sector = "-" THEN SET @sector = "%"; END IF;
    IF @subSector = "-" THEN SET @subSector = "%"; END IF;
    IF @microSector = "-" THEN SET @microSector = "%"; END IF;

    SELECT codigoUrbano, denominacionBloque
    FROM bloqueUrbano
    WHERE codigoZona IN (SELECT DISTINCT codigoZona FROM zona WHERE sector LIKE BINARY @sector AND subSector LIKE BINARY @subSector 
    AND microSector LIKE BINARY @microSector AND HEX(UNHEX(habilitado)) = "01");
    END;
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query( "CALL listarBloquesUrbanosPorZona(?)", 
            [ solicitud.body.zona ],
            (error, resultado) => {
                if (error) respuesta.json({ "error" : error });
                else respuesta.json( resultado[0] );
            }
        );
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        respuesta.json({ "error" : errorExcepcion.code});
    }
});

/**
 * @description Gestionar Ruta para Agregar un Bloque Urbano (POST) "/api/bloque/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutasBloqueUrbano.post('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS agregarBloqueUrbano;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS agregarBloqueUrbano (
        IN `@codigoZona` INTEGER UNSIGNED,
        IN `@nombreBloque` VARCHAR(80) CHARACTER SET utf8,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        INSERT INTO bloqueUrbano(codigoZona, denominacionBloque) VALUES (`@codigoZona`, `@nombreBloque`);
        SET @tmp = LAST_INSERT_ID();
        INSERT INTO bitacora VALUES (`@quien`, 6, @tmp, 0, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        let zona = solicitud.body.zona;
        let nombre = solicitud.body.denominacion;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL agregarBloqueUrbano(?, ?, ?)", 
            [
                parseInt(zona), 
                nombre, 
                operador
            ], 
            (error, resultado) => {
            if(error)
                respuesta.json({ "error": error });
            else
                respuesta.json( resultado[0] );
        });
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        res.json({ "error" : errorExcepcion.code });
    }
});

/**
 * @description Gestionar Ruta para Deshabilitar un Bloque Urbano (DELETE) "/api/bloque/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutasBloqueUrbano.delete('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS deshabilitarBloqueUrbano;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS deshabilitarBloqueUrbano (
        IN `@codigoUrbano` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        UPDATE bloqueUrbano SET habilitado = HEX(0) WHERE codigoUrbano=`@codigoUrbano` AND HEX(UNHEX(habilitado))='01';
        INSERT INTO bitacora VALUES (`@quien`, 6, `@codigoUrbano`, 3, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        let codigo = solicitud.body.codigo;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL deshabilitarBloqueUrbano(?, ?)", 
            [
                parseInt(codigo),
                operador
            ], 
            (error, resultado) => {
                if(error)
                    respuesta.json({ "error" : error });
                else
                    respuesta.json( resultado[0] );
        });
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        res.json({ "error" : errorExcepcion.code });
    }
});

/**
 * @description Gestionar Ruta para Habilitar el registro de un Bloque Urbano (PUT) "/api/bloque/habilitar"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutasBloqueUrbano.put('/habilitar', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS habilitarBloqueUrbano;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS habilitarBloqueUrbano (
        IN `@codigoUrbano` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        UPDATE bloqueUrbano SET habilitado=HEX(1) WHERE codigoUrbano=`@codigoUrbano` AND HEX(UNHEX(habilitado))='00';
        INSERT INTO bitacora VALUES (`@quien`, 6, `@codigoUrbano`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        let codigo = solicitud.body.codigo;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL habilitarBloqueUrbano(?, ?)", 
            [
                parseInt(codigo),
                operador
            ], 
            (error, resultado) => {
                if(error)
                    respuesta.json({ "error" : error });
                else
                    respuesta.json( resultado[0] );
            }
        );
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        res.json({ "error" : errorExcepcion.code});
    }
});

/**
 * @description Gestionar Ruta para Modificar la denominación (nombre) de un Bloque Urbano (PUT) "/api/bloque/denominacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutasBloqueUrbano.put('/denominacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS modificarDenominacionBloqueUrbano;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarDenominacionBloqueUrbano (
        IN `@codigoUrbano` INTEGER UNSIGNED,
        IN `@denominacion` VARCHAR(80) CHARACTER SET utf8,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        UPDATE bloqueUrbano SET denominacionBloque=`@denominacion`
        WHERE codigoUrbano=`@codigoUrbano`; -- AND HEX(UNHEX(habilitado))='01';
        INSERT INTO bitacora VALUES (`@quien`, 6, `@codigoUrbano`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        let codigo = solicitud.body.codigo;
        let nombre = solicitud.body.denominacion;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        await proveedorDeDatos.query( "CALL modificarDenominacionBloqueUrbano(?, ?, ?)", 
            [
                parseInt(codigo), 
                nombre,
                operador
            ], 
            (error, resultado) => {
                if(error)
                    respuesta.json({ "error" :  error });
                else
                    respuesta.json( resultado[0] );
            }
        );
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        respuesta.json({ "error" : errorExcepcion.code });
    }
});

// Modificar La Zona de Bloque Urbano
/**
 * @description Gestionar Ruta para Modificar el código de Zona de un Bloque Urbano (PUT) "/api/bloque/zona"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutasBloqueUrbano.put('/zona', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS modificarZonaBloqueUrbano;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarZonaBloqueUrbano (
        IN `@codigoUrbano` INTEGER UNSIGNED,
        IN `@zona` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        UPDATE bloqueUrbano SET codigoZona=`@zona`
        WHERE codigoUrbano=`@codigoUrbano`; -- AND HEX(UNHEX(habilitado))='01';
        INSERT INTO bitacora VALUES (`@quien`, 6, `@codigoUrbano`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        let codigo = solicitud.body.codigo;
        let zona = solicitud.body.zona;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        await proveedorDeDatos.query( "CALL modificarZonaBloqueUrbano(?, ?, ?)", 
            [
                parseInt(codigo), 
                parseInt(zona),
                operador
            ], 
            (error, resultado) => {
                if(error)
                    respuesta.json({ "error" :  error });
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
 * @description Gestionar Ruuta que Devuelve el Número de Bloques URBANOS registrados (incluyendo deshabilitados) (GET) "/api/bloque/total"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutasBloqueUrbano.get('/total', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarBloquesUrbanosRegistrados;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarBloquesUrbanosRegistrados ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total FROM bloqueUrbano; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query( "CALL contarBloquesUrbanosRegistrados()",
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
 * @description Gestionar Ruta para Rellenar Datos a Bloque Urbano (GET) "/api/conexion/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutasBloqueUrbano.post('/rellenar', async (solicitud, respuesta) => { 
    /*
    DROP PROCEDURE IF EXISTS rellenarDeExcel_bloqueUrbano;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS rellenarDeExcel_bloqueUrbano (
    IN `@zona` INTEGER UNSIGNED,
    IN `@denominacion` VARCHAR(80),
    IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    -- DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    -- START TRANSACTION;

        INSERT INTO bloqueUrbano(codigoZona, denominacionBloque, datoProvisto)
        VALUES (`@zona`, LOWER(`@denominacion`), HEX(1));
        INSERT INTO bitacora VALUES (`@quien`, 6, CONCAT(`@zona`, ''), 0, CURRENT_TIMESTAMP);

    -- COMMIT;
    END;
    $$
    DELIMITER ;
    */
    const { codigoUrbano,denominacion,quien } = solicitud.body;
    try {   
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL rellenarDeExcel_bloqueUrbano(?,?,?)", 
            [ codigoUrbano,denominacion,quien ],
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
 * @description Gestionar Ruta para Verificar el Número de Procedimientos Almacenados para el módulo de Bloque Urbano (GET) "/api/bloque/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutasBloqueUrbano.get('/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosBloqueUrbano;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosBloqueUrbano ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total
        FROM information_schema.routines
        WHERE specific_name='listarBloquesUrbanos' OR
              specific_name='listarBloquesUrbanosRegistrados' OR
              specific_name='listarBloquesUrbanosPaginado' OR
              specific_name='listarBloquesUrbanosPorZona' OR
              specific_name='agregarBloqueUrbano' OR
              specific_name='deshabilitarBloqueUrbano' OR
              specific_name='habilitarBloqueUrbano' OR 
              specific_name='modificarDenominacionBloqueUrbano' OR 
              specific_name='modificarZonaBloqueUrbano' OR 
              specific_name='contarBloquesUrbanosRegistrados' OR 
              specific_name='rellenarDeExcel_bloqueUrbano'; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [11] */
        await proveedorDeDatos.query( "CALL contarProcedimientosBloqueUrbano()",
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

module.exports = gestorRutasBloqueUrbano;
/** DATOS DE CONEXIONES DEL DEPARTAMENTO DE PRODUCCIÓN DE AGUA
TRUNCATE bloqueUrbano;

CALL rellenarDeExcel_bloqueUrbano(3 , 'CAMINO REAL', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(4 , 'MIRADOR CUSCO', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(5 , 'CALVARIO', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(6 , 'SAYARI', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(7 , 'ALTO CUSCO', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(8 , 'VILLA MARIA,ARCO,INDEP', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(9 , 'SANTA ANA', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(10, 'CENTRO HIST. EPR. AMARGURA', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(12, 'ENTRO HISTORICO', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(13, 'SANTIAGO', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(15, 'ZARZUELA', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(16, 'ANTONIO LORENA', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(17, 'SIPASPUGIO', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(19, 'FRANCISCO BOLOGNESI', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(20, 'MANAHUAÑUNCA', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(21, 'LA ESTRELLA', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(22, 'MARGEN DERECHA', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(24, 'HUANCARO', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(26, 'AV. EJERCITO', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(25, 'WANCHAC', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(28, 'TAHUANTINSUYO', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(29, 'UCCHULLO ALTO', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(30, 'KARI GRANDE', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(40, 'SALKANTAY', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(33, 'MAGISTERIO', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(34, 'SANTA MONICA', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(35, 'MARCAVALLE', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(36, 'SANTA URSULA', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(37, 'PARQUE INDUSTRIAL', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(38, 'TTIO NORTE', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(39, 'TTIO SUR', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(42, 'SAN SEBASTIAN ', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(42, 'SAN SEBASTIAN SANTA ROSA', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(31, 'SAN SEBASTIAN ALTO', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(42, 'SAN SEBASTIAN, CAMPIÑA', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(43, 'CAMPIÑA', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(44, 'LARAPA', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(46, 'WIMPILLAY', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(47, 'VELASCO ASTETE', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(48, 'LOS NOGALES', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(49, 'SAN ANTONIO', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(50, 'UVIMAS', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(51, 'RESERVORIO CARAMASCARA R-14', '00000000000000000000000000000001');
CALL rellenarDeExcel_bloqueUrbano(52, 'MARGEN DERECHA R-15', '00000000000000000000000000000001');
*/