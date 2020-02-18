/**
 * @class MedicionContinuidad(Router)
 * @file apiMedicionContinuidad.js
 * @author {carrillog.luis[at]gmail[dot]com,jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Luis.Carrillo.Gutiérrez__Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

/*
DROP TABLE IF EXISTS medicionContinuidad;
DELIMITER $$
CREATE TABLE IF NOT EXISTS medicionContinuidad (
    codigoContinuidad INTEGER UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    codigoActividad INTEGER UNSIGNED NOT NULL,
    r1HoraDe CHAR(5) NOT NULL, 
    r1HoraA CHAR(5) NOT NULL, -- o null???
    r2horaDe CHAR(5) NULL, 
    r2horaA CHAR(5) NULL, -- o null???
    habilitado BINARY(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
$$
DELIMITER ;
-- NUM TABLA = 12;
-- NUM PROCE = 5;
*/

'use strict';
const gestorRutaContinuidad = require('express').Router();// INICIAR ENRUTADOR DE EXPRESS SERVER
const proveedorDeDatos = require('../conexiondb.js'); //CONEXIÓN A BASE DE DATOS

/**
 * @description Gestionar Ruta para Buscar una Actividad Continuidad por Codigo (GET) "/api/continuidad/:codigo"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaContinuidad.get('/:codigo', async function(solicitud, respuesta) { // Buscar Actividad Continuidad por Codigo
    /*
    DROP PROCEDURE IF EXISTS buscarActividadContinuidad;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS buscarActividadContinuidad (
    IN `@actividad` INTEGER UNSIGNED
    ) BEGIN

        SELECT A.codigoActividad,A.codigoUsuario,A.codigoDireccion,A.fechaCreacion,A.fechaFinal,A.estadoActividad,
            A.agnoPeriodo,A.mesPeriodo,Z.sector,Z.subSector,Z.microSector,MC.codigoContinuidad,MC.r1HoraDe,MC.r1HoraA,
            MC.r2HoraDe,MC.r2HoraA,U.denominacionBloque,D.denominacionLote,D.tipoAltitud
        FROM medicionContinuidad MC
        INNER JOIN actividad A ON A.codigoActividad=MC.codigoActividad 
        INNER JOIN direccion D ON A.codigoDireccion=D.codigoDireccion
        INNER JOIN bloqueUrbano U ON D.codigoUrbano = U.codigoUrbano
        INNER JOIN zona Z ON D.codigoZona = Z.codigoZona
        WHERE MC.codigoActividad LIKE BINARY `@actividad` AND A.tipoActividad = 0 AND HEX(UNHEX(A.habilitado))='01' ORDER BY A.fechaFinal DESC;

    END;
    $$
    DELIMITER ;
    */
    try {           
        await proveedorDeDatos.query("CALL buscarActividadContinuidad(?)", solicitud.params.codigo // Consulta a procedimiento almacenado
        , (error, resultado) => {  
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else{
                if(resultado[0][0])
                respuesta.json( resultado[0][0] ); // Enviar resultado de la consulta en JSON
                else
                respuesta.json({ error : "vacio" }); // Enviar error en JSON
            }
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    } catch(error) { respuesta.json({ error : error.code }) } // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Registrar los datos de una Medición de Continuidad (POST) "/api/continuidad"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaContinuidad.post('/', async function(solicitud, respuesta) { // Registrar los datos de una Medicion de Continuidd
    /*
    DROP PROCEDURE IF EXISTS registrarMedicionContinuidad;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS registrarMedicionContinuidad (
    IN `@actividad` INTEGER UNSIGNED, 
    IN `@r1HoraDe` CHAR(5),
    IN `@r1HoraA` CHAR(5),
    IN `@r2HoraDe` CHAR(5),
    IN `@r2HoraA` CHAR(5), 
    IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    INSERT INTO medicionContinuidad(codigoActividad,r1HoraDe,r1HoraA,r2HoraDe,r2HoraA) 
    VALUES (`@actividad`,`@r1HoraDe`,`@r1HoraA`,`@r2HoraDe`,`@r2HoraA`);
    UPDATE actividad SET estadoActividad = 2 WHERE codigoActividad = `@actividad`;

    SET @tmp = LAST_INSERT_ID();
    INSERT INTO bitacora VALUES (`@quien`, 12, @tmp, 0, CURRENT_TIMESTAMP);

    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {      
        const { codigoActividad,r1HoraDe,r1HoraA,r2HoraDe,r2HoraA,quien } = solicitud.body;
        if (quien.length !== 32) {
            respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); 
        } else await proveedorDeDatos.query("CALL registrarMedicionContinuidad(?,?,?,?,?,?)", // Consulta a procedimiento almacenado
                [ codigoActividad,r1HoraDe,r1HoraA,r2HoraDe,r2HoraA,quien ]
        , (error, resultado) => { 
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else
            respuesta.send(resultado); // Enviar resultado de la consulta en JSON
        }); 
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    } catch(error) { respuesta.json({ error : error.code }) } // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Cambiar los datos ingresados de una Medición de Continuidad (PUT) "/api/continuidad"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaContinuidad.put('/', async function(solicitud, respuesta) {
    /*
    DROP PROCEDURE IF EXISTS modificarHorasContinuidad;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarHorasContinuidad (
    IN `@actividad` INTEGER UNSIGNED, 
    IN `@r1HoraDe` CHAR(5),
    IN `@r1HoraA` CHAR(5),
    IN `@r2HoraDe` CHAR(5),
    IN `@r2HoraA` CHAR(5),
    IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    UPDATE medicionContinuidad  
    SET r1HoraDe=`@r1HoraDe`,r1HoraA=`@r1HoraA`,r2HoraDe=`@r2HoraDe`,r2HoraA=`@r2HoraA`
    WHERE codigoActividad=`@actividad`;
    UPDATE actividad SET estadoActividad = 2 WHERE codigoActividad = `@actividad`;
    INSERT INTO bitacora VALUES (`@quien`, 12, `@actividad`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {      
        const { codigoActividad,r1HoraDe,r1HoraA,r2HoraDe,r2HoraA,quien } = solicitud.body;
        if (quien.length !== 32) {
            respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' });
        } else await proveedorDeDatos.query("CALL modificarHorasContinuidad(?,?,?,?,?,?)", // Consulta a procedimiento almacenado
                [codigoActividad,r1HoraDe,r1HoraA,r2HoraDe,r2HoraA,quien]
        , (error, resultado) => { 
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) });// Enviar error en JSON
            else
            respuesta.send(resultado); // Enviar resultado de la consulta en JSON
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    } catch(error) { respuesta.json({ error : error.code }) } // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Calcular el total de Horas de Servicio de Continuidad (POST) "/api/continuidad/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaContinuidad.post('/continuidad/horaservicio', async function(solicitud, respuesta) {
    /*
    DROP FUNCTION IF EXISTS calcularTotalHoraServicio;
    DELIMITER $$
    CREATE FUNCTION calcularTotalHoraServicio (
    `@r1HoraDe` CHAR(5),
    `@r1HoraA` CHAR(5),
    `@r2HoraDe` CHAR(5),
    `@r2HoraA` CHAR(5)
    ) RETURNS CHAR(5)
    BEGIN
        DECLARE totalHora_ CHAR(5);
        SELECT ADDTIME( SUBTIME(`@r1HoraA`,`@r1HoraDe`) , SUBTIME(`@r2HoraA`,`@r2HoraDe`) ) INTO totalHora_;
        RETURN totalHora_;
    END; 
    $$
    DELIMITER ;
    */
    try {     
        const { r1HoraDe,r1HoraA,r2HoraDe,r2HoraA } = solicitud.body;      
        await proveedorDeDatos.query("SELECT calcularTotalHoraServicio(?,?,?,?) AS horaServicio"  // Consulta a procedimiento almacenado
        , [ r1HoraDe,r1HoraA,r2HoraDe,r2HoraA ]
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
 * @description Gestionar Ruta para Calcular el total de Horas de Continuidad Por Zona y Altitud (POST) "/api/continuidad/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta geswtionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaContinuidad.post('/promediohora', async function(solicitud, respuesta) {
    /*
    DROP PROCEDURE IF EXISTS totalHoraZonaAltitudContinuidad;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS totalHoraZonaAltitudContinuidad (
    IN `@zona` CHAR(2) CHARACTER SET utf8, -- zona
    IN `@urbano` CHAR(2) CHARACTER SET utf8, -- bloque urbano
    IN `@altitud` CHAR(2) CHARACTER SET utf8, -- altitud
    IN `@mes` CHAR(2) CHARACTER SET utf8,
    IN `@agno` CHAR(4) CHARACTER SET utf8
    )
    BEGIN

    SET @sector = "-", @subSector = "-", @microSector ="-";
    SELECT sector, subSector, microSector INTO @sector,@subSector,@microSector FROM zona where codigoZona LIKE BINARY `@zona`;
    IF @sector = "-" THEN SET @sector = "%"; END IF;
    IF @subSector = "-" THEN SET @subSector = "%"; END IF;
    IF @microSector = "-" THEN SET @microSector = "%"; END IF;

    SELECT COUNT(C.codigoContinuidad), SEC_TO_TIME(SUM(TIME_TO_SEC( calcularTotalHoraServicio(C.r1HoraDe,C.r1HoraA,C.r2HoraDe,C.r2HoraA)))) INTO @cantidadHora,@totalHora
    FROM actividad A  
    INNER JOIN direccion D ON A.codigoDireccion = D.codigoDireccion 
    INNER JOIN zona Z ON D.codigoZona = Z.codigoZona
    LEFT JOIN medicionContinuidad C ON A.codigoActividad = C.codigoActividad
    WHERE CONVERT(A.mesPeriodo, INTEGER) LIKE CONVERT(`@mes`, INTEGER) AND CONVERT(A.agnoPeriodo, INTEGER) LIKE CONVERT(`@agno`, INTEGER) AND D.tipoAltitud LIKE BINARY `@altitud` 
    AND D.codigoUrbano LIKE BINARY `@urbano` AND HEX(UNHEX(A.tipoActividad)) = '00' AND HEX(UNHEX(A.habilitado))='01' AND D.codigoZona IN
    (SELECT DISTINCT codigoZona FROM zona WHERE sector LIKE BINARY @sector AND codigoZona IN 
    (SELECT DISTINCT codigoZona FROM zona WHERE subSector LIKE BINARY @subSector AND codigoZona IN 
    (SELECT DISTINCT codigoZona FROM zona WHERE microSector LIKE BINARY @microSector)));
    
    SELECT SEC_TO_TIME(TIME_TO_SEC(@totalHora)/@cantidadHora) AS promedioHora, calcularConexionesActivas(`@zona`,`@altitud`,`@mes`,`@agno`) AS conexionesActivas;
    -- @totalHora AS totalHora ,@cantidadHora AS cantidadHora ,

    END;
    $$
    DELIMITER ;

    */
    try {     
        const { codigoZona,codigoUrbano,tipoAltitud,mesPeriodo,agnoPeriodo } = solicitud.body;      
        await proveedorDeDatos.query("CALL totalHoraZonaAltitudContinuidad(?,?,?,?,?)"  // Consulta a procedimiento almacenado
        , [codigoZona,codigoUrbano,tipoAltitud,mesPeriodo,agnoPeriodo]
        , (error, resultado) => { 
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else{
                if(resultado[0])
                respuesta.json( resultado[0][0] );  // Enviar resultado de consulta en JSON 
                else
                respuesta.json({ error : "vacio" }); // Enviar error en JSON
            }
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones 
    } catch(error) { respuesta.json({ error : error.code }) } // Enviar error en JSON
});

/**
 * @description Verificar el Número de Procedimientos Almacenados para el módulo MEDICIÓN de CONTINUIDAD con la ruta (GET) "/api/continuidad/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaContinuidad.get('/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosContinuidad;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosContinuidad ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total
        FROM information_schema.routines
        WHERE specific_name='buscarActividadContinuidad' OR
              specific_name='registrarMedicionContinuidad' OR
              specific_name='modificarHorasContinuidad' OR
              specific_name='calcularTotalHoraServicio' OR
              specific_name='totalHoraZonaAltitudContinuidad'; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [5] */
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

module.exports = gestorRutaContinuidad; //EXPORTAR FUNCIONES AL ROUTER
