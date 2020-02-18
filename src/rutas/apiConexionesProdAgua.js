/**
 * @class ConexionesProdAgua(Router)
 * @file apiConexionesProdAgua.js
 * @author {carrillog.luis[at]gmail[dot]com,jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Luis.Carrillo.Gutiérrez__Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

/*
DROP TABLE IF EXISTS conexionesProdAgua;
DELIMITER $$
CREATE TABLE IF NOT EXISTS conexionesProdAgua (
    codigoProdConexion INTEGER UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
	codigoZona INTEGER UNSIGNED NOT NULL,
	mes CHAR(2) CHARACTER SET utf8 NOT NULL,
    agno CHAR(4) CHARACTER SET utf8 NOT NULL,
    tipoAltitud TINYINT(1) UNSIGNED NOT NULL, -- alta media baja
	numeroConexiones INTEGER UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
$$
DELIMITER ;

ALTER TABLE conexionesProdAgua ADD CONSTRAINT UNIQUE KEY (codigoZona, mes, agno);
-- NUM TABLE = 8;
-- NUM PROCE = 3;
*/

'use strict';
const gestorRutaConexionesProdAgua = require('express').Router();
const proveedorDeDatos = require('../conexiondb.js');

/**
 * @description Gestionar Ruta para Calcular el total de Conexiones Activas por Zona y Altitud (POST) "/api/conexionprod/total/zonaalitud"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaConexionesProdAgua.post('/total/zonaaltitud/', async function(solicitud, respuesta) {
    /*
    DROP PROCEDURE IF EXISTS listarTotalConexionesProdAguaZonaAltitud;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarTotalConexionesProdAguaZonaAltitud ( 
    IN `@zona` CHAR(2) CHARACTER SET utf8,
    IN `@altitud` CHAR(2) CHARACTER SET utf8,
    IN `@inicio` INTEGER UNSIGNED,
    IN `@resultados` INTEGER UNSIGNED
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
    
    SELECT C.codigoProdConexion,C.codigoZona,C.numeroConexiones,C.tipoAltitud,Z.sector,Z.subSector,Z.microSector FROM conexionesProdAgua C, zona Z 
    WHERE C.tipoAltitud LIKE BINARY `@altitud` AND C.codigoZona LIKE BINARY `@zona`AND C.codigoZona = Z.codigoZona AND HEX(UNHEX(Z.habilitado)) = "01"
    LIMIT `@inicio`,`@resultados`;

    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {     
        const { zona, altitud, inicio, resultados} = solicitud.body;      
        await proveedorDeDatos.query("CALL listarTotalConexionesProdAguaZonaAltitud(?,?,?,?)"  // Consulta a procedimiento almacenado
        , [ zona, altitud, parseInt(inicio), parseInt(resultados) ]
        , (error, resultado) => { 
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else{
                if(resultado[0])
                respuesta.json( resultado[0] );  // Enviar resultado de consulta en JSON 
                else
                respuesta.json({ error : "vacio" }); // Enviar error en JSON
            }
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones 
    } catch(error) { respuesta.json({ error : error.code }) } // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Obtener Conexiones Activas de Producción de Agua (POST) "/api/conexionprod/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaConexionesProdAgua.post('/activas', async (solicitud, respuesta) => { 
    /*
    
    DROP FUNCTION IF EXISTS calcularConexionesAguaActivasZonaAltitud;
    DELIMITER $$
    CREATE FUNCTION calcularConexionesAguaActivasZonaAltitud (
    `@zona` CHAR(2),
    `@altitud` CHAR(2),
    `@mes` CHAR(2),
    `@agno` CHAR(4)
    ) RETURNS INTEGER UNSIGNED
    BEGIN

    DECLARE numeroConexiones_ INTEGER UNSIGNED;
        
    SELECT SUM(numeroConexiones) INTO numeroConexiones_ FROM conexionesProdAgua
    WHERE CONVERT(mes, INTEGER) LIKE CONVERT(`@mes`, INTEGER) AND CONVERT(agno, INTEGER) LIKE CONVERT(`@agno`, INTEGER)
    AND tipoAltitud LIKE BINARY `@altitud` AND codigoZona LIKE BINARY `@zona`;

    RETURN numeroConexiones_;

    END
    $$
    DELIMITER ;
    */
    try {       
        const { zona, altitud } = solicitud.body;    
        await proveedorDeDatos.query("SELECT calcularConexionesAguaActivasZonaAltitud(?,?,'04','2019') AS conexionesActivas", 
            [ zona, altitud ],
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
 * @description Gestionar Ruta para Agregar Conexiones Activas de Producción de Agua (POST) "/api/conexionprod/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaConexionesProdAgua.post('/', async (solicitud, respuesta) => { 
    /*
    DROP PROCEDURE IF EXISTS agregarConexionesProdAgua;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS agregarConexionesProdAgua (
        IN `@zona` INTEGER UNSIGNED,
        IN `@altitud` INTEGER UNSIGNED,
        IN `@conexiones` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN

    IF NOT EXISTS (SELECT * FROM conexionesProdAgua WHERE codigoZona = `@zona` AND tipoAltitud = `@altitud`)
    THEN 
        INSERT INTO conexionesProdAgua(codigoZona,mes,agno,tipoAltitud,numeroConexiones) 
        VALUES (`@zona`, "01", "2014", `@altitud`, `@conexiones`);
        INSERT INTO bitacora VALUES (`@quien`, 8, CONCAT(`@zona`,'-',`@altitud`), 0, CURRENT_TIMESTAMP);
         SELECT "REGISTRADO" registrado;
    ELSE SELECT "ERROR" error;
    END IF;

    END;
    $$
    DELIMITER ;
    */
    try {   
        const { zona, altitud, conexiones, quien } = solicitud.body;
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL agregarConexionesProdAgua(?, ?, ?, ?)", 
            [ zona, altitud, conexiones, quien ],
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
 * @description Gestionar Ruta para Modificar datos de un Total de Conexiones De Prodcción de Agua (PUT) "/api/conexionprod/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaConexionesProdAgua.put('/', async (solicitud, respuesta ) => {
    /*
    DROP PROCEDURE IF EXISTS modificarTotalConexionesProdAgua;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarTotalConexionesProdAgua (
        IN `@codigo` INTEGER UNSIGNED,
        IN `@zona` INTEGER UNSIGNED,
        IN `@altitud` INTEGER UNSIGNED,
        IN `@conexiones` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN 

    IF NOT EXISTS (SELECT * FROM conexionesProdAgua WHERE codigoProdConexion <> `@codigo` AND codigoZona = `@zona` AND tipoAltitud = `@altitud`)
    THEN 
        UPDATE conexionesProdAgua SET codigoZona = `@zona`, tipoAltitud = `@altitud`, numeroConexiones = `@conexiones`
        WHERE codigoProdConexion =`@codigo`;
        INSERT INTO bitacora VALUES (`@quien`, 8, `@codigo`, 2, CURRENT_TIMESTAMP);
         SELECT "MODIFICADO" registrado;
    ELSE SELECT "ERROR" error;
    END IF;

    END; 
    $$
    DELIMITER ;
    */
    try {
        const { codigo , zona , altitud, conexiones , quien } = solicitud.body;
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query("CALL modificarTotalConexionesProdAgua(?, ?, ?, ?, ?)", 
            [ codigo , zona , altitud, conexiones , quien ], 
            (error, resultado) => {
                if (error){ respuesta.json({ "error" : error }) }
                else { respuesta.json( resultado[0] )}   
        });
        proveedorDeDatos.release();
    } catch(errorExcepcion) { 
        respuesta.json({ "error" : errorExcepcion.code });
    }
});

/**
 * @description Gestionar Ruta para Verificar el Número de Procedimientos Almacenados para el módulo de Conexiones de Prodicción de Agua (GET) "/api/bloque/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaConexionesProdAgua.get('/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosConexionesProdAgua;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosConexionesProdAgua ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total
        FROM information_schema.routines
        WHERE specific_name='agregarConexionesProdAgua' OR
              specific_name='listarTotalConexionesProdAguaPorZona' OR
              specific_name='calcularConexionesAguaActivasZonaAltitud' OR 
              specific_name='modificarTotalConexionesProdAgua';
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [4] */
        await proveedorDeDatos.query( "CALL contarProcedimientosConexionesProdAgua()",
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

module.exports = gestorRutaConexionesProdAgua; //EXPORTAR FUNCIONES AL ROUTER

/** DATOS DE CONEXIONES DEL DEPARTAMENTO DE PRODUCCIÓN DE AGUA
TRUNCATE conexionesProdAgua;
-- ZONA I-I
call agregarConexionesProdAgua(2,3,880,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(2,2,941,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(2,1,1218,"483328ab064d11ea99d2aecf04a42be9");

-- ZONA I-II
call agregarConexionesProdAgua(8,3,774,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(8,2,471,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(8,1,1063,"483328ab064d11ea99d2aecf04a42be9");

-- ZONA II
call agregarConexionesProdAgua(9,3,245,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(9,2,259,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(9,1,1041,"483328ab064d11ea99d2aecf04a42be9");

-- ZONA III
call agregarConexionesProdAgua(10,3,165,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(10,2,415,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(10,1,563,"483328ab064d11ea99d2aecf04a42be9");

-- ZONA IV
call agregarConexionesProdAgua(11,3,350,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(11,2,722,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(11,1,4319,"483328ab064d11ea99d2aecf04a42be9");

-- ZONA V
call agregarConexionesProdAgua(14,3,239,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(14,2,756,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(14,1,1706,"483328ab064d11ea99d2aecf04a42be9");

-- ZONA VI
call agregarConexionesProdAgua(18,3,578,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(18,2,700,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(18,1,823,"483328ab064d11ea99d2aecf04a42be9");

-- ZONA VII
call agregarConexionesProdAgua(23,3,374,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(23,2,549,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(23,1,6443,"483328ab064d11ea99d2aecf04a42be9");

-- ZONA VII
call agregarConexionesProdAgua(27,3,1328,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(27,2,1275,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(27,1,5227,"483328ab064d11ea99d2aecf04a42be9");

-- ZONA IX
call agregarConexionesProdAgua(32,3,241,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(32,2,456,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(32,1,9966,"483328ab064d11ea99d2aecf04a42be9");

-- ZONA X
call agregarConexionesProdAgua(40,3,311,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(40,2,404,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(40,1,1077,"483328ab064d11ea99d2aecf04a42be9");

-- ZONA XI
call agregarConexionesProdAgua(41,3,945,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(41,2,1055,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(41,1,8244,"483328ab064d11ea99d2aecf04a42be9");

-- ZONA XII
call agregarConexionesProdAgua(45,3,881,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(45,2,1000,"483328ab064d11ea99d2aecf04a42be9");
call agregarConexionesProdAgua(45,1,6351,"483328ab064d11ea99d2aecf04a42be9");

 */