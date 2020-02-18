/**
 * @class Direccion(Router)
 * @file apiDireccion.js
 * @author {carrillog.luis[at]gmail[dot]com,jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Luis.Carrillo.Gutiérrez__Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

/*
DROP TABLE IF EXISTS direccion;
DELIMITER $$
CREATE TABLE IF NOT EXISTS direccion (

codigoDireccion INTEGER UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
referenciaDireccion INTEGER UNSIGNED DEFAULT 0,
codigoZona INTEGER UNSIGNED NOT NULL, -- zona comercial I-I-A
codigoUrbano INTEGER UNSIGNED NOT NULL, -- bloque urbano (ttio norte)
ordenBloque INTEGER UNSIGNED DEFAULT 0,
denominacionLote VARCHAR(80) CHARACTER SET utf8 NOT NULL, -- Cammino real ... ñ6
tipoAltitud TINYINT(1) UNSIGNED NOT NULL, -- alta media baja
codigoInscripcion VARCHAR(12) CHARACTER SET utf8 NOT NULL, 
datoProvisto BINARY(1) NOT NULL DEFAULT 0,
habilitado BINARY(1) NOT NULL DEFAULT 1

) ENGINE=InnoDB DEFAULT CHARSET=utf8;
$$
DELIMITER ;
-- NUM TABLE = 7;
-- NUM PROCE = 10;
*/

'use strict';
const gestorRutaDireccion = require('express').Router();
const proveedorDeDatos = require('../conexiondb.js');
const multer = require('multer'); //LIBRERIA PARA GESTION ARCHIVOS

// Alamacenamiento
const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'/home/software/Documentos/Proyectos/MEDI-SEDA-FINAL/servidor/documentos/csv');        
    },
    filename: function(req,file,cb){
        cb(null,file.originalname);
    }
});

const subida = multer({ storage : storage });

/**
 * @description Gestionar Ruta para Listar las direcciones registradas (incluídas las deshabilitadas) (GET) "/api/direccion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaDireccion.get('/', async function(solicitud, respuesta) { 
    /*
    DROP PROCEDURE IF EXISTS listarDireccionesRegistrados;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarDireccionesRegistrados ( ) 
    BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        SELECT codigoDireccion, codigoZona, codigoUrbano, denominacionLote, tipoAltitud, codigoInscripcion, CAST(habilitado AS INTEGER) as habilitado 
        FROM direccion; 
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {           
        await proveedorDeDatos.query( "CALL listarDireccionesRegistrados()", 
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
 * @description Gestionar Ruta para Listar las Direcciones para la Paginación (POST) "/api/direccion/paginado"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaDireccion.post('/paginado', async (solicitud, respuesta) =>  {
    /*
    DROP PROCEDURE IF EXISTS listarDireccionesPaginado;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarDireccionesPaginado (
        IN `@inicio` INTEGER UNSIGNED,
        IN `@resultados` INTEGER UNSIGNED
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        SELECT codigoDireccion, codigoZona, codigoUrbano, denominacionLote, tipoAltitud, codigoInscripcion, CAST(habilitado AS INTEGER) as habilitado 
        FROM direccion LIMIT `@inicio`,`@resultados`; 
    COMMIT;
    END;
    $$
    DELIMITER ;
    */ 
    try {
        await proveedorDeDatos.query( "CALL listarDireccionesPaginado(?, ?)",
            [
                parseInt(solicitud.body.inicio),
                parseInt(solicitud.body.resultados)
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
 * @description Gestionar Ruta para Deshabilitar una única dirección (DELETE) "/api/direccion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaDireccion.delete('/', async (solicitud, respuesta ) => { 
    /*
    DROP PROCEDURE IF EXISTS deshabilitarDireccion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS deshabilitarDireccion (
        IN `@codigo` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        UPDATE direccion SET habilitado = HEX(0) WHERE codigoDireccion =`@codigo`;
        INSERT INTO bitacora VALUES (`@quien`, 7, `@codigo`, 3, CURRENT_TIMESTAMP);
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try {
        let codigoDireccion = solicitud.body.codigo;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query("CALL deshabilitarDireccion(?, ?)", 
            [
                parseInt(codigoDireccion),
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
 * @description Gestionar Ruta para Habilitar una Dirección (PUT) "/api/direccion/habilitar"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaDireccion.put('/habilitar', async (solicitud, respuesta ) => {
    /*
    DROP PROCEDURE IF EXISTS habilitarDireccion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS habilitarDireccion (
        IN `@codigo` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        UPDATE direccion SET habilitado = HEX(1) WHERE codigoDireccion =`@codigo`;
        INSERT INTO bitacora VALUES (`@quien`, 7, `@codigo`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try {
        let codigoDireccion = solicitud.body.codigo;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query("CALL habilitarDireccion(?, ?)", 
            [
                parseInt(codigoDireccion),
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

// Envio de parametros para su ALMACENAMIENTO
/**
 * @description Gestionar Ruta para Agregar Nueva Direccion (POST) "/api/direccion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */ 
gestorRutaDireccion.post('/', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS agregarNuevaDireccion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS agregarNuevaDireccion (
        IN `@zona` INTEGER UNSIGNED, 
        IN `@urbano` INTEGER UNSIGNED,
        IN `@denominacion` VARCHAR(80) CHARACTER SET utf8,
        IN `@altitud` TINYINT(1) UNSIGNED,
        IN `@inscripcion` VARCHAR(12) CHARACTER SET utf8,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
    
    SET @ultimoCodigo=0,@orden=0;
    SELECT MAX(codigoDireccion) INTO @ultimoCodigo from direccion;
    SELECT MAX(ordenBloque) INTO @orden from direccion 
    WHERE direccion.codigoUrbano LIKE `@urbano`;

    INSERT INTO direccion(codigoDireccion,referenciaDireccion,codigoZona,codigoUrbano,ordenBloque,denominacionLote,tipoAltitud,codigoInscripcion) 
    VALUES (@ultimoCodigo+1,@ultimoCodigo+1,`@zona`,`@urbano`,@orden+1,`@denominacion`, `@altitud`, `@inscripcion`);
    INSERT INTO bitacora VALUES (`@quien`, 7, @ultimoCodigo+1, 0, CURRENT_TIMESTAMP);

    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try { 
        let zona = solicitud.body.zona; // codigoZona
        let urbano = solicitud.body.bloque; // codigoUrbano 
        let denominacion = solicitud.body.denominacion; // nombre/denominacion
        let altitud = solicitud.body.altitud;
        let inscripcion = solicitud.body.inscripcion;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query("CALL agregarNuevaDireccion(?, ?, ?, ?, ?, ?)", 
            [
                parseInt(zona), 
                parseInt(urbano),
                denominacion,
                parseInt(altitud),
                inscripcion,
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
 * @description Gestionar Ruta para Modificar Zona de una Direccion (PUT) "/api/direccion/actualizarZona"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaDireccion.put('/actualizarZona', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS modificarZonaDireccion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarZonaDireccion (
        IN `@codigoDireccion` INTEGER UNSIGNED, 
        IN `@zona` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    -- DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    -- START TRANSACTION;
        UPDATE direccion SET codigoZona=`@zona` WHERE codigoDireccion=`@codigoDireccion`;
        INSERT INTO bitacora VALUES (`@quien`, 7, `@codigoDireccion`, 2, CURRENT_TIMESTAMP);
    -- COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try { 
        let codigo = solicitud.body.codigo;
        let zona = solicitud.body.zona;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }    
        else await proveedorDeDatos.query("CALL modificarZonaDireccion(?, ?, ?)", 
            [
                parseInt(codigo), 
                parseInt(zona), 
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
 * @description Gestionar Ruta para Modificar Bloque Urbano de una Direccion (PUT) "/api/direccion/actualizarBloqueUrbano"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaDireccion.put('/actualizarBloqueUrbano', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS modificarBloqueDireccion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarBloqueDireccion (
        IN `@codigoDireccion` INTEGER UNSIGNED, 
        IN `@urbano` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    -- DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    -- START TRANSACTION;
        UPDATE direccion SET codigoUrbano=`@urbano` WHERE codigoDireccion=`@codigoDireccion`;
        INSERT INTO bitacora VALUES (`@quien`, 7, `@codigoDireccion`, 2, CURRENT_TIMESTAMP);
    -- COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try { 
        let codigo = solicitud.body.codigo;
        let bloque = solicitud.body.bloque;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query("CALL modificarBloqueDireccion(?, ?, ?)", 
            [
                parseInt(codigo), 
                parseInt(bloque), 
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
 * @description Gestionar Ruta para modificar Altitud de una Direccion (PUT) "/api/direccion/actualizarAltitud"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaDireccion.put('/actualizarAltitud', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS modificarAltitudDireccion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarAltitudDireccion (
        IN `@codigoDireccion` INTEGER UNSIGNED, 
        IN `@altitud` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    -- DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    -- START TRANSACTION;
        UPDATE direccion SET tipoAltitud=`@altitud` WHERE codigoDireccion=`@codigoDireccion`;
        INSERT INTO bitacora VALUES (`@quien`, 7, `@codigoDireccion`, 2, CURRENT_TIMESTAMP);
    -- COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try { 
        let codigo = solicitud.body.codigo;
        let altitud = solicitud.body.altitud;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query("CALL modificarAltitudDireccion(?, ?, ?)", 
            [
                parseInt(codigo), 
                parseInt(altitud), 
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
 * @description Gestionar Ruta para Modificar Denominacion y Codigo de Inscripcion de Direccion (PUT) "/api/direccion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaDireccion.put('/', async (solicitud, respuesta ) => {
    /*
    DROP PROCEDURE IF EXISTS modificarDenominacionInscripcionDireccion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarDenominacionInscripcionDireccion (
        IN `@codigo` INTEGER UNSIGNED,
        IN `@nombre` VARCHAR(80) CHARACTER SET utf8,
        IN `@inscripcion` VARCHAR(12) CHARACTER SET utf8,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        UPDATE direccion SET denominacionLote=`@nombre`, codigoInscripcion=`@inscripcion` WHERE codigoDireccion =`@codigo`;
        INSERT INTO bitacora VALUES (`@quien`, 7, `@codigo`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try {
        let codigoDireccion = solicitud.body.codigo;
        let denominacion = solicitud.body.denominacion;
        let inscripcion = solicitud.body.inscripcion;
        let operador = solicitud.body.firma;
        if (operador.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        await proveedorDeDatos.query("CALL modificarDenominacionInscripcionDireccion(?, ?, ?, ?)", 
            [
                parseInt(codigoDireccion),
                denominacion,
                inscripcion,
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
 * @description Gestionar Ruta para Buscar Direcciones Disponibles para generar Actividades (PUT) "/api/direccion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaDireccion.post('/buscar', async function(solicitud, respuesta) {
    /*
    DROP PROCEDURE IF EXISTS buscarDireccionesActividad;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS buscarDireccionesActividad ( 

    IN `@zona` CHAR(2),
    IN `@urbano` CHAR(2),
    IN `@altitud` CHAR(1)

    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    SET @sector = "-", @subSector = "-", @microSector ="-";
    SELECT sector, subSector, microSector INTO @sector,@subSector,@microSector FROM zona where codigoZona = `@zona`;
    IF @sector = "-" THEN SET @sector = "%"; END IF;
    IF @subSector = "-" THEN SET @subSector = "%"; END IF;
    IF @microSector = "-" THEN SET @microSector = "%"; END IF;

    SELECT codigoDireccion, denominacionLote FROM direccion
    WHERE codigoUrbano LIKE BINARY `@urbano` AND tipoAltitud LIKE BINARY `@altitud` AND codigoZona -- LIKE BINARY `@zona`;
    IN (SELECT DISTINCT codigoZona FROM zona WHERE sector LIKE BINARY @sector AND subSector LIKE BINARY @subSector 
    AND microSector LIKE BINARY @microSector AND HEX(UNHEX(habilitado)) = "01");

    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {           
        const { codigoZona,codigoUrbano,tipoAltitud } = solicitud.body;
        await proveedorDeDatos.query("CALL buscarDireccionesActividad(?,?,?)",[codigoZona,codigoUrbano,tipoAltitud] // Consulta a procedimiento almacenado
        , (error, resultado) => { 
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else
            respuesta.send(resultado[0]); // Enviar resultado de consulta en JSON
        }); 
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    }catch(error){ respuesta.json({ error : error.code }) }  // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Importa archivo CSV (POST) "/api/direccion/importar"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaDireccion.post('/importar',subida.single('archivo'),async(solicitud,respuesta) =>{
    /*
    TRUNCATE direccion;
    LOAD DATA LOCAL INFILE "direccionArchivo" 
    INTO TABLE direccion 
    FIELDS TERMINATED BY ';' 
    LINES TERMINATED BY '\n' 
    IGNORE 1 LINES   
    (codigoDireccion,codigoZona,codigoUrbano,codigoInscripcion,tipoAltitud,denominacionLote);
    */
    try { 
        await proveedorDeDatos.query("TRUNCATE direccion", async (errorBorrar, result) => {
            if (errorBorrar) 
            respuesta.json({ error : (errorBorrar.sqlMessage + " - " + errorBorrar.sql) });// Enviar error en JSON
            else{
                let url = solicitud.file.path;
                await proveedorDeDatos.query("LOAD DATA LOCAL INFILE ? INTO TABLE direccion FIELDS TERMINATED BY ';' LINES TERMINATED BY '\n' IGNORE 1 LINES   (codigoDireccion,codigoZona,codigoUrbano,codigoInscripcion,tipoAltitud,denominacionLote);",[url]
                , (error, resultado) => {
                    if (error) 
                    respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
                    else
                    respuesta.send(resultado); // Enviar resultado de consulta en JSON   
                }); 
            }
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    }catch(error){ respuesta.json({ error : error.code }) }  // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Verificar el Número de Procedimientos Almacenados para el módulo de Dirección (GET) "/api/bloque/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaDireccion.get('/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosDireccion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosDireccion ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total
        FROM information_schema.routines
        WHERE specific_name='listarDireccionesRegistrados' OR
              specific_name='listarDireccionesPaginado' OR
              specific_name='deshabilitarDireccion' OR 
              specific_name='habilitarDireccion' OR 
              specific_name='agregarNuevaDireccion' OR 
              specific_name='modificarZonaDireccion' OR 
              specific_name='modificarBloqueDireccion' OR 
              specific_name='modificarAltitudDireccion' OR
              specific_name='modificarDenominacionInscripcionDireccion' OR
              specific_name='buscarDireccionesActividad';
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [10] */
        await proveedorDeDatos.query( "CALL contarProcedimientosDireccion()",
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

module.exports = gestorRutaDireccion;

/*
TRUNCATE direccion;
INSERT INTO `direccion`(`codigoDireccion`,`referenciaDireccion`,`codigoZona`, `codigoUrbano`,`ordenBloque`,`denominacionLote`, `tipoAltitud`, `codigoInscripcion`,`datoProvisto`, `habilitado`) VALUES

--  ZONA(3)(I-I-A) FUENTE(1)  - URBANO(1) CAMINO REAL
(20, 20, 3,1,1,'Camino Real Mz Ñ-6 Psj las Pasionarias (BY PASS)',2,'VRP',UNHEX('30'),UNHEX('31')),
(1,  1,  3,1,2,'Camino Real Mz J-1',3,'VRP',UNHEX('30'),UNHEX('31')),
(2,  2,  3,1,3,'Camino Real Mz B y C Psje Los Crisantemos',3,'VRP',UNHEX('30'),UNHEX('31')),
(3,  3,  3,1,4,'APV Camino Inca Mz B-1 Carretera',3,'VRP',UNHEX('30'),UNHEX('31')),
(21, 21, 3,1,5,'Camino Inca Mz E-7',2,'VRP',UNHEX('30'),UNHEX('31')),
(22, 22, 3,1,6,'La Victoria Mz H-6 G-10',2,'VRP',UNHEX('30'),UNHEX('31')),
(23, 23, 3,1,7,'Camino Real Mz J-5',2,'1421772',UNHEX('30'),UNHEX('31')),
(5,  5,  3,1,8,'Camino Inca Mz E-7-B',3,'1426766',UNHEX('30'),UNHEX('31')),
(24, 24, 3,1,9,'Camino Inca Mz D-2',2,'1401154',UNHEX('30'),UNHEX('31')),
(41, 41, 3,1,10,'La Victoria Mz A-10',1,'14244968',UNHEX('30'),UNHEX('31')),
(4,  3,  3,1,0,'Camino Inca Mz A L 1',3,'VRP',UNHEX('30'),UNHEX('31')), -- COD_DIR: 3 - COD_URB: 1
(40, 24, 3,1,0,'Camino Inca Mz F-9',1,'-',UNHEX('30'),UNHEX('31')), -- COD_DIR: 24 - COD_URB: 1

-- ZONA(4)(I-I-B) FUENTE(1) - URBANO(2) MIRADOR CUSCO
(6,  6,  4,2,1,'San Martin a Lado de Reservorio Mirador',3,'VRP',UNHEX('30'),UNHEX('31')),
(7,  7,  4,2,2,'Mirador Mz E / 5 de Abril Mz D-3 (BY PASS)',3,'VRP',UNHEX('30'),UNHEX('31')),
(25, 25, 4,2,3,'Mirador Mz O-2 Area verde',2,'VRP',UNHEX('30'),UNHEX('31')),
(27, 27, 4,2,4,'APV 5 de Abril Mz M-10',2,'1550074',UNHEX('30'),UNHEX('31')),
(42, 42, 4,2,5,'APV Santa Anita Mz E-2',1,'1480988',UNHEX('30'),UNHEX('31')),
(26, 27, 4,2,0,'APV Lomas de Santa Fe Mz E-2 I- 1',2,'-',UNHEX('30'),UNHEX('31')), -- COD_DIR: 27 - COD_URB: 2

--  ZONA(5)(I-I-C) FUENTE(1) - URBANO(3) CALVARIO
(8,  8,  5,3,1,'Calvario Mz G-10',3,'VRP',UNHEX('30'),UNHEX('31')),
(28, 28, 5,3,2,'Calvario Mz (E-7 E-8) Salon Comunal',2,'VRP',UNHEX('30'),UNHEX('31')),
(9,  9,  5,3,3,'Mirador a lado Cruz Mz J-1',3,'VRP',UNHEX('30'),UNHEX('31')),
(11, 11, 5,3,4,'Don Jose de san Martin',3,'VRP',UNHEX('30'),UNHEX('31')),
(29, 29, 5,3,5,'Calvario Mz G-16',2,'1157033',UNHEX('30'),UNHEX('31')),
(10, 10, 5,3,6,'A.H Mirador a lado Cruz J-12',3,'1156485',UNHEX('30'),UNHEX('31')),
(50, 10, 8,3,0,'Mirador a lado Cruz Mz J-12',3,'1156485',UNHEX('30'),UNHEX('31')), -- COD_DIR: 10 - COD_URB: 3

--  ZONA(6)(I-I-D) FUENTE(1) - URBANO (4) SAYARI
(12, 12, 6,4,1,'Las Ñustas esmeralda parte alta',3,'VRP',UNHEX('30'),UNHEX('31')),
(13, 13, 6,4,2,'Las Ñustas A lado Cruz',3,'VRP',UNHEX('30'),UNHEX('31')),
(30, 30, 6,4,3,'Las Ñustas Mz E-4 (BY PASS)',2,'VRP',UNHEX('30'),UNHEX('31')),
(43, 43, 6,4,4,'AA.HH Las Ñustas H-8 Para Torrechayoc',1,'VRP',UNHEX('30'),UNHEX('31')),
(14, 14, 6,4,5,'Sayari Mz Area Verde P Alta chacra',3,'VRP',UNHEX('30'),UNHEX('31')),
(31, 31, 6,4,6,'Sayari Mz C-1 y D-7 (BY PASS)',2,'VRP',UNHEX('30'),UNHEX('31')),
(15, 15, 6,4,7,'Sayari Mz H-3 y G-14',3,'VRP',UNHEX('30'),UNHEX('31')),
(32, 32, 6,4,8,'Sayari Lote M-1 Frente a Ñ-6',2,'VRP',UNHEX('30'),UNHEX('31')),
(33, 33, 6,4,9,'Sayari Lote O-7 y T-11',2,'VRP',UNHEX('30'),UNHEX('31')),
(44, 44, 6,4,10,'AA.HH Santa Lucia Mz A',1,'VRP',UNHEX('30'),UNHEX('31')),
(34, 34, 6,4,11,'APV Sayari Lote Q-4',2,'1413283',UNHEX('30'),UNHEX('31')),
(45, 45, 6,4,12,'APV Santa Lucia Lote E-4',1,'1421807',UNHEX('30'),UNHEX('31')),

--  ZONA(7)(I-I-E) FUENTE(1) - URBANO (5) ALTO CUSCO
(16, 16, 7,5,1,'APV Villa el Sol Parte Alta Esquina Mz B-1 y C-17',3,'VRP',UNHEX('30'),UNHEX('31')),
(35, 35, 7,5,2,'APV Villa el Sol Parte Baja Mz G-10 y F-18',2,'VRP',UNHEX('30'),UNHEX('31')),
(17, 17, 7,5,3,'APV Alto Cusco esquina lote G-1',3,'VRP',UNHEX('30'),UNHEX('31')),
(18, 18, 7,5,4,'APV Hermanos Ayar Parte Alta J-5-B',3,'VRP',UNHEX('30'),UNHEX('31')),
(36, 36, 7,5,5,'APV Hermanos Ayar Parte Baja Mz F-5',2,'VRP',UNHEX('30'),UNHEX('31')),
(19, 19, 7,5,6,'APV Virgen de Concepcion Mz A Parte Alta',3,'VRP',UNHEX('30'),UNHEX('31')),
(37, 37, 7,5,7,'APV Virgen de Concepcion Mz C-12 y D-5',2,'VRP',UNHEX('30'),UNHEX('31')),
(38, 38, 7,5,8,'APV Virgen de Concepcion Mz O y P',2,'VRP',UNHEX('30'),UNHEX('31')),
(46, 46, 7,5,9,'APV Virgende Concepcion Mz B-1 y C-1 Parte Baja',1,'VRP',UNHEX('30'),UNHEX('31')),
(39, 39, 7,5,10,'APV La Pradera Parte Alta J-5',2,'VRP',UNHEX('30'),UNHEX('31')),
(47, 47, 7,5,11,'APV La Pradera Parte baja D-9 par const civil',1,'VRP',UNHEX('30'),UNHEX('31')),
(48, 48, 7,5,12,'APV San Antonio B-2',1,'VRP',UNHEX('30'),UNHEX('31')),

--  ZONA(8)(I-II) FUENTE(1) - URBANO (6) VILLA MARIA,ARCO,INDEP - 1
(49, 49, 8,6,1,'Tierra prometida Mz X-23 Cl Belen',3,'VRP',UNHEX('30'),UNHEX('31')),
(67, 67, 8,6,2,'APV El Rosal Av Tomasa tito Mz I-1',1,'VRP',UNHEX('30'),UNHEX('31')),
(68, 68, 8,6,3,'APV El Rosal Mz B-8',1,'VRP',UNHEX('30'),UNHEX('31')),
(69, 69, 8,6,4,'APV Los Huertos Mz D y C-4',1,'VRP',UNHEX('30'),UNHEX('31')),
(54, 54, 8,6,5,'APV Tica Tica Mz A-1 Frente al CEI Mz B-1',2,'VRP',UNHEX('30'),UNHEX('31')),
(55, 55, 8,6,6,'APV Chinchero Mz D-8 Salon Comunal',2,'VRP',UNHEX('30'),UNHEX('31')),
(70, 70, 8,6,7,'San Benito Mz D-4',1,'VRP',UNHEX('30'),UNHEX('31')),
(71, 71, 8,6,8,'APV Chanapata C-10 / Av Humberto V Unda Mz B-2',1,'VRP',UNHEX('30'),UNHEX('31')),
(56, 56, 8,6,9,'APV El Bosque Jr OHiggins Mz J-11 Parque',2,'VRP',UNHEX('30'),UNHEX('31')),
(73, 73, 8,6,10,'APV El Bosque Jr Independencia Mz A-1-1 y B',1,'VRP',UNHEX('30'),UNHEX('31')),
(57, 57, 8,6,11,'Villa Maria Zigzag',2,'VRP',UNHEX('30'),UNHEX('31')),
(59, 59, 8,6,12,'APV Picchu San Martin Jr San Martin Q-1',2,'VRP',UNHEX('30'),UNHEX('31')),
(58, 58, 8,6,13,'Picchu Alto Av Simon Bolivar Q-1 y P-3',2,'VRP',UNHEX('30'),UNHEX('31')),
(60, 60, 8,6,14,'APV Huasahuara Mz F-11 (G-9)',2,'1154267',UNHEX('30'),UNHEX('31')),
(61, 61, 8,6,15,'APV Miraflores A-12',2,'1150876',UNHEX('30'),UNHEX('31')),
(74, 74, 8,6,16,'APV Tica Tica C-1',1,'1374274',UNHEX('30'),UNHEX('31')),
(75, 75, 8,6,17,'APV Los Rosales A-20',1,'1154109',UNHEX('30'),UNHEX('31')),
(76, 76, 8,6,18,'APV Los Huertos G-9',1,'1502667',UNHEX('30'),UNHEX('31')),
(77, 77, 8,6,19,'APV EL Retamal D-2 Tica Tica',1,'1354429',UNHEX('30'),UNHEX('31')),
(62, 62, 8,6,20,'APV Callanca D-4',2,'1149533',UNHEX('30'),UNHEX('31')),
(78, 78, 8,6,21,'APV Chinchero D-2',1,'1148601',UNHEX('30'),UNHEX('31')),
(79, 79, 8,6,22,'APV San Benito F-1',1,'1146507',UNHEX('30'),UNHEX('31')),
(80, 80, 8,6,23,'APV Chanapata C-10',1,'7',UNHEX('30'),UNHEX('31')),
(81, 81, 8,6,24,'APV Bellavista A-1',1,'1136254',UNHEX('30'),UNHEX('31')),
(63, 63, 8,6,25,'APV Villa María S-1',2,'1146063',UNHEX('30'),UNHEX('31')),
(64, 64, 8,6,26,'APV Picchu Rinconada U-1 Ca Alfonso Ugarte',2,'1144709',UNHEX('30'),UNHEX('31')),
(65, 65, 8,6,27,'APV Picchu San Martin X-6',2,'330496',UNHEX('30'),UNHEX('31')),
(66, 66, 8,6,28,'APV Picchu Alto U-7',2,'1141240',UNHEX('30'),UNHEX('31')),
(51, 51, 8,6,29,'APV Independencia Mz M-2 Parte Alta ',3,'1112698',UNHEX('30'),UNHEX('31')),
(52, 52, 8,6,30,'APV Picchu San Martin Q-3 Parte Alta',3,'1140625',UNHEX('30'),UNHEX('31')),
(53, 53, 8,6,31,'APV Picchu San Martin Z-3 Parte Baja',3,'1140250',UNHEX('30'),UNHEX('31')),
(72, 71, 8,6,0,'Urb Chanapata Mz A-4',1,'-',UNHEX('30'),UNHEX('31')), -- COD_DIR: 71  - COD_URB: 6

-- ZONA(9)(II) FUENTE(2) - URBANO (7) SANTA ANA
(91, 91, 9,7,1,'Jr Chanapata Mz A San Cristobal Lote B-4',2,'VRP',UNHEX('30'),UNHEX('31')),
(85, 85, 9,7,2,'Cuesta Santa Ana por el arco # 624',3,'VRP',UNHEX('30'),UNHEX('31')),
(86, 86, 9,7,3,'Pasaje España Coop.San Cristobal Mz E-8 y C-4',2,'VRP',UNHEX('30'),UNHEX('31')),
(87, 87, 9,7,4,'Av La Raza/Psj San Sebastian N° 801',2,'VRP',UNHEX('30'),UNHEX('31')),
(88, 88, 9,7,5,'Carmenca Linea Norte S/N',2,'VRP',UNHEX('30'),UNHEX('31')),
(83, 83, 9,7,6,'APV Pueblo Libre Psje Las Ñustas P-6',3,'VRP',UNHEX('30'),UNHEX('31')),
(89, 89, 9,7,7,'Av La Raza 1065 (1070)',2,'1133897',UNHEX('30'),UNHEX('31')),
(84, 84, 9,7,8,'Calle Michipata 1065-B (100)',3,'1133831',UNHEX('30'),UNHEX('31')),
(90, 90, 9,7,9,'Calle San Cristobal B-4',2,'1474140',UNHEX('30'),UNHEX('31')),
(92, 92, 9,7,10,'Calle Saphy 704 (407)',1,'1163837',UNHEX('30'),UNHEX('31')),
(93, 93, 9,7,11,'Calle Meloq 445',1,'1158374',UNHEX('30'),UNHEX('31')),
(94, 94, 9,7,12,'Calle Saphy L-19-APV Villa Mercedes',1,'1163600',UNHEX('30'),UNHEX('31')),
(95, 95, 9,7,13,'Tambo de Montero 140',1,'-',UNHEX('30'),UNHEX('31')),
(82, 83, 9,7,0,'Pasaje Esmeralda Huasapata P-6',3,'-',UNHEX('30'),UNHEX('31')), -- COD_DIR: 83 - COD_URB: 7

-- ZONA(10)(III) FUENTE(2) - URBANO (8) CENTRO HIST. EPR. AMARGURA
(96,  96,  10,8,1,'Camara de Salesianos',3,'VRP',UNHEX('30'),UNHEX('31')),
(97,  97,  10,8,2,'Sapantiana Lote 9',3,'1350981',UNHEX('30'),UNHEX('31')),
(98,  98,  10,8,3,'Pantaccalle N° 652',2,'1401665',UNHEX('30'),UNHEX('31')),
(99,  99,  10,8,4,'Pumacurco N° 341',2,'1171871',UNHEX('30'),UNHEX('31')),
(106, 106, 10,8,5,'Plaza Arma Portal Panes 151',1,'1162109',UNHEX('30'),UNHEX('31')),
(108, 108, 10,8,6,'Procuradores N° 389',1,'1164634',UNHEX('30'),UNHEX('31')),
(100, 100, 10,8,7,'Siete borreguitos 590 A',2,'1180510',UNHEX('30'),UNHEX('31')),
(107, 107, 10,8,8,'Ca Choquechaca N° 350',1,'1179017',UNHEX('30'),UNHEX('31')),
(101, 97,  10,8,0,'Ca Sapantiana Lote 6 236',2,'-',UNHEX('30'),UNHEX('31')), -- COD_DIR: 97  - COD_URB: 8
(102, 100, 10,8,0,'Siete borreguitos B-7',2,'-',UNHEX('30'),UNHEX('31')), -- COD_DIR: 100  - COD_URB: 8
(103, 98,  10,8,0,'Ca Pantaccalle N° 640',2,'-',UNHEX('30'),UNHEX('31')), -- COD_DIR: 98 - COD_URB: 8
(104, 90,  10,8,0,'Cuesta San Cristobal 192',2,'-',UNHEX('30'),UNHEX('31')), -- COD_DIR: 90 - COD_URB: 8
(105, 99,  10,8,0,'Ca Pumacurco N° 641',2,'-',UNHEX('30'),UNHEX('31')), -- COD_DIR: 99 - COD_URB: 8
(109, 107, 10,8,0,'Ca Choquechaca N° 285',1,'-',UNHEX('30'),UNHEX('31')), -- COD_DIR: 107 - COD_URB: 8

-- ZONA(12)(IV-I) FUENTE(2) - URBANO 9 CENTRO HISTORICO
(112,112,12,9,1,'Plaza San Francisco 355',2,'1160254',UNHEX('30'),UNHEX('31')),
(117,117,12,9,2,'Calle Marquez N° 211',1,'VRP',UNHEX('30'),UNHEX('31')),
(113,113,12,9,3,'Plaza de Armas Portal Carrizo 335 (248)',2,'1166716',UNHEX('30'),UNHEX('31')),
(118,118,12,9,4,'Plazoleta Sta Teresa s/n',1,'1393993',UNHEX('30'),UNHEX('31')),
(119,119,12,9,5,'Nueva Alta 479',1,'1462317',UNHEX('30'),UNHEX('31')),
(110,110,12,9,6,'Nueva Alta 803',3,'1138632',UNHEX('30'),UNHEX('31')),
(111,111,12,9,7,'Tullumayo 301',2,'1176229',UNHEX('30'),UNHEX('31')),
(120,120,12,9,8,'Almagro 123',1,'1167497',UNHEX('30'),UNHEX('31')),
(121,121,12,9,9,'Ccasccaparo 192',1,'1103482',UNHEX('30'),UNHEX('31')),
(122,122,12,9,10,'Pantipata 773',1,'1174567',UNHEX('30'),UNHEX('31')),
(123,123,12,9,11,'Pje Grace 769',1,'1169071',UNHEX('30'),UNHEX('31')),
(124,124,12,9,12,'Av. Grau 520',1,'1118445',UNHEX('30'),UNHEX('31')),

-- ZONA(13)(IV-II) FUENTE(2) - URBANO (10) SANTIAGO
(125,125,13,10,1,'Av Ejercito N° 108 Bajo Puente Almudena',1,'VRP',UNHEX('30'),UNHEX('31')),
(126,126,13,10,2,'Pje Esmeralda 173-A',1,'15231117',UNHEX('30'),UNHEX('31')),
(127,127,13,10,3,'Av. Grau Urb Coripata Sur B-4',1,'1049214',UNHEX('30'),UNHEX('31')),
(115,115,13,10,4,'Ramiro Priale D-5 Esquina',2,'331000',UNHEX('30'),UNHEX('31')),
(116,116,13,10,5,'Rocopata N° 384',2,'1088664',UNHEX('30'),UNHEX('31')),
(114,114,13,10,6,'Almudena 1091',2,'1072586',UNHEX('30'),UNHEX('31')),
(128,128,13,10,7,'Jorge Ochoa 341 (B-7 interior)',1,'1522172',UNHEX('30'),UNHEX('31')),

-- ZONA(15)(V-I) FUENTE(2) - URBANO (11) ZARZUELA
(132,132,15,11,1,'Emiliano Huamantica Bolog Ruiz Caro Mz A-7',2,'VRP',UNHEX('30'),UNHEX('31')),
(129,129,15,11,2,'Cl Primero de Mayo Zarzuela Baja R 7',3,'VRP',UNHEX('30'),UNHEX('31')),
(130,130,15,11,3,'Urb Zarzuela Alta /Psje Libertad Mz Ñ-5',3,'VRP',UNHEX('30'),UNHEX('31')),
(133,133,15,11,4,'Jr la Torre Zarzuela Mz K-2',2,'VRP',UNHEX('30'),UNHEX('31')),
(136,136,15,11,5,'Zarzuela Av. Libertad X-2(X-3)',1,'1121973',UNHEX('30'),UNHEX('31')),
(137,137,15,11,6,'Av Grau V-13 (esquina)',1,'1330363',UNHEX('30'),UNHEX('31')),

-- ZONA(16)(V-II) FUENTE(2) - URBANO (12) ANTONIO LORENA
(131,131,16,12,1,'Plaza Almudena N° 136- A',3,'VRP',UNHEX('30'),UNHEX('31')),
(134,134,16,12,2,'Ca Coquimbo 1121',2,'1121973',UNHEX('30'),UNHEX('31')),
(135,135,16,12,3,'APV Construccion Civil B-1',2,'1330363',UNHEX('30'),UNHEX('31')),

-- ZONA(17)(V-III) FUENTE(2) - URBANO (13) SIPASPUGIO
(138,138,17,13,1,'Sipaspujio Cl Ricardo Palma B-13',1,'VRP',UNHEX('30'),UNHEX('31')),
(139,139,17,13,2,'Malampata A-4 (A-8)',1,'1094719',UNHEX('30'),UNHEX('31')),
(140,140,17,13,3,'A.H Sipaspugio J-1',1,'XXXX',UNHEX('30'),UNHEX('31')),

-- ZONA(19)(VI-I) FUENTE(3) - URBANO (14) FRANCISCO BOLOGNESI
(141,141,19,14,1,'APV Bolognesi Parte Alta / Cl Jose Olaya',3,'VRP',UNHEX('30'),UNHEX('31')),
(149,149,19,14,2,'Coop. Bolognesi Miguel Grau Mz E 18 D 19',2,'VRP',UNHEX('30'),UNHEX('31')),
(155,155,19,14,3,'Av Pedro Ruiz Gallo A-1 Coop Fco Bolognesi',1,'1085569',UNHEX('30'),UNHEX('31')),
(156,156,19,14,4,'Ca Juan V. Alvarado I-10 Dignidad Nacional',1,'1076535',UNHEX('30'),UNHEX('31')),
(152,152,19,14,5,'Coop. Francisco Bolognesi Pje. Union M-16',2,'-',UNHEX('30'),UNHEX('31')),
(146,146,19,14,6,'Coop. Francisco Bolognesi Pje. Miguel Grau F-19',3,'-',UNHEX('30'),UNHEX('31')),
(160,160,19,14,7,'Coop. Francisco Bolognesi Pje. Pedro Ruiz Gallo A-23 (A-25)',1,'-',UNHEX('30'),UNHEX('31')),

-- ZONA(20)(VI-II) FUENTE(3) - URBANO (15) MANAHUAÑUNCA
(142,142,20,15,1,'Manahuañunca Parte Alta Puente Carloto',3,'VRP',UNHEX('30'),UNHEX('31')),
(150,150,20,15,2,'Manahuañunca Av los Libertadores Mz O-9 (Ñ-9)',2,'VRP',UNHEX('30'),UNHEX('31')),
(157,157,20,15,3,'Manahuañunca Domingo Guevara E-1',1,'VRP',UNHEX('30'),UNHEX('31')),
(151,151,20,15,4,'Av Peru C-13 Urb Manahuañunca',2,'1325811',UNHEX('30'),UNHEX('31')),
(158,158,20,15,5,'Manahuañunca LL-18 Ca. Santiago',1,'1083205',UNHEX('30'),UNHEX('31')),
(147,147,20,15,6,'Calle Suiza LL-2',3,'-',UNHEX('30'),UNHEX('31')),
(153,153,20,15,7,'Pasaje Santiago O-9',2,'-',UNHEX('30'),UNHEX('31')),
(161,161,20,15,8,'Pasaje Santiago (Parque M-12)',1,'-',UNHEX('30'),UNHEX('31')),

-- ZONA(21)(VI-III) FUENTE(3) - URBANO (16) LA ESTRELLA
(159,159,21,16,1,'La Estrella I Etapa Parte Baja A-1',1,'VRP',UNHEX('30'),UNHEX('31')),
(143,143,21,16,2,'La Estrella II Etapa Parte Alta Mz K-14',3,'VRP',UNHEX('30'),UNHEX('31')),
(144,144,21,16,3,'La Estrella II Etapa Mz K-1 y L-1',3,'VRP',UNHEX('30'),UNHEX('31')),
 
-- ZONA(22)(VI-IV) FUENTE(3) - URBANO (17) MARGEN DERECHA
(145,145,22,17,1,'La Estrella II Etapa Para Guadalupe',3,'VRP',UNHEX('30'),UNHEX('31')),
(162,162,22,17,2,'Barrio de Dios I Gradas D-10',1,'VRP',UNHEX('30'),UNHEX('31')),
(163,163,22,17,3,'Barrio de Dios I Parte plana Mz E-7',1,'VRP',UNHEX('30'),UNHEX('31')),
(148,148,22,17,4,'APV Villa Guadalupe Jr Honduras Mz LL-1',3,'VRP',UNHEX('30'),UNHEX('31')),
(154,154,22,17,5,'Juan Espinoza Medrano',2,'VRP',UNHEX('30'),UNHEX('31')),

-- ZONA(24)(VII-I) FUENTE(4) - URBANO (18) HUANCARO 
(169,169,24,18,1,'Huancaro Residencial Cl Cipreses H-1',2,'VRP',UNHEX('30'),UNHEX('31')),
(170,170,24,18,2,'Av Industrial N° 121',2,'15111566',UNHEX('30'),UNHEX('31')),
(171,171,24,18,3,'Av Grau N° 26',2,'1092262',UNHEX('30'),UNHEX('31')),
(164,164,24,18,4,'APV Villa Primavera E-8',3,'1464795',UNHEX('30'),UNHEX('31')),

-- ZONA(26)(VII-III) FUENTE(4) - URBANO (20) AV. EJERCITO
(165,165,26,20,1,'Av Ejercito Parte Baja N° 1547',3,'VRP',UNHEX('30'),UNHEX('31')),
(172,172,26,20,2,'Pje Marianito Ferro A-21',2,'1607594',UNHEX('30'),UNHEX('31')),
(166,166,26,20,3,'Av Ramon Castilla A-12 Urb Bancop',3,'1050660',UNHEX('30'),UNHEX('31')),
(178,178,26,20,4,'APV Reyna de Belen C-27',1,'1018795',UNHEX('30'),UNHEX('31')),

-- ZONA(25)(VII-II) FUENTE(4) - URBANO (19) WANCHAC
(173,173,25,19,1,'Av de la Cultura 732 Universidad Andina del Cusco',2,'VRP',UNHEX('30'),UNHEX('31')),
(174,174,25,19,2,'Av Los Incas N° 925',2,'1236222',UNHEX('30'),UNHEX('31')),
(179,179,25,19,3,'Jr Canas K-8',1,'1258444',UNHEX('30'),UNHEX('31')),
(180,180,25,19,4,'Av Tupac Amaru O-3',1,'1254246',UNHEX('30'),UNHEX('31')),
(181,181,25,19,5,'Ca Mateo Pumaccahua N-2',1,'1047881',UNHEX('30'),UNHEX('31')),
(182,182,25,19,6,'Av Micaela Basti 345 Tienda 435 (433)',1,'1405341',UNHEX('30'),UNHEX('31')),
(167,167,25,19,7,'Av Huayruropata N° 900 Frente a Terminal Sicuani',3,'1240999',UNHEX('30'),UNHEX('31')),
(168,168,25,19,8,'Av Tacna N° 106',3,'1457321',UNHEX('30'),UNHEX('31')),
(175,175,25,19,9,'Av Pachacutec N° 522 (525)',2,'1039972',UNHEX('30'),UNHEX('31')),
(183,183,25,19,10,'Av San Martin N° 206',1,'1497750',UNHEX('30'),UNHEX('31')),
(176,176,25,19,11,'Av El Sol N° 1200 Centro Art Inti paqarek',2,'1442619',UNHEX('30'),UNHEX('31')),
(177,177,25,19,12,'Av El Sol N° 603',2,'1169968',UNHEX('30'),UNHEX('31')),
(184,184,25,19,13,'Av Machupicchu L-7 Dolorespata',1,'1056553',UNHEX('30'),UNHEX('31')),
(185,185,25,19,14,'Ca Agustin Gamarra A-2',1,'1056791',UNHEX('30'),UNHEX('31')),
(186,186,25,19,15,'Av Torre Tagle B-3. APV El Rosal',1,'1059396',UNHEX('30'),UNHEX('31')),

-- ZONA(28)(VIII-I) FUENTE(2) - URBANO (21) TAHUANTINSUYO
(187,187,28,21,1,'Quinta Zarate Lucrepata N° 266',3,'VRP',UNHEX('30'),UNHEX('31')),
(188,188,28,21,2,'Urb Tahuantinsuyo Jr. Tetecaca 625',3,'VRP',UNHEX('30'),UNHEX('31')),
(198,198,28,21,3,'Av Argentina - Jr Alto Peru Lote B-23',2,'VRP',UNHEX('30'),UNHEX('31')),
(199,199,28,21,4,'Pumapaccha N° 257-B',2,'1615209',UNHEX('30'),UNHEX('31')),
(208,208,28,21,5,'Av Garcilaso N° 411 Dpto. 302',1,'1454179',UNHEX('30'),UNHEX('31')),
(200,200,28,21,6,'lucrepatab 401-A',2,'1339179',UNHEX('30'),UNHEX('31')),
(209,209,28,21,7,'AGV. Zarumilla A-1',1,'1223392',UNHEX('30'),UNHEX('31')),
(201,201,28,21,8,'Ca Tupac Yupanqui 278 Tahuantin',2,'202379',UNHEX('30'),UNHEX('31')),
(210,210,28,21,9,'Mariscal Gamarra I Etapa 5-A',1,'1213270',UNHEX('30'),UNHEX('31')),
(202,202,28,21,10,'Ca Venezuela N-7(Ñ-7) Ucchullo Grande',2,'1222431',UNHEX('30'),UNHEX('31')),
(211,211,28,21,11,'Av Collasuyo I-1 Jr Wiracocha',1,'1224375',UNHEX('30'),UNHEX('31')),
(189,189,28,21,12,'Ca Jose C. Mariat E-1 Urb Cruzpa',3,'1202585',UNHEX('30'),UNHEX('31')),

-- ZONA(29)(VIII-II) FUENTE(2) - URBANO (22) UCCHULLO ALTO
(203,203,29,22,1,'Urb Los Angeles cl Velasco Lote C-7 y E-1',2,'VRP',UNHEX('30'),UNHEX('31')),
(190,190,29,22,2,'Ca Las Americas E-1(E-4) Urb Cristo Pobre',3,'1191988',UNHEX('30'),UNHEX('31')),
(191,191,29,22,3,'APV Virgen Guadalupe A-1-6',3,'1197928',UNHEX('30'),UNHEX('31')),
(192,192,29,22,4,'Jr Cahuide X-3 Urb Los Incas',3,'122614',UNHEX('30'),UNHEX('31')),

-- ZONA(30)(VIII-III) FUENTE(2) - URBANO (23) KARI GRANDE
(193,193,30,23,1,'Urb Garcilaso Cl Florida del Inca Mz A-6 y C-9',3,'VRP',UNHEX('30'),UNHEX('31')),
(194,194,30,23,2,'Urb Garcilaso Cl Florida del Inca Mz E-1 y D-5',3,'VRP',UNHEX('30'),UNHEX('31')),
(195,195,30,23,3,'APV Kari Grande Frente Lote P-11',3,'VRP',UNHEX('30'),UNHEX('31')),
(204,204,30,23,4,'Urb 1° de Mayo Micaela Bastidas G-21',2,'1455363',UNHEX('30'),UNHEX('31')),
(205,205,30,23,5,'APV Kari Grande G-11',2,'1318129',UNHEX('30'),UNHEX('31')),
(212,212,30,23,6,'Ca 30 de Agosto A-1 YACANORA',1,'1315488',UNHEX('30'),UNHEX('31')),

-- ZONA(40)(X) FUENTE(5) - URBANO (32) SALKANTAY
(251,251,40,32,1,'Urb Los Incas /Jr Sacsayhuaman Mz Q-9',3,'VRP',UNHEX('30'),UNHEX('31')),
(255,255,40,32,2,'Los Licenciados Jr Cahuide mz B1-4',2,'VRP',UNHEX('30'),UNHEX('31')),
(256,256,40,32,3,'Los Licenciados - 1° de Mayo Mz O y J',2,'VRP',UNHEX('30'),UNHEX('31')),
(258,258,40,32,4,'APV Victoria Mz B-1',1,'VRP',UNHEX('30'),UNHEX('31')),
(259,259,40,32,5,'APV Victoria A-16',1,'1208944',UNHEX('30'),UNHEX('31')),
(252,252,40,32,6,'A.H Huayracpunco D-1',3,'1199759',UNHEX('30'),UNHEX('31')),
(253,253,40,32,7,'APV Ayuda Mutua M-1-3',3,'1350005',UNHEX('30'),UNHEX('31')),
(254,254,40,32,8,'APV Ayuda Mutua E-9',3,'1195711',UNHEX('30'),UNHEX('31')),
(257,257,40,32,9,'Jr de la Puente Uceda G-1',2,'1190498',UNHEX('30'),UNHEX('31')),
(260,260,40,32,10,'APV San Marcos B-1',1,'1183364',UNHEX('30'),UNHEX('31')),

-- ZONA(33)(IX-I) FUENTE(4) - URBANO (25) MAGISTERIO
(215,215,33,25,1,'Av Collasuyo s/n Colegio Mayor Univ',3,'1215249',UNHEX('30'),UNHEX('31')),
(216,216,33,25,2,'Av Collasuyo A-2 Magisterio',3,'1218195',UNHEX('30'),UNHEX('31')),
(217,217,33,25,3,'Av Los Manantiales B-15 / L-16',3,'1401869',UNHEX('30'),UNHEX('31')),
(219,219,33,25,4,'Av de la Cultura 3035 (A-2) a lado de CTC',2,'1234651',UNHEX('30'),UNHEX('31')),
(220,220,33,25,5,'Av De la Cultura 1706-B-2',2,'1516878',UNHEX('30'),UNHEX('31')),
(221,221,33,25,6,'Av Micaela Bastidas 203 / 612',2,'1440822',UNHEX('30'),UNHEX('31')),
(236,236,33,25,7,'San Judas Grande A-13',1,'1036377',UNHEX('30'),UNHEX('31')),
(222,222,33,25,8,'Av Tupac Amaru P-15',2,'1260675',UNHEX('30'),UNHEX('31')),
(223,223,33,25,9,'Av Peru B-I-10 Progreso',2,'1479496',UNHEX('30'),UNHEX('31')),
(237,237,33,25,10,'Jr Espinar K-19',1,'1258499',UNHEX('30'),UNHEX('31')),

-- ZONA(34)(IX-II) FUENTE(4) - URBANO (26) SANTA MONICA
(224,224,34,26,1,'Av de la Cultura C-14',2,'1243696',UNHEX('30'),UNHEX('31')),
(225,225,34,26,2,'Ca Ciro Alegria H-1',2,'1244255',UNHEX('30'),UNHEX('31')),
(226,226,34,26,3,'Jr Ricardo Palma N-1',2,'1402768',UNHEX('30'),UNHEX('31')),

-- ZONA(35)(IX-III) FUENTE(4) - URBANO (27) MARCAVALLE
(227,227,35,27,1,'Av de la Cultura N° 101 (A1-101)',2,'1262177',UNHEX('30'),UNHEX('31')),
(228,228,35,27,2,'Marcavalle O-16-A',2,'1254984',UNHEX('30'),UNHEX('31')),
(229,229,35,27,3,'Pje Gaston Zapata J-1-413',2,'1264646',UNHEX('30'),UNHEX('31')),

-- ZONA(36)(IX-IV) FUENTE(4) - URBANO (28) SANTA URSULA
(230,230,36,28,1,'Santa Ursula Cocacola',2,'VRP',UNHEX('30'),UNHEX('31')),
(238,238,36,28,2,'Jose C. Mariategui F-7',1,'1270393',UNHEX('30'),UNHEX('31')),
(239,239,36,28,3,'Jose C. Mariategui A-2',1,'1334856',UNHEX('30'),UNHEX('31')),
(231,231,36,28,4,'Av Tupac Amaru C-5 Villa el Periodista',2,'1321555',UNHEX('30'),UNHEX('31')),
(218,218,36,28,5,'Av Camino Real N° 318',3,'1339431',UNHEX('30'),UNHEX('31')),

-- ZONA(37)(IX-V) FUENTE(4) - URBANO (29) PARQUE INDUSTRIAL
(240,240,37,29,1,'Prol Diagonal Angamos L-19',1,'VRP',UNHEX('30'),UNHEX('31')),
(241,241,37,29,2,'Av Via Expresa K-3 (K-2)',1,'1357411',UNHEX('30'),UNHEX('31')),
(242,242,37,29,3,'Ca Las Americas C-4-B',1,'1413523',UNHEX('30'),UNHEX('31')),
(243,243,37,29,4,'Av Republica de Brasil A-1-2-3',1,'1033136',UNHEX('30'),UNHEX('31')),

-- ZONA(38)(IX-VI) FUENTE(4) - URBANO (30) TTIO NORTE
(232,232,38,30,1,'Mercado de Ttio Av Los Libertadores Q-10',2,'VRP',UNHEX('30'),UNHEX('31')),
(233,233,38,30,2,'Ca. Topacio (F-8) F-9 Urb Kennedy A',2,'135989-1036140',UNHEX('30'),UNHEX('31')), -- OBS
(234,234,38,30,3,'Pje Proceres (E-1-16) D-1-18 Urb Ttio',2,'1852853-1030917',UNHEX('30'),UNHEX('31')), -- OBS
(235,235,38,30,4,'Av 28 de Julio Lado Posta Medica',2,'1027296',UNHEX('30'),UNHEX('31')),

-- ZONA(39)(IX-VII) FUENTE(4) - URBANO (31) TTIO SUR
(244,244,39,31,1,'Jr Qoricancha V-3 Simon Herrera',1,'1020777',UNHEX('30'),UNHEX('31')),
(245,245,39,31,2,'Pje Clorinda Matto de Turner O-1-11',1,'1018262',UNHEX('30'),UNHEX('31')),
(246,246,39,31,3,'Jr Qoricancha U-1-1 Esq',1,'1016704',UNHEX('30'),UNHEX('31')),
(247,247,39,31,4,'Ca Los Cipreces Ñ-17',1,'1025965',UNHEX('30'),UNHEX('31')),
(248,248,39,31,5,'Av Jorge Chavez G-2-12',1,'1017114',UNHEX('30'),UNHEX('31')),
(249,249,39,31,6,'Av Costanera C-3-13',1,'1000568',UNHEX('30'),UNHEX('31')),
(250,250,39,31,7,'Pje Los Claveles A-12 Urb La Florida',1,'1026342',UNHEX('30'),UNHEX('31')),

-- ZONA(42)(XI-I) FUENTE(4) - URBANO (33) SAN SEBASTIAN
(267,267,42,33,1,'Prol Av de la Cultura/ Cl Bolivar # 1401 y 228',3,'VRP',UNHEX('30'),UNHEX('31')),
(272,272,42,33,2,'Av Cusco Lote 707',2,'VRP',UNHEX('30'),UNHEX('31')),
(281,281,42,33,3,'Urb los Sauces Pradera Cl San Miguel',1,'VRP',UNHEX('30'),UNHEX('31')),
(273,273,42,33,4,'Prol Av de la Cultura Calle Francia L 1',2,'VRP',UNHEX('30'),UNHEX('31')),
(274,274,42,33,5,'Prol Av de la Cultura Urb Coviduc',2,'VRP',UNHEX('30'),UNHEX('31')),
(275,275,42,33,6,'Prol Av de la Cultura Calle Kishuar la Planicie (F-21)',2,'VRP-1317083',UNHEX('30'),UNHEX('31')), -- OBS
(276,276,42,33,7,'Prol Av de la Cultura Cl Diego Tupac Amaru',2,'VRP',UNHEX('30'),UNHEX('31')),
(285,285,42,33,8,'Prol Av dela Cultura Urb picol',1,'VRP',UNHEX('30'),UNHEX('31')),
(286,286,42,33,9,'Prol Av de las Cultura villa los Pinos',1,'VRP',UNHEX('30'),UNHEX('31')),
(287,287,42,33,10,'Prol Av de la cultura villa El carmen',1,'VRP',UNHEX('30'),UNHEX('31')),

-- ZONA(42)(XI-I) FUENTE(4) - URBANO (34) SAN SEBASTIAN SANTA ROSA
(268,268,42,34,1,'Av De la Cultura 1100',3,'1329644',UNHEX('30'),UNHEX('31')),
(269,269,42,34,2,'Villa Las Mercedes L-22 Junto a la via',3,'1298986',UNHEX('30'),UNHEX('31')),
(288,288,42,34,3,'Av Tomas Tuyrutupac N° 1977 (2020)',1,'1319388-1271872',UNHEX('30'),UNHEX('31')), -- OBS
(271,271,42,34,4,'APV Casuarinas Sur B-2 Manantiales',2,'1390752',UNHEX('30'),UNHEX('31')),
(261,261,42,34,5,'Jr Sucre Z-1-1 Urb Santa Rosa',3,'1379075',UNHEX('30'),UNHEX('31')),

-- ZONA(31)(VIII-IV) FUENTE(2) - URBANO (24) SAN SEBASTIAN ALTO
(213,213,31,24,1,'Pucllasunchis N° 427',1,'VRP',UNHEX('30'),UNHEX('31')),
(214,214,31,24,2,'APV Ladrillera A1-B',1,'1290637',UNHEX('30'),UNHEX('31')),
(196,196,31,24,3,'Villa Mirador B-8 II Etapa',3,'1451870',UNHEX('30'),UNHEX('31')),
(197,197,31,24,4,'Ca Intiraymi Ñ-6(N-6)',3,'1446679',UNHEX('30'),UNHEX('31')),
(206,206,31,24,5,'PRLG de la Cultura 1259 Alt Resid Campiña',2,'1414455',UNHEX('30'),UNHEX('31')),
(207,207,31,24,6,'Urb Yacanora L-4',2,'1469052',UNHEX('30'),UNHEX('31')),

-- ZONA(42)(XI-I) FUENTE(4) - URBANO (35) SAN SEBASTIAN CAMPIÑA
(277,277,43,35,1,'Av Via Expresa B-5',2,'1357251',UNHEX('30'),UNHEX('31')),
(284,284,43,35,2,'APV Los Proceres A-3 Av Las Flores',1,'1422660',UNHEX('30'),UNHEX('31')),
(270,270,43,35,3,'Tupac Katari V1-10',2,'1312281',UNHEX('30'),UNHEX('31')),
(282,282,43,35,4,'Av Fernando Tupac Amaru LL-1-B (Final)',1,'1504807',UNHEX('30'),UNHEX('31')),
(265,265,43,35,5,'Villa Postal C-19',3,'1576723',UNHEX('30'),UNHEX('31')),
(289,289,43,35,6,'APV la Cantuta C-3-1 Frente a Penal',1,'1515106',UNHEX('30'),UNHEX('31')),

-- ZONA(43)(XI-II) FUENTE(4) - URBANO (36) CAMPIÑA
(280,280,43,36,7,'Ca Angamos C-6 Urb Miguel Grau',1,'1286471',UNHEX('30'),UNHEX('31')),
(262,262,43,36,8,'APV Pachamayo B-13',3,'1373762',UNHEX('30'),UNHEX('31')),
(263,263,43,36,9,'Villa Ecologica L-5 / C-5',3,'1454442',UNHEX('30'),UNHEX('31')),

-- ZONA(44)(XI-III) FUENTE(4) - URBANO (37)  LARAPA
(264,264,44,37,1,'Larapa Parte Alta Machupicol cl los Jazmines D-6',3,'VRP',UNHEX('30'),UNHEX('31')),
(266,266,44,37,2,'Larapa Parte Baja Av 08 los Kantus',3,'VRP',UNHEX('30'),UNHEX('31')),
(283,283,44,37,3,'Urb Versalles Lote 3 Av Cinco',1,'1475823',UNHEX('30'),UNHEX('31')),
(278,278,44,37,4,'Larapa Grande B4-B5-11 Av 6',2,'1333253',UNHEX('30'),UNHEX('31')),
(279,279,44,37,5,'Larapa Grande H-9-1 Av 8',3,'1336949',UNHEX('30'),UNHEX('31')),

-- ZONA(46)(XII-I) FUENTE(4) - URBANO (38) WIMPILLAY
(290,290,46,38,1,'PPJJ General Ollanta/ Cl Micaela Bastidas G-10',3,'VRP',UNHEX('30'),UNHEX('31')),
(309,309,46,38,2,'Wimpillay /Av Luis Vallejo Santoni A 2',1,'VRP',UNHEX('30'),UNHEX('31')),
(291,291,46,38,3,'Av Huascar J-12',3,'1360932',UNHEX('30'),UNHEX('31')),
(292,292,46,38,4,'Ca Mariano Melgar H-10 Margen derecha',3,'1409516',UNHEX('30'),UNHEX('31')),
(310,310,46,38,5,'Ca Daniel Alcides Carrion B-1-B M derecha',1,'1418584',UNHEX('30'),UNHEX('31')),

-- ZONA(47)(XII-II) FUENTE(4) - URBANO (39) VELASCO ASTETE
(293,293,47,39,1,'Punto C San Judas Chico B-7',3,'VRP',UNHEX('30'),UNHEX('31')),
(311,311,47,39,2,'Av Velasco Astete D-4',1,'1000046',UNHEX('30'),UNHEX('31')),
(312,312,47,39,3,'Urb Velasco Astete B-23',1,'1007361',UNHEX('30'),UNHEX('31')),
(294,294,47,39,4,'APV San Judas Chico B-15',3,'1475710',UNHEX('30'),UNHEX('31')),

-- ZONA(48)(XII-III) FUENTE(4) - URBANO (40) LOS NOGALES
(295,295,48,40,1,'Hilario Mendivil',3,'VRP',UNHEX('30'),UNHEX('31')),
(296,296,48,40,2,'A.H Agua Buena F-2',3,'1439909',UNHEX('30'),UNHEX('31')),
(305,305,48,40,3,'Francisco Palao B-21',2,'1322896',UNHEX('30'),UNHEX('31')),
(313,313,48,40,4,'Jr Nazca A-25-A Surihuaylla',1,'1578918',UNHEX('30'),UNHEX('31')),
(297,297,48,40,5,'APV El Mollecito A-5-B',3,'1474833',UNHEX('30'),UNHEX('31')),
(314,314,48,40,6,'Surihuaylla Grande J-11',1,'1549617',UNHEX('30'),UNHEX('31')),

-- ZONA(49)(XII-IV) FUENTE(4) - URBANO (41) SAN ANTONIO
(298,298,49,41,1,'APV San Antonio Mz G -12',3,'VRP',UNHEX('30'),UNHEX('31')),
(299,299,49,41,2,'APV San Antonio I-16-4',3,'1067738',UNHEX('30'),UNHEX('31')),
(300,300,49,41,3,'APV Corde Cusco E-27',3,'1480864',UNHEX('30'),UNHEX('31')),
(301,301,49,41,4,'Jr Gregorio ApazaI J-13 Urb Tupac Amaru',3,'1311495',UNHEX('30'),UNHEX('31')),

-- ZONA(50)(XII-V) FUENTE(4) - URBANO (42) UVIMAS
(315,315,50,42,1,'APV Lucerinas',1,'VRP',UNHEX('30'),UNHEX('31')),
(316,316,50,42,2,'APV Uvima VII Mz E-8',1,'VRP',UNHEX('30'),UNHEX('31')),
(317,317,50,42,3,'APV Procasa Uvima V Mz C-4',1,'VRP',UNHEX('30'),UNHEX('31')),
(318,318,50,42,4,'APV Horacio Zevallos A-2',1,'1386358',UNHEX('30'),UNHEX('31')),
(319,319,50,42,5,'Calle Miguel Bastidas A-1 Urb Tupac Amaru',1,'1554465',UNHEX('30'),UNHEX('31')),
(320,320,50,42,6,'APV 30 de Setiembre I-5',1,'1577111',UNHEX('30'),UNHEX('31')),

-- ZONA(51)(XIII) FUENTE(4) - URBANO (43) RESERVORIO CARAMASCARA R-14
(321,321,51,43,1,'APV Frutales A-11',1,'1964256',UNHEX('30'),UNHEX('31')),
(322,322,51,43,2,'APV Nuevo Horizonte Petro Peru D-1',1,'1437452',UNHEX('30'),UNHEX('31')),
(306,306,51,43,3,'APV El Tablon L-21',2,'1431452',UNHEX('30'),UNHEX('31')),
(302,302,51,43,4,'APV Picol Orcopucyo M-5(M-24)',3,'1015006',UNHEX('30'),UNHEX('31')), -- OBS
(323,323,51,43,5,'APV Altiva Canas',1,'VRP',UNHEX('30'),UNHEX('31')),
(303,303,51,43,6,'APV Patron San Jeronimo A-11',3,'1716458',UNHEX('30'),UNHEX('31')),
(304,304,51,43,7,'APV Nuevo Horizonte C-4',3,'1556490',UNHEX('30'),UNHEX('31')),
(307,307,51,43,8,'APV Villa Rinconada A-13',2,'1376414',UNHEX('30'),UNHEX('31')),
(308,308,51,43,9,'APV Patron San Jeronimo',2,'VRP',UNHEX('30'),UNHEX('31')),

-- ZONA(52)(XIV) FUENTE(4) - URBANO (44) MARGEN DERECHA R-15
(324,324,52,44,1,'Margen Derecha Mz. D-1',3,'-',UNHEX('30'),UNHEX('31')),
(325,325,52,44,2,'Margen Derecha Mz. D-2',3,'-',UNHEX('30'),UNHEX('31')),
(326,326,52,44,3,'Margen Derecha Mz. D-3',3,'-',UNHEX('30'),UNHEX('31')),
(327,327,52,44,4,'Margen Derecha Mz. D-4',3,'-',UNHEX('30'),UNHEX('31')),
(328,328,52,44,5,'Margen Derecha Mz. D-5',3,'-',UNHEX('30'),UNHEX('31')),
(329,329,52,44,6,'Margen Derecha Mz. D-6',3,'-',UNHEX('30'),UNHEX('31'));
*/