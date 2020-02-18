/**
 * @class Zona(Router)
 * @file apiZona.js
 * @author {carrillog.luis[at]gmail[dot]com,jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Luis.Carrillo.Gutiérrez__Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

/*
DROP TABLE IF EXISTS zona;
DELIMITER $$
CREATE TABLE IF NOT EXISTS zona (
    codigoZona INTEGER UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    sector INTEGER UNSIGNED NOT NULL,
    subSector INTEGER UNSIGNED NOT NULL DEFAULT 0,
    microSector CHAR(1) CHARACTER SET utf8 NOT NULL DEFAULT '-',
    denominacionZona VARCHAR(80) CHARACTER SET utf8 DEFAULT NULL,
    esSector BINARY(1) NOT NULL DEFAULT 0,
    tieneConexiones BINARY(1) NOT NULL DEFAULT 0,
    datoProvisto BINARY(1) NOT NULL DEFAULT 0,
    habilitado BINARY(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
$$
DELIMITER ;
ALTER TABLE zona ADD CONSTRAINT UNIQUE KEY(sector, subSector, microSector);
-- NUM TABLA = 5;
-- NUM PROCE = 14;
*/

'use strict';
const gestorRutaZona = require('express').Router();
const proveedorDeDatos = require('../conexiondb.js');

/**
 * @description Gestionar Ruta para Listar las Zonas Comerciales (para generar un COMPONENTE) (GET) "/api/zona/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaZona.get('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarZonasParaComponente;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarZonasParaComponente( ) 
    BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        SELECT Z.codigoZona, Z.sector, Z.subSector, Z.microSector, IFNULL(denominacionZona, '') AS denominacionZona, 
        CAST(esSector AS INTEGER) AS esSector, CAST(tieneConexiones AS INTEGER) AS tieneConexiones
        FROM zona Z WHERE HEX(UNHEX(Z.habilitado))='01';
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query("CALL listarZonasParaComponente()", 
            (error, resultado) => {
            if (error)
                respuesta.json({ "error" : error });
            else
                respuesta.json( resultado[0] );
        });
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        respuesta.json({ "error" : errorExcepcion.code });
    } // finally { }
});

/**
 * @description Gestionar Ruta para Listar las Zonas Comerciales registradas (incluyendo zonas deshabilitadas) (GET) "/api/zona/registradas"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaZona.get('/registradas', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarZonasRegistradas;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarZonasRegistradas ( ) 
    BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        SELECT codigoZona, sector, subSector, microSector, IFNULL(denominacionZona, '') AS denominacionZona, 
        CAST(esSector AS INTEGER) AS esSector, CAST(habilitado AS INTEGER) AS habilitado 
        FROM zona ORDER BY sector ASC, subSector ASC, microSector ASC;
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query( "CALL listarZonasRegistradas()",
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
 * @description Gestionar Ruta para Listar las Zonas Comerciales registradas (incluyendo zonas deshabilitadas), pero paginado (por PAGINAS de resultados) (POST) "/api/zona/paginado"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaZona.post('/paginado', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarZonasRegistradasPaginadas;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarZonasRegistradasPaginadas (
        IN `@inicio` INTEGER UNSIGNED,
        IN `@resultados` INTEGER UNSIGNED
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        SELECT codigoZona, sector, subSector, microSector, IFNULL(denominacionZona, '') AS denominacionZona, CAST(esSector AS INTEGER) AS esSector, CAST(tieneConexiones AS INTEGER) AS tieneConexiones, CAST(habilitado AS INTEGER) AS habilitado 
        FROM zona ORDER BY sector ASC, subSector ASC, microSector ASC LIMIT `@inicio`,`@resultados`;
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query( "CALL listarZonasRegistradasPaginadas(?, ?)",
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
 * @description Gestionar Ruta para Listar las Zonas Comerciales que actúan como ZONAS SECTORES (GET) "/api/zona/sectorReporte"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaZona.get('/sectorReporte', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarZonasPorSector;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarZonasPorSector ( ) 
    BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        SELECT codigoZona, sector, subSector, microSector, denominacionZona
        FROM zona 
        WHERE HEX(UNHEX(esSector)) = '01'
        ORDER BY sector ASC, subSector ASC, microSector ASC;
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query("CALL listarZonasPorSector()",
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
 * @description Gestionar Ruta para Listar todas las Zonas Comerciales y su relación con una FUENTE de AGUA determinada (GET) "/api/zona/fuente/1"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaZona.get('/fuente/:zona', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarZonasPorFuente;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarZonasPorFuente (
        IN `@codigoFuente` INTEGER UNSIGNED
    ) BEGIN
        SELECT A.denominacionFuente, Z.codigoZona, Z.sector, Z.subSector, Z.microSector
        FROM fuenteZona F
        INNER JOIN fuenteAgua A ON F.codigoFuente=A.codigoFuente
        INNER JOIN zona Z ON F.codigoZona=Z.codigoZona
        WHERE F.codigoFuente=`@codigoFuente`
        ORDER BY Z.sector ASC, Z.subSector ASC, Z.microSector ASC;
    END;
    $$
    DELIMITER ;
    */
    try {
        let zona = solicitud.params.zona;
        await proveedorDeDatos.query( "CALL listarZonasPorFuente(?)",
        [
            zona
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
 * @description Gestionar Ruta para Listar las Zonas Comerciales filtradas por una FUENTE de AGUA determinada (GET) "/api/zona/fuentes/registradas"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaZona.get('/fuentes/registradas', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS listarZonasParaCadaFuente;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarZonasParaCadaFuente ( ) 
    BEGIN
        SELECT F.codigoFuenteZona, F.codigoFuente, Z.codigoZona, Z.sector, Z.subSector, Z.microSector
        FROM fuenteZona F
        INNER JOIN zona Z ON F.codigoZona=Z.codigoZona
        ORDER BY Z.sector ASC, Z.subSector ASC, Z.microSector ASC;
    END;
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query( "CALL listarZonasParaCadaFuente()",
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
 * @description Gestionar Ruta para Registrar una NUEVA Zona Comercial (POST) "/api/zona/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaZona.post('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS agregarActualizarZona;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS agregarActualizarZona (
        IN `@sector` INTEGER UNSIGNED,
        IN `@subSector` INTEGER UNSIGNED,
        IN `@microSector` CHAR(1) CHARACTER SET utf8,
        IN `@denominacion` VARCHAR(80) CHARACTER SET utf8,
        IN `@esSector` TINYINT(1) UNSIGNED,
        IN `@tieneConexiones` TINYINT(1) UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        INSERT INTO zona(sector, subSector, microSector, denominacionZona, esSector, tieneConexiones) 
        VALUES (`@sector`, `@subSector`, `@microSector`, `@denominacion`, HEX(`@esSector`), HEX(`@tieneConexiones`)) 
        ON DUPLICATE KEY UPDATE sector=`@sector`, subSector=`@subSector`, microSector=`@microSector`, denominacionZona=`@denominacion`, esSector=HEX(`@esSector`), tieneConexiones =HEX(`@tieneConexiones`);
        SET @codigoZonaTemporal = LAST_INSERT_ID();
        INSERT INTO bitacora VALUES (`@quien`, 5, @codigoZonaTemporal, 0, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        const {sector,subsector,microsector,denominacion,esSector,tieneConexiones,quien} = solicitud.body
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL agregarActualizarZona(?, ?, ?, ?, ?, ?, ?)",
            [ sector,subsector,microsector,denominacion,esSector,tieneConexiones,quien],
            (error, resultado) => {
                if (error) respuesta.json({ "error" : error });
                else respuesta.json( resultado[0] );
            }
        );
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        respuesta.json({ "error" : errorExcepcion.code });
    }
});

/**
 * @description Gestionar Ruta para Modifica una Zona Comercial (PUT) "/api/zona/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaZona.put('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS modificarZona;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarZona (
        IN `@zona` INTEGER UNSIGNED,
        IN `@sector` INTEGER UNSIGNED,
        IN `@subSector` INTEGER UNSIGNED,
        IN `@microSector` CHAR(1) CHARACTER SET utf8,
        IN `@denominacion` VARCHAR(80) CHARACTER SET utf8,
        IN `@esSector` TINYINT(1) UNSIGNED,
        IN `@tieneConexiones` TINYINT(1) UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        UPDATE zona SET 
        sector=`@sector`,subSector=`@subSector`,microSector=`@microSector`,denominacionZona=`@denominacion`,
        esSector=HEX(`@esSector`),tieneConexiones=HEX(`@tieneConexiones`)
        WHERE codigoZona=`@zona`;
        INSERT INTO bitacora VALUES (`@quien`, 5, `@zona`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        const {zona,sector,subsector,microsector,denominacion,esSector,tieneConexiones,quien} = solicitud.body;
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL modificarZona(?,?,?,?,?,?,?,?)",
            [zona,sector,subsector,microsector,denominacion,esSector,tieneConexiones,quien],
            (error, resultado) => {
                if (error) respuesta.json({ "error" : error });
                else respuesta.json( resultado[0] );
            }
        );
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        respuesta.json({ "error" : errorExcepcion.code });
    }
});

/**
 * @description Gestionar Ruta para Deshabilitar una Zona Comercial (PUT) "/api/zona/deshabilitar"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaZona.put('/deshabilitar', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS deshabilitarZona;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS deshabilitarZona (
        IN `@codigoZona` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        UPDATE zona SET habilitado = HEX(0) WHERE codigoZona=`@codigoZona`;
        INSERT INTO bitacora VALUES (`@quien`, 5, `@codigoZona`, 3, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        let zona = solicitud.body.zona;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); } 
        else await proveedorDeDatos.query("CALL deshabilitarZona(?, ?)",
            [
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
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        respuesta.json({ "error" : errorExcepcion.code });
    }
});

/**
 * @description Gestionar Ruta para Habilitar una Zona Comercial (PUT) "/api/zona/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaZona.put('/habilitar', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS habilitarZona;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS habilitarZona (
        IN `@zona` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        UPDATE zona SET habilitado = HEX(1) WHERE codigoZona=`@zona`;
        INSERT INTO bitacora VALUES (`@quien`, 5, `@zona`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        let zona = solicitud.body.zona;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        await proveedorDeDatos.query( "CALL habilitarZona(?, ?)",
            [
                zona,
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
 * @description Gestionar Ruta para Cambiar el estado (deshabilitar) de Sector de una Zona Comercial determinada (DELETE) "/api/zona/sector"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaZona.delete('/sector', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS deshabilitarZonaComoSector;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS deshabilitarZonaComoSector (
        IN `@zona` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        UPDATE zona SET esSector = HEX(0) WHERE codigoZona=`@zona` AND HEX(UNHEX(habilitado))='01';
        INSERT INTO bitacora VALUES (`@quien`, 5, `@zona`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        let zona = solicitud.body.zona;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL deshabilitarZonaComoSector(?, ?)",
            [
                zona,
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
 * @description Gestionar Ruta para Cambiar el estado (habilitar) de Sector de una Zona Comercial determinada (PUT) "/api/zona/sector"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaZona.put('/sector', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS habilitarZonaComoSector;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS habilitarZonaComoSector (
        IN `@zona` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        UPDATE zona SET esSector = HEX(1) WHERE codigoZona=`@zona` AND HEX(UNHEX(habilitado))='01';
        INSERT INTO bitacora VALUES (`@quien`, 5, `@zona`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        let zona = solicitud.body.zona;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        await proveedorDeDatos.query( "CALL habilitarZonaComoSector(?, ?)",
            [
                zona,
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
 * @description Devuelve el Número de Zonas Comerciales registrados (incluyendo deshabilitados) gestionado con la ruta (GET) "/api/zona/total"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaZona.get('/total', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarZonasRegistradas;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarZonasRegistradas ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total FROM zona; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query( "CALL contarZonasRegistradas()",
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
 * @description Verificar el Número de Procedimientos Almacenados para el módulo ZONA COMERCIAL con la ruta (GET) "/api/zona/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaZona.get('/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosZona;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosZona ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total
        FROM information_schema.routines
        WHERE specific_name='listarZonasParaComponente' OR
              specific_name='listarZonasRegistradas' OR
              specific_name='listarZonasRegistradasPaginadas' OR
              specific_name='listarZonasPorSector' OR
              specific_name='listarZonasPorFuente' OR
              specific_name='listarZonasParaCadaFuente' OR 
              specific_name='agregarActualizarZona' OR
              specific_name='deshabilitarZona' OR
              specific_name='habilitarZona' OR
              specific_name='modificarAreaDeServicioZona' OR
              specific_name='deshabilitarZonaComoSector' OR
              specific_name='habilitarZonaComoSector' OR
              specific_name='contarZonasRegistradas'; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [13] */
        await proveedorDeDatos.query("CALL contarProcedimientosZona()",
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

module.exports = gestorRutaZona;

/** DATOS DE LA RELACION DE FUENTE CON ZONA
 
TRUNCATE zona;

CALL agregarActualizarZona(1, 0, '-',  NULL, HEX(0), HEX(0), '00000000000000000000000000000001'); -- ZONA I 3594
CALL agregarActualizarZona(1, 1, '-', 'Hatún-Huaylla [R-18]', HEX(1), HEX(0), '00000000000000000000000000000001'); -- ZONA I-I
CALL agregarActualizarZona(1, 1, 'A', 'Hatún-Huaylla [R-18]', HEX(0), HEX(1), '00000000000000000000000000000001'); -- ZONA I-I-A  1115
CALL agregarActualizarZona(1, 1, 'B', 'Hatún-Huaylla [R-18]', HEX(0), HEX(1), '00000000000000000000000000000001'); -- ZONA I-I-B  487
CALL agregarActualizarZona(1, 1, 'C', 'Hatún-Huaylla [R-18]', HEX(0), HEX(1), '00000000000000000000000000000001'); -- ZONA I-I-C  305
CALL agregarActualizarZona(1, 1, 'D', 'Hatún-Huaylla [R-18]', HEX(0), HEX(1), '00000000000000000000000000000001'); -- ZONA I-I-D  518
CALL agregarActualizarZona(1, 1, 'E', 'Hatún-Huaylla [R-18]', HEX(0), HEX(1), '00000000000000000000000000000001'); -- ZONA I-I-E  1169
CALL agregarActualizarZona(1, 2, '-', 'Huasahuara [Villa María, El Arco, Independencia]',HEX(1), HEX(1), '00000000000000000000000000000001'); -- ZONA I-II   2634
CALL agregarActualizarZona(2, 0, '-', 'Santa Ana [R-3]',HEX(1), HEX(1),'00000000000000000000000000000001'); -- ZONA II 1781
CALL agregarActualizarZona(3, 0, '-', 'Amargura [ERP]',HEX(1), HEX(1),'00000000000000000000000000000001'); -- ZONA III 1237
CALL agregarActualizarZona(4, 0, '-', 'Picchu [R-4]',HEX(1),HEX(0),'00000000000000000000000000000001'); -- Zona IV 6030
CALL agregarActualizarZona(4, 1, '-', 'Picchu [R-4]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA IV-I   3654
CALL agregarActualizarZona(4, 2, '-', 'Picchu [R-4]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA IV-II  2375
CALL agregarActualizarZona(5, 0, '-', 'Puquin [R-2]',HEX(1),HEX(0),'00000000000000000000000000000001'); -- Zona V  3375
CALL agregarActualizarZona(5, 1, '-', 'Puquin [R-2]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA V-I    1660
CALL agregarActualizarZona(5, 2, '-', 'Puquin [R-2]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA V-II   995
CALL agregarActualizarZona(5, 3, '-', 'Puquin [R-2]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA V-III  720
CALL agregarActualizarZona(6, 0, '-', 'Jaquira [R]',HEX(1),HEX(0),'00000000000000000000000000000001'); -- Zona VI   2747.00
CALL agregarActualizarZona(6, 1, '-', 'Jaquira [R]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA VI-I   716
CALL agregarActualizarZona(6, 2, '-', 'Jaquira [R]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA VI-II  1025
CALL agregarActualizarZona(6, 3, '-', 'Jaquira [R]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA VI-III 308
CALL agregarActualizarZona(6, 4, '-', 'Jaquira [R]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA VI-IV  698
CALL agregarActualizarZona(7, 0, '-', 'Koripata [R-5]',HEX(1),HEX(0),'00000000000000000000000000000001'); -- Zona VII   9080.00
CALL agregarActualizarZona(7, 1, '-', 'Koripata [R-5]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA VII-I  1717
CALL agregarActualizarZona(7, 2, '-', 'Koripata [R-5]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA VII-II 6117
CALL agregarActualizarZona(7, 3, '-', 'Koripata [R-5]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA VII-III    1245
CALL agregarActualizarZona(8, 0, '-', 'Tahuantinsuyo [ERP Zarate Tetecaca]',HEX(1),HEX(0),'00000000000000000000000000000001'); -- Zona VIII   9771.00
CALL agregarActualizarZona(8, 1, '-', 'Tahuantinsuyo [ERP]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA VIII-I 4912
CALL agregarActualizarZona(8, 2, '-', 'Tahuantinsuyo [ERP]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA VIII-II    651
CALL agregarActualizarZona(8, 3, '-', 'Tahuantinsuyo [ERP]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA VIII-III   1528
CALL agregarActualizarZona(8, 4, '-', 'Tahuantinsuyo [ERP]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA VIII-IV    2678
CALL agregarActualizarZona(9, 0, '-', 'Los Andenes [R-1]',HEX(1),HEX(0),'00000000000000000000000000000001'); -- Zona IX 13911.00
CALL agregarActualizarZona(9, 1, '-', 'Los Andenes [R-1]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA IX-I   5193
CALL agregarActualizarZona(9, 2, '-', 'Los Andenes [R-1]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA IX-II  594
CALL agregarActualizarZona(9, 3, '-', 'Los Andenes [R-1]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA IX-III 966
CALL agregarActualizarZona(9, 4, '-', 'Los Andenes [R-1]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA IX-IV  2018
CALL agregarActualizarZona(9, 5, '-', 'Los Andenes [R-1]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA IX-V   594
CALL agregarActualizarZona(9, 6, '-', 'Los Andenes [R-1]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA IX-VI  1422
CALL agregarActualizarZona(9, 7, '-', 'Los Andenes [R-1]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA IX-VII 3122
CALL agregarActualizarZona(10, 0, '-','Salkantay [Noreste]',HEX(1),HEX(1),'00000000000000000000000000000001'); -- Zona X  2262
CALL agregarActualizarZona(11, 0, '-','Campiña [R-10 Ununchis Campiña, Alpaorcona Pachamayo]',HEX(1),HEX(0),'00000000000000000000000000000001'); -- Zona XI 13433.00
CALL agregarActualizarZona(11, 1, '-','Campiña [R-10]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA XI-I   10512
CALL agregarActualizarZona(11, 2, '-','Campiña [R-10]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA XI-II  547
CALL agregarActualizarZona(11, 3, '-','Campiña [R-10]',HEX(0),HEX(1),'00000000000000000000000000000001'); -- ZONA XI-III 2373
CALL agregarActualizarZona(12, 0, '-','Wimpillay [R-13]',HEX(1),HEX(0),'00000000000000000000000000000001'); -- Zona XII    16409.00
CALL agregarActualizarZona(12, 1, '-','Wimpillay [R-13]',HEX(0),HEX(1), '00000000000000000000000000000001'); -- ZONA XII-I  4569
CALL agregarActualizarZona(12, 2, '-','Wimpillay [R-13]',HEX(0),HEX(1), '00000000000000000000000000000001'); -- ZONA XII-II 1401
CALL agregarActualizarZona(12, 3, '-','Wimpillay [R-13]',HEX(0),HEX(1), '00000000000000000000000000000001'); -- ZONA XII-III  3337
CALL agregarActualizarZona(12, 4, '-','Wimpillay [R-13]',HEX(0),HEX(1), '00000000000000000000000000000001'); -- ZONA XII-IV 1989
CALL agregarActualizarZona(12, 5, '-','Wimpillay [R-13]',HEX(0),HEX(1), '00000000000000000000000000000001'); -- ZONA XII-V  5110
CALL agregarActualizarZona(13, 0, '-','Caramascara [R-14]',HEX(1),HEX(1), '00000000000000000000000000000001'); -- ZONA XII-V  5110
CALL agregarActualizarZona(14, 0, '-','Margen Derecha [R-15]',HEX(1),HEX(1), '00000000000000000000000000000001'); -- ZONA XII-V  5110
*/