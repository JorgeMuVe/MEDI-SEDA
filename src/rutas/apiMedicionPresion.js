/**
 * @class MedicionPresion(Router)
 * @file apiMedicionPresion.js
 * @author {carrillog.luis[at]gmail[dot]com,jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Luis.Carrillo.Gutiérrez__Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

/*
DROP TABLE IF EXISTS medicionPresion;
DELIMITER $$
CREATE TABLE IF NOT EXISTS medicionPresion (
    codigoPresion INTEGER UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    codigoActividad INTEGER UNSIGNED NOT NULL,
    lecturaArriba NUMERIC(18, 3) NOT NULL, -- con decimales ??? 
    lecturaAbajo NUMERIC(18, 3) NULL, -- con decimales ??? 
    habilitado BINARY(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
$$
DELIMITER ;

-- NUM TABLA = 11;
-- NUM PROCE = 3;
*/

'use strict';
const gestorRutaPresion = require('express').Router();// INICIAR ENRUTADOR DE EXPRESS SERVER
const proveedorDeDatos = require('../conexiondb.js'); //CONEXIÓN A BASE DE DATOS

/**
 * @description Gestionar Ruta para Buscar una Actividad del tipo Medición de Presión por el código de la Actividad (GET) "/api/presion/:codigo"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaPresion.get('/:codigo', async function(solicitud, respuesta) { // Buscar una Actividad Presion por codigo
    /*
    DROP PROCEDURE IF EXISTS buscarActividadPresion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS buscarActividadPresion (
    IN `@actividad` INTEGER UNSIGNED
    ) BEGIN

        SELECT A.codigoActividad,A.codigoUsuario,A.codigoDireccion,A.fechaCreacion,A.fechaFinal,A.estadoActividad,
            A.tipoActividad,A.agnoPeriodo,A.mesPeriodo,Z.sector,Z.subSector,Z.microSector,MP.codigoPresion,
            MP.lecturaArriba,MP.lecturaAbajo,U.denominacionBloque,D.denominacionLote,D.tipoAltitud,D.codigoInscripcion
        FROM medicionPresion MP
        INNER JOIN actividad A ON A.codigoActividad=MP.codigoActividad 
        INNER JOIN direccion D ON A.codigoDireccion=D.codigoDireccion
        INNER JOIN bloqueUrbano U ON D.codigoUrbano = U.codigoUrbano
        INNER JOIN zona Z ON D.codigoZona = Z.codigoZona
        WHERE MP.codigoActividad LIKE BINARY `@actividad` AND A.tipoActividad = 1 AND HEX(UNHEX(A.habilitado))='01' 
        ORDER BY A.fechaFinal DESC;

    END;
    $$
    DELIMITER ;
    */
    try {           
        await proveedorDeDatos.query("CALL buscarActividadPresion(?)", solicitud.params.codigo, (error, resultado) => { // Consulta a procedimiento almacenado
            if (error){
                respuesta.json({ error : (error.sqlMessage + " - " + error.sql) });} // Enviar error en JSON
            else{
                if(resultado[0][0])
                respuesta.json( resultado[0][0] ); // Enviar respuesta de consulta en JSON
                else
                respuesta.json({ error : "vacio" }); // Enviar error en JSON
            }  
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    } catch(error) { respuesta.json({ error : error.code }) } // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Registrar una Medicion de Presion (POST) "/api/presion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaPresion.post('/', async (solicitud, respuesta) => { // Registrar Actividad Presion
    /*
    DROP PROCEDURE IF EXISTS registrarMedicionPresion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS registrarMedicionPresion (
    IN `@actividad` INTEGER UNSIGNED, 
    IN `@lecturaArriba` NUMERIC(18, 3),
    IN `@lecturaAbajo` NUMERIC(18, 3),
    IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    INSERT INTO medicionPresion(codigoActividad, lecturaArriba, lecturaAbajo)
    VALUES (`@actividad`, `@lecturaArriba`, `@lecturaAbajo`);
    UPDATE actividad SET estadoActividad = 2 WHERE codigoActividad = `@actividad`;

    SET @tmp = LAST_INSERT_ID();
    INSERT INTO bitacora VALUES (`@quien`, 11, @tmp, 0, CURRENT_TIMESTAMP);

    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        const { codigoActividad,lecturaArriba,lecturaAbajo,quien } = solicitud.body;
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }) }
        else await proveedorDeDatos.query("CALL registrarMedicionPresion(?,?,?,?)", // Consulta a procedimiento almacenado
                    [ codigoActividad,lecturaArriba,lecturaAbajo,quien ]
        , (error, resultado) => {
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else
            respuesta.send(resultado); // Enviar respuesta de consulta en JSON
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    } catch(error) { respuesta.json({ error : error.code }) } // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Modificar Lecturas Medidas de Presion (PUT) "/api/presion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaPresion.put('/', async (solicitud, respuesta) => { // Modificar Actividad Presion
    /*
    DROP PROCEDURE IF EXISTS modificarLecturasPresion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarLecturasPresion (
    IN `@actividad` INTEGER UNSIGNED, 
    IN `@lecturaArriba` NUMERIC(18, 3),
    IN `@lecturaAbajo` NUMERIC(18, 3),
    IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    UPDATE medicionPresion
    SET lecturaArriba = `@lecturaArriba`, lecturaAbajo = `@lecturaAbajo`
    WHERE codigoActividad = `@actividad`;
    UPDATE actividad SET estadoActividad = 2 WHERE codigoActividad = `@actividad`;

    INSERT INTO bitacora VALUES (`@quien`, 11, `@actividad`, 2, CURRENT_TIMESTAMP);

    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        const { codigoActividad,lecturaArriba,lecturaAbajo,quien } = solicitud.body;
        await proveedorDeDatos.query("CALL modificarLecturasPresion(?,?,?,?)", // Consulta a procedimiento almacenado
                    [ codigoActividad,lecturaArriba,lecturaAbajo,quien ]
        , (error, resultado) => {
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else
            respuesta.send(resultado); // Enviar respuesta de consulta en JSON
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    } catch(error) { respuesta.json({ error : error.code }) } // Enviar error en JSON
});

/**
 * @description Verificar el Número de Procedimientos Almacenados para el módulo MEDICIÓN de PRESION con la ruta (GET) "/api/presion/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaPresion.get('/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosPresion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosPresion ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total
        FROM information_schema.routines
        WHERE specific_name='buscarActividadPresion' OR
              specific_name='registrarMedicionPresion' OR
              specific_name='modificarLecturasPresion'; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [3] */
        await proveedorDeDatos.query("CALL contarProcedimientosContinuidad()",
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

module.exports = gestorRutaPresion; //EXPORTAR FUNCIONES AL ROUTER