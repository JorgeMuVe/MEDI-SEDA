/**
 * @class Reporte(Router)
 * @file apiReporte.js
 * @author {carrillog.luis[at]gmail[dot]com,jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Luis.Carrillo.Gutiérrez__Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

'use strict';
const pdf = require('html-pdf'); //Liberia para Generar PDF de un Html
const gestorRutaReporte = require('express').Router();// INICIAR ENRUTADOR DE EXPRESS SERVER
const proveedorDeDatos = require('../conexiondb.js'); //CONEXIÓN A BASE DE DATOS

/**
 * @description Gestionar Ruta para generar Reporte de Continuidad (POST) "/api/reporte/continuidad"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaReporte.post('/continuidad', async function(solicitud, respuesta) {
    /*

DROP PROCEDURE IF EXISTS reporteEncuestaContinuidad;
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS reporteEncuestaContinuidad (
IN `@zona` CHAR(2) CHARACTER SET utf8, -- zona
IN `@urbano` CHAR(2) CHARACTER SET utf8, -- bloque urbano
IN `@altitud` CHAR(2) CHARACTER SET utf8, -- altitud
IN `@mes` CHAR(2) CHARACTER SET utf8, -- mes periodo
IN `@agno` CHAR(4) CHARACTER SET utf8  -- agno periodo
) BEGIN

SET @sector = "-", @subSector = "-", @microSector ="-";
SELECT sector, subSector, microSector INTO @sector,@subSector,@microSector FROM zona where codigoZona = `@zona`;
IF @sector = "-" THEN SET @sector = "%"; END IF;
IF @subSector = "-" THEN SET @subSector = "%"; END IF;
IF @microSector = "-" THEN SET @microSector = "%"; END IF;

SELECT D.codigoDireccion,D.referenciaDireccion,D.tipoAltitud,D.denominacionLote, D.codigoInscripcion,
Z.codigoZona, Z.denominacionZona, Z.sector, Z.subSector, Z.microSector, 
IFNULL(A.codigoActividad,'sin datos') as codigoActividad,
IFNULL(C.codigoContinuidad, 'sin datos') as codigoContinuidad, 
IFNULL(C.r1HoraDe, 'sin datos') as r1HoraDe, IFNULL(C.r1HoraA, 'sin datos') as r1HoraA,
IFNULL(C.r2HoraDe, 'sin datos') as r2HoraDe, IFNULL(C.r2HoraA, 'sin datos') as r2HoraA,
IF(C.r1HoraDe IS NOT NULL, IF(C.r1HoraA IS NOT NULL, IF(C.r2HoraDe IS NOT NULL, IF(C.r2HoraA IS NOT NULL, calcularTotalHoraServicio(C.r1HoraDe,C.r1HoraA,C.r2HoraDe,C.r2HoraA),'sin datos'),'sin datos' ),'sin datos'),'sin datos' ) AS horaServicio
FROM direccion D
LEFT JOIN actividad A ON A.codigoDireccion = D.referenciaDireccion AND 
CONVERT (A.mesPeriodo, INTEGER) LIKE CONVERT(`@mes`, INTEGER) AND CONVERT (A.agnoPeriodo, INTEGER) LIKE CONVERT(`@agno`, INTEGER) AND
HEX(UNHEX(A.tipoActividad)) = '00' AND HEX(UNHEX(A.habilitado))='01' 
LEFT JOIN medicionContinuidad C ON A.codigoActividad = C.codigoActividad
INNER JOIN zona Z ON Z.codigoZona = D.codigoZona
WHERE D.tipoAltitud LIKE BINARY `@altitud` AND D.codigoUrbano LIKE BINARY `@urbano`
AND D.codigoZona IN (SELECT DISTINCT codigoZona FROM zona WHERE sector LIKE BINARY @sector 
AND subSector LIKE BINARY @subSector AND microSector LIKE BINARY @microSector)
ORDER BY D.codigoZona ASC, D.tipoAltitud DESC, D.codigoDireccion ASC;

END;

    */
    try {     
        const { codigoZona,codigoUrbano,tipoAltitud,mesPeriodo,agnoPeriodo } = solicitud.body;      
        await proveedorDeDatos.query("CALL reporteEncuestaContinuidad(?,?,?,?,?)"  // Consulta a procedimiento almacenado
        , [codigoZona,codigoUrbano,tipoAltitud,mesPeriodo,agnoPeriodo]
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
 * @description Gestionar Ruta para Generar Reporte de Presion (POST) "/api/reporte/presion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaReporte.post('/presion', async function(solicitud, respuesta) {
    /*
DROP PROCEDURE IF EXISTS reporteEncuestaPresion;
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS reporteEncuestaPresion (
IN `@zona` CHAR(2) CHARACTER SET utf8, -- zona
IN `@urbano` CHAR(2) CHARACTER SET utf8, -- bloque urbano
IN `@altitud` CHAR(2) CHARACTER SET utf8, -- altitud
IN `@mes` CHAR(2) CHARACTER SET utf8, -- mes periodo
IN `@agno` CHAR(4) CHARACTER SET utf8  -- agno periodo
) BEGIN

SET @sector = "-", @subSector = "-", @microSector ="-";
SELECT sector, subSector, microSector INTO @sector,@subSector,@microSector FROM zona where codigoZona = `@zona`;
IF @sector = "-" THEN SET @sector = "%"; END IF;
IF @subSector = "-" THEN SET @subSector = "%"; END IF;
IF @microSector = "-" THEN SET @microSector = "%"; END IF;

SELECT D.codigoDireccion,D.referenciaDireccion,D.tipoAltitud,D.denominacionLote, D.codigoInscripcion,
Z.codigoZona, Z.denominacionZona, Z.sector, Z.subSector, Z.microSector, 
IFNULL(A.codigoActividad,'sin datos') as codigoActividad,
IFNULL(P.codigoPresion, 'sin datos') as codigoPresion, 
IFNULL(P.lecturaArriba, 'sin datos') as lecturaArriba, 
IFNULL(P.lecturaAbajo, 'sin datos') as lecturaAbajo
FROM direccion D
LEFT JOIN actividad A ON A.codigoDireccion = D.referenciaDireccion AND 
CONVERT (A.mesPeriodo, INTEGER) LIKE CONVERT(`@mes`, INTEGER) AND CONVERT (A.agnoPeriodo, INTEGER) LIKE CONVERT(`@agno`, INTEGER) AND
HEX(UNHEX(A.tipoActividad)) = '01' AND HEX(UNHEX(A.habilitado))='01' 
LEFT JOIN medicionPresion P ON A.codigoActividad = P.codigoActividad
INNER JOIN zona Z ON Z.codigoZona = D.codigoZona
WHERE D.tipoAltitud LIKE BINARY `@altitud` AND D.codigoUrbano LIKE BINARY `@urbano`
AND D.codigoZona IN (SELECT DISTINCT codigoZona FROM zona WHERE sector LIKE BINARY @sector 
AND subSector LIKE BINARY @subSector AND microSector LIKE BINARY @microSector)
ORDER BY D.codigoZona ASC, D.tipoAltitud DESC, D.codigoDireccion ASC;

END;
$$

    */
    try {     
        const { codigoZona,codigoUrbano,tipoAltitud,mesPeriodo,agnoPeriodo } = solicitud.body;      
        await proveedorDeDatos.query("CALL reporteEncuestaPresion(?,?,?,?,?)"  // Consulta a procedimiento almacenado
        , [codigoZona,codigoUrbano,tipoAltitud,mesPeriodo,agnoPeriodo]
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
 * @description Gestionar Ruta para Generar Reporte de Continuidad para Comercial (POST) "/api/reporte/continuidad/comercial"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaReporte.post('/continuidad/comercial', async function(solicitud, respuesta) {
    /*
    DROP PROCEDURE IF EXISTS reporteContinuidadComercial;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS reporteContinuidadComercial (
    IN `@zona` CHAR(2),
    IN `@altitud` CHAR(1), 
    IN `@mes` CHAR(2),
    IN `@agno` CHAR(4)
    ) BEGIN

    SET @sector = "-", @subSector = "-", @microSector ="-";
    SELECT sector, subSector, microSector INTO @sector,@subSector,@microSector FROM zona where codigoZona = `@zona`;

    IF @sector = "-" THEN SET @sector = "%"; END IF;
    IF @subSector = "-" THEN SET @subSector = "%"; END IF;
    IF @microSector = "-" THEN SET @microSector = "%"; END IF;
    
    SELECT Z.codigoZona, Z.sector,Z.subSector,Z.microSector,FA.codigoFuente,FA.denominacionFuente,
    C.numeroConexiones,CAST(Z.habilitado AS INTEGER) AS habilitado
    FROM zona Z 
    INNER JOIN fuenteZona FZ ON FZ.codigoZona = Z.codigoZona
    INNER JOIN fuenteAgua FA ON FA.codigoFuente = FZ.codigoFuente
    INNER JOIN totalConexiones C ON C.codigoZona = Z.codigoZona
    WHERE HEX(UNHEX(Z.tieneConexiones))="01" AND Z.codigoZona IN 
    (SELECT DISTINCT codigoZona FROM zona WHERE sector LIKE BINARY @sector AND subSector LIKE BINARY @subSector 
    AND microSector LIKE BINARY @microSector AND HEX(UNHEX(habilitado)) = "01") AND
    CONVERT(C.mes, INTEGER) LIKE CONVERT(`@mes`, INTEGER) AND CONVERT(C.agno, INTEGER) LIKE CONVERT(`@agno`, INTEGER)
    ORDER BY Z.codigoZona;
    END;
    $$
    DELIMITER ;
    */
    try {     
        const { codigoZona,tipoAltitud,mesPeriodo,agnoPeriodo } = solicitud.body;      
        await proveedorDeDatos.query("CALL reporteContinuidadComercial(?,?,?,?)"  // Consulta a procedimiento almacenado
        , [codigoZona,tipoAltitud,mesPeriodo,agnoPeriodo]
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
 * @description Gestionar Ruta para Exportar de un HTML a un Archivo PDF (POST) "/api/reporte/pdf"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaReporte.post('/pdf', async (solicitud, respuesta) => {
    const configuracion = {
        "format": "Legal",        // A3, A4, A5, Legal, Letter o Tabloid
        "orientation": solicitud.body.orientacion, // portrait o landscape
    }

    pdf.create(solicitud.body.html, configuracion)
    .toFile("/home/MEDI-SEDA/servidor/documentos/pdf/"+ solicitud.body.nombreArchivo
    ,(error, archivo) => {
        if(error){ respuesta.json( { error : error } ) }
        else{ respuesta.sendFile(`${archivo.filename}`) }
    });
});

/**
 * @description Verificar el Número de Procedimientos Almacenados para el módulo REPORTE gestionado con la ruta (GET) "/api/reporte/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaReporte.get('/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosReporte;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosReporte ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total
        FROM information_schema.routines
        WHERE specific_name='reporteEncuestaContinuidad' OR
              specific_name='reporteEncuestaPresion'; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [3] */
        await proveedorDeDatos.query( "CALL contarProcedimientosReporte()",
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

module.exports = gestorRutaReporte; //EXPORTAR FUNCIONES AL ROUTER