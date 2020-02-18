/**
 * @class TotalConexiones(Router)
 * @file apiTotalConexiones.js
 * @author {carrillog.luis[at]gmail[dot]com,jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Luis.Carrillo.Gutiérrez__Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

/*
DROP TABLE IF EXISTS totalConexiones;
DELIMITER $$
CREATE TABLE IF NOT EXISTS totalConexiones (
    codigoTotalConexion INTEGER UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
	codigoZona INTEGER UNSIGNED NOT NULL,
	mes CHAR(2) CHARACTER SET utf8 NOT NULL,
	agno CHAR(4) CHARACTER SET utf8 NOT NULL,
	numeroConexiones INTEGER UNSIGNED NOT NULL DEFAULT 0,
	datoProvisto BINARY(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
$$
DELIMITER ;

ALTER TABLE totalConexiones ADD CONSTRAINT UNIQUE KEY (codigoZona, mes, agno);
-- NUM TABLA = 9;
-- NUM PROCE = 5;
*/

'use strict';
const gestorRutaConexiones = require('express').Router();
const proveedorDeDatos = require('../conexiondb.js');

/**
 * @description Gestionar Ruta para Calcular el total de Conexiones Activas por Zona y Periodo (POST) "/api/conexion/total/zonaperiodo"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaConexiones.post('/total/zonaperiodo/', async function(solicitud, respuesta) {
    /*
    DROP PROCEDURE IF EXISTS listarTotalConexionesZonaPeriodo;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarTotalConexionesZonaPeriodo ( 
    IN `@zona` CHAR(2) CHARACTER SET utf8,
    IN `@agno` CHAR(4) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    SET @sector="-", @subSector ="-", @microSector="-";
    SELECT sector, subSector, microSector INTO @sector,@subSector,@microSector FROM zona where codigoZona = `@zona`;
    IF @sector = "-" THEN SET @sector = "%"; END IF;
    IF @subSector = "-" THEN SET @subSector = "%"; END IF;
    IF @microSector = "-" THEN SET @microSector = "%"; END IF;
    
    SELECT codigoTotalConexion, SUM(numeroConexiones) AS numeroConexiones, mes, agno FROM totalConexiones WHERE agno LIKE BINARY `@agno` AND codigoZona IN 
    (SELECT DISTINCT codigoZona FROM zona WHERE sector LIKE BINARY @sector AND subSector LIKE BINARY @subSector AND microSector LIKE BINARY @microSector 
    AND HEX(UNHEX(habilitado)) = "01")
    GROUP BY mes;
   
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {     
        const { zona, agno } = solicitud.body;      
        await proveedorDeDatos.query("CALL listarTotalConexionesZonaPeriodo(?,?)"  // Consulta a procedimiento almacenado
        , [ zona, agno ]
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
 * @description Gestionar Ruta para Calcular Conexiones Activas por Zona y Altitud de Comercial(GET) "/api/conexion/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaConexiones.post('/comercial/activas', async (solicitud, respuesta) => { 
    /*
    DROP FUNCTION IF EXISTS calcularConexionesComercialActivasZonaAltitud;
    DELIMITER $$
    CREATE FUNCTION calcularConexionesComercialActivasZonaAltitud (
    `@zona` CHAR(2),
    `@altitud` CHAR(2),
    `@mes` CHAR(2),
    `@agno` CHAR(4)
    ) RETURNS INTEGER UNSIGNED
    BEGIN

    DECLARE numeroConexiones_ INTEGER UNSIGNED;

    SET @sector = "-", @subSector = "-", @microSector ="-";
    SELECT sector, subSector, microSector INTO @sector,@subSector,@microSector 
    FROM zona where codigoZona LIKE BINARY `@zona`;
    IF @sector = "-" THEN SET @sector = "%"; END IF;
    IF @subSector = "-" THEN SET @subSector = "%"; END IF;
    IF @microSector = "-" THEN SET @microSector = "%"; END IF;
        
    SELECT SUM(C.numeroConexiones) INTO numeroConexiones_ FROM totalConexiones C, zona Z
    WHERE CONVERT(C.mes, INTEGER) LIKE CONVERT(`@mes`, INTEGER) AND CONVERT(C.agno, INTEGER) LIKE CONVERT(`@agno`, INTEGER)
    AND Z.codigoZona = C.codigoZona AND C.codigoZona IN
    (SELECT DISTINCT codigoZona FROM zona WHERE sector LIKE BINARY @sector AND codigoZona IN 
    (SELECT DISTINCT codigoZona FROM zona WHERE subSector LIKE BINARY @subSector AND codigoZona IN 
    (SELECT DISTINCT codigoZona FROM zona WHERE microSector LIKE BINARY @microSector)));
    
    RETURN numeroConexiones_;

    END
    $$
    DELIMITER ;
    */
    try {           
        const { zona, altitud, mes, agno } = solicitud.body;
        await proveedorDeDatos.query("SELECT calcularConexionesComercialActivasZonaAltitud(?,?,?,?) AS conexionesActivas", 
            [ zona, altitud, mes, agno ],
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
 * @description Gestionar Ruta para Calcular Conexiones Activas (POST) "/api/conexion/ "
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaConexiones.post('/activas', async (solicitud, respuesta) => { 
    /*
    
    DROP FUNCTION IF EXISTS calcularConexionesActivas;
    DELIMITER $$
    CREATE FUNCTION calcularConexionesActivas (
    `@zona` CHAR(2) CHARACTER SET utf8, -- zona
    `@altitud` CHAR(2) CHARACTER SET utf8, -- altitud
    `@mes` CHAR(2) CHARACTER SET utf8,
    `@agno` CHAR(4) CHARACTER SET utf8
    ) RETURNS INTEGER
    BEGIN
    
    DECLARE conexionesActivas_ INTEGER;

    SET @conexionesZonaComercial = calcularConexionesComercialActivasZonaAltitud(`@zona`,"%",`@mes`,`@agno`);
    SET @conexionesZona = calcularConexionesAguaActivasZonaAltitud(`@zona`,"%","01","2014");
    SET @conexionesZonaAltitud = calcularConexionesAguaActivasZonaAltitud(`@zona`,`@altitud`,"01","2014");
    SET conexionesActivas_ = ROUND((@conexionesZonaAltitud*@conexionesZonaComercial)/@conexionesZona);

    RETURN conexionesActivas_;

    END; 
    $$
    DELIMITER ;
    */
    const { codigoZona, tipoAltitud, mesPeriodo, agnoPeriodo } = solicitud.body;
    try {   
        await proveedorDeDatos.query( "SELECT calcularConexionesActivas(?,?,?,?) AS conexionesActivas", 
            [ codigoZona, tipoAltitud, mesPeriodo, agnoPeriodo ],
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
 * @description Gestionar Ruta para Verificar Total de Conexiones de Editar (POST) "/api/conexion/editar/verificar "
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaConexiones.post('/buscar', async (solicitud, respuesta) => { 
    /*
    DROP PROCEDURE IF EXISTS verificarExistenciaTotalConexiones;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS verificarExistenciaTotalConexiones (
        IN `@zona` INTEGER UNSIGNED,
        IN `@mes` CHAR(2) CHARACTER SET utf8,
        IN `@agno` CHAR(4) CHARACTER SET utf8
    ) BEGIN
        SELECT codigoTotalConexion, codigoZona, agno, mes, numeroConexiones FROM totalConexiones
        WHERE codigoZona = `@zona` AND mes = `@mes` AND agno = `@agno`;
    END;
    $$
    DELIMITER ;
    */
    const { zona,mes,agno } = solicitud.body;
    try {   
        await proveedorDeDatos.query( "CALL verificarExistenciaTotalConexiones(?,?,?)", 
            [ zona,mes,agno ],
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
 * @description Gestionar Ruta para Rellenar Datos del total de Conexiones (GET) "/api/conexion/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaConexiones.post('/', async (solicitud, respuesta) => { 
    /*
    DROP PROCEDURE IF EXISTS registrarTotalConexiones;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS registrarTotalConexiones (
        IN `@zona` INTEGER UNSIGNED,
        IN `@mes` CHAR(2) CHARACTER SET utf8,
        IN `@agno` CHAR(4) CHARACTER SET utf8,
        IN `@conexiones` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN

    IF NOT EXISTS (SELECT * FROM totalConexiones WHERE codigoZona = `@zona` AND mes = `@mes` AND agno = `@agno`)
    THEN 
        INSERT INTO totalConexiones(codigoZona, mes, agno, numeroConexiones, datoProvisto) VALUES (`@zona`, `@mes`, `@agno`, `@conexiones`, HEX(1));
        INSERT INTO bitacora VALUES (`@quien`, 9, CONCAT(`@zona`, '-', `@mes`, '-', `@agno`), 4, CURRENT_TIMESTAMP);
         SELECT "REGISTRADO" registrado;
    ELSE SELECT "ERROR" error;
    END IF;

    END;
    $$
    DELIMITER ;
    */
    const { zona , mes , agno , conexiones , quien } = solicitud.body;
    try {   
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query( "CALL registrarTotalConexiones(?,?,?,?,?)", 
            [ zona , mes , agno , conexiones , quien ],
            (error, resultado) => { 
                if (error){ respuesta.json({ "error" : error }) }
                else { respuesta.json( resultado[0] ) }
        }); 
    } catch(errorExcepcion) { 
        respuesta.json({ "error" : errorExcepcion.code });
    }
});

/**
 * @description Gestionar Ruta para Modificar datos de un Total de Conexiones (PUT) "/api/conexion/"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaConexiones.put('/', async (solicitud, respuesta ) => {
    /*
    DROP PROCEDURE IF EXISTS modificarTotalConexiones;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarTotalConexiones (
        IN `@codigo` INTEGER UNSIGNED,
        IN `@zona` INTEGER UNSIGNED,
        IN `@mes` CHAR(2) CHARACTER SET utf8,
        IN `@agno` CHAR(4) CHARACTER SET utf8,
        IN `@conexiones` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN 

    IF NOT EXISTS (SELECT * FROM totalConexiones WHERE codigoTotalConexion <> `@codigo` AND codigoZona = `@zona` AND mes = `@mes` AND agno = `@agno`)
    THEN 
        UPDATE totalConexiones SET codigoZona = `@zona`, mes = `@mes`, agno = `@agno`, numeroConexiones = `@conexiones`
        WHERE codigoTotalConexion =`@codigo`;
        INSERT INTO bitacora VALUES (`@quien`, 9, `@codigo`, 2, CURRENT_TIMESTAMP);
         SELECT "MODIFICADO" registrado;
    ELSE SELECT "ERROR" error;
    END IF;

    END; 
    $$
    DELIMITER ;
    */
    try {
        const { codigo , zona , mes , agno , conexiones , quien } = solicitud.body;
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query("CALL modificarTotalConexiones(?, ?, ?, ?, ?, ?)", 
            [ codigo , zona , mes , agno , conexiones , quien ], 
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
 * @description Verificar el Número de Procedimientos Almacenados para el módulo TOTAL de CONEXIONES con la ruta (GET) "/api/conexion/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */

gestorRutaConexiones.get('/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosConexiones;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosConexiones ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total
        FROM information_schema.routines
        WHERE specific_name='listarTotalConexionesPorZona' OR
              specific_name='calcularConexionesComercialActivasZonaAltitud' OR 
              specific_name='calcularConexionesActivas' OR 
              specific_name='registrarTotalConexiones'; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [4] */
        await proveedorDeDatos.query("CALL contarProcedimientosConexiones()",
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

module.exports = gestorRutaConexiones;

/** DATOS DE CONEXIONES DEL DEPARTAMENTO DE PRODUCCIÓN DE AGUA
TRUNCATE totalConexiones;

-- CONEXIONES PERIODO '01-2019' - 'ENERO 2019'  
-- CALL registrarTotalConexiones( 2, '01', '2019', 3582, '00000000000000000000000000000001'); -- I-I
-- CALL registrarTotalConexiones(11, '01', '2019', 6001, '00000000000000000000000000000001'); -- IV
-- CALL registrarTotalConexiones(14, '01', '2019', 3327, '00000000000000000000000000000001'); -- V
-- CALL registrarTotalConexiones(18, '01', '2019', 2737, '00000000000000000000000000000001'); -- VI
-- CALL registrarTotalConexiones(23, '01', '2019', 8992, '00000000000000000000000000000001'); -- VII
-- CALL registrarTotalConexiones(27, '01', '2019', 9680, '00000000000000000000000000000001'); -- VIII
-- CALL registrarTotalConexiones(32, '01', '2019', 13733, '00000000000000000000000000000001'); -- IX
-- CALL registrarTotalConexiones(41, '01', '2019', 13271, '00000000000000000000000000000001'); -- XI
-- CALL registrarTotalConexiones(45, '01', '2019', 16162, '00000000000000000000000000000001'); -- XII

CALL registrarTotalConexiones( 3, '01', '2019', 1105, '00000000000000000000000000000001'); -- I-I-a
CALL registrarTotalConexiones( 4, '01', '2019', 486, '00000000000000000000000000000001');  -- I-I-b
CALL registrarTotalConexiones( 5, '01', '2019', 310, '00000000000000000000000000000001'); -- I-I-c
CALL registrarTotalConexiones( 6, '01', '2019', 515, '00000000000000000000000000000001'); -- I-I-d
CALL registrarTotalConexiones( 7, '01', '2019', 1166, '00000000000000000000000000000001'); -- I-I-e
CALL registrarTotalConexiones( 8, '01', '2019', 2616, '00000000000000000000000000000001'); -- I-II
CALL registrarTotalConexiones( 9, '01', '2019', 1777, '00000000000000000000000000000001'); -- II
CALL registrarTotalConexiones(10, '01', '2019', 1233, '00000000000000000000000000000001'); -- III
CALL registrarTotalConexiones(12, '01', '2019', 3639, '00000000000000000000000000000001'); -- IV-I
CALL registrarTotalConexiones(13, '01', '2019', 2362, '00000000000000000000000000000001'); -- IV-II
CALL registrarTotalConexiones(15, '01', '2019', 1633, '00000000000000000000000000000001'); -- V-I
CALL registrarTotalConexiones(16, '01', '2019', 975, '00000000000000000000000000000001'); -- V-II
CALL registrarTotalConexiones(17, '01', '2019', 719, '00000000000000000000000000000001'); -- V-III
CALL registrarTotalConexiones(19, '01', '2019', 713, '00000000000000000000000000000001'); -- VI-I
CALL registrarTotalConexiones(20, '01', '2019', 1023, '00000000000000000000000000000001'); -- VI-II
CALL registrarTotalConexiones(21, '01', '2019', 303, '00000000000000000000000000000001'); -- VI-III
CALL registrarTotalConexiones(22, '01', '2019', 698, '00000000000000000000000000000001'); -- VI-IV
CALL registrarTotalConexiones(24, '01', '2019', 1705, '00000000000000000000000000000001'); -- VII-I
CALL registrarTotalConexiones(25, '01', '2019', 6042, '00000000000000000000000000000001'); -- VII-II
CALL registrarTotalConexiones(26, '01', '2019', 1245, '00000000000000000000000000000001'); -- VII-III
CALL registrarTotalConexiones(28, '01', '2019', 4886, '00000000000000000000000000000001'); -- VIII-I
CALL registrarTotalConexiones(29, '01', '2019', 648, '00000000000000000000000000000001'); -- VIII-II
CALL registrarTotalConexiones(30, '01', '2019', 1497, '00000000000000000000000000000001'); -- VIII-III
CALL registrarTotalConexiones(31, '01', '2019', 2649, '00000000000000000000000000000001'); -- VIII-IV
CALL registrarTotalConexiones(33, '01', '2019', 5133, '00000000000000000000000000000001'); -- IX-I
CALL registrarTotalConexiones(34, '01', '2019', 585, '00000000000000000000000000000001'); -- IX-II
CALL registrarTotalConexiones(35, '01', '2019', 949, '00000000000000000000000000000001'); -- IX-III
CALL registrarTotalConexiones(36, '01', '2019', 2000, '00000000000000000000000000000001'); -- IX-IV
CALL registrarTotalConexiones(37, '01', '2019', 596, '00000000000000000000000000000001'); -- IX-V
CALL registrarTotalConexiones(38, '01', '2019', 1385, '00000000000000000000000000000001'); -- IX-VI
CALL registrarTotalConexiones(39, '01', '2019', 3085, '00000000000000000000000000000001'); -- IX-VII
CALL registrarTotalConexiones(40, '01', '2019', 2237, '00000000000000000000000000000001'); -- X
CALL registrarTotalConexiones(42, '01', '2019', 10390, '00000000000000000000000000000001'); -- XI-I
CALL registrarTotalConexiones(43, '01', '2019', 543, '00000000000000000000000000000001'); -- XI-II
CALL registrarTotalConexiones(44, '01', '2019', 2338, '00000000000000000000000000000001'); -- XI-III
CALL registrarTotalConexiones(46, '01', '2019', 4498, '00000000000000000000000000000001'); -- XII-I
CALL registrarTotalConexiones(47, '01', '2019', 1382, '00000000000000000000000000000001'); -- XII-II
CALL registrarTotalConexiones(48, '01', '2019', 3298, '00000000000000000000000000000001'); -- XII-III
CALL registrarTotalConexiones(49, '01', '2019', 1961, '00000000000000000000000000000001'); -- XII-IV
CALL registrarTotalConexiones(50, '01', '2019', 5023, '00000000000000000000000000000001'); -- XII-V

-- CONEXIONES PERIODO '02-2019' - 'FEBRERO 2019' 
-- CALL registrarTotalConexiones(2, '02', '2019', 3585, '00000000000000000000000000000001'); -- Zona I-I
-- CALL registrarTotalConexiones(11, '02', '2019', 6025, '00000000000000000000000000000001'); -- Zona IV
-- CALL registrarTotalConexiones(14, '02', '2019', 3339, '00000000000000000000000000000001'); -- Zona V
-- CALL registrarTotalConexiones(18, '02', '2019', 2758, '00000000000000000000000000000001'); -- Zona VI
-- CALL registrarTotalConexiones(23, '02', '2019', 9054, '00000000000000000000000000000001'); -- Zona VII
-- CALL registrarTotalConexiones(27, '02', '2019', 9706, '00000000000000000000000000000001'); -- Zona VIII
-- CALL registrarTotalConexiones(32, '02', '2019', 13787, '00000000000000000000000000000001'); -- Zona IX
-- CALL registrarTotalConexiones(41, '02', '2019', 13327, '00000000000000000000000000000001'); -- Zona XI
-- CALL registrarTotalConexiones(45, '02', '2019', 16215, '00000000000000000000000000000001'); -- Zona XII

CALL registrarTotalConexiones(3, '02', '2019', 1109, '00000000000000000000000000000001'); -- I-I-a
CALL registrarTotalConexiones(4, '02', '2019', 484, '00000000000000000000000000000001'); -- I-I-b 
CALL registrarTotalConexiones(5, '02', '2019', 309, '00000000000000000000000000000001'); -- I-I-c
CALL registrarTotalConexiones(6, '02', '2019', 515, '00000000000000000000000000000001'); -- I-I-d
CALL registrarTotalConexiones(7, '02', '2019', 1168, '00000000000000000000000000000001'); -- I-I-e
CALL registrarTotalConexiones(8, '02', '2019', 2633, '00000000000000000000000000000001'); -- Zona I-II
CALL registrarTotalConexiones(9, '02', '2019', 1784, '00000000000000000000000000000001'); -- Zona II
CALL registrarTotalConexiones(10, '02', '2019', 1235, '00000000000000000000000000000001'); -- Zona III
CALL registrarTotalConexiones(12, '02', '2019', 3663, '00000000000000000000000000000001');
CALL registrarTotalConexiones(13, '02', '2019', 2362, '00000000000000000000000000000001');
CALL registrarTotalConexiones(15, '02', '2019', 1635, '00000000000000000000000000000001'); -- V-I
CALL registrarTotalConexiones(16, '02', '2019', 982, '00000000000000000000000000000001'); -- V-II
CALL registrarTotalConexiones(17, '02', '2019', 722, '00000000000000000000000000000001'); -- V-III
CALL registrarTotalConexiones(19, '02', '2019', 721, '00000000000000000000000000000001'); -- VI-I
CALL registrarTotalConexiones(20, '02', '2019', 1026, '00000000000000000000000000000001'); -- VI-II
CALL registrarTotalConexiones(21, '02', '2019', 303, '00000000000000000000000000000001'); -- VI-III
CALL registrarTotalConexiones(22, '02', '2019', 708, '00000000000000000000000000000001'); -- VI-IV
CALL registrarTotalConexiones(24, '02', '2019', 1706, '00000000000000000000000000000001'); -- VII-I
CALL registrarTotalConexiones(25, '02', '2019', 6109, '00000000000000000000000000000001'); -- VII-II
CALL registrarTotalConexiones(26, '02', '2019', 1239, '00000000000000000000000000000001'); -- VII-III
CALL registrarTotalConexiones(28, '02', '2019', 4901, '00000000000000000000000000000001');
CALL registrarTotalConexiones(29, '02', '2019', 650, '00000000000000000000000000000001');
CALL registrarTotalConexiones(30, '02', '2019', 1502, '00000000000000000000000000000001');
CALL registrarTotalConexiones(31, '02', '2019', 2653, '00000000000000000000000000000001');
CALL registrarTotalConexiones(33, '02', '2019', 5143, '00000000000000000000000000000001');
CALL registrarTotalConexiones(34, '02', '2019', 593, '00000000000000000000000000000001');
CALL registrarTotalConexiones(35, '02', '2019', 956, '00000000000000000000000000000001');
CALL registrarTotalConexiones(36, '02', '2019', 2000, '00000000000000000000000000000001');
CALL registrarTotalConexiones(37, '02', '2019', 593, '00000000000000000000000000000001');
CALL registrarTotalConexiones(38, '02', '2019', 1395, '00000000000000000000000000000001');
CALL registrarTotalConexiones(39, '02', '2019', 3107, '00000000000000000000000000000001');
CALL registrarTotalConexiones(40, '02', '2019', 2242, '00000000000000000000000000000001'); -- Zona X
CALL registrarTotalConexiones(42, '02', '2019', 10423, '00000000000000000000000000000001');
CALL registrarTotalConexiones(43, '02', '2019', 545, '00000000000000000000000000000001');
CALL registrarTotalConexiones(44, '02', '2019', 2359, '00000000000000000000000000000001');
CALL registrarTotalConexiones(46, '02', '2019', 4526, '00000000000000000000000000000001');
CALL registrarTotalConexiones(47, '02', '2019', 1377, '00000000000000000000000000000001');
CALL registrarTotalConexiones(48, '02', '2019', 3305, '00000000000000000000000000000001');
CALL registrarTotalConexiones(49, '02', '2019', 1960, '00000000000000000000000000000001');
CALL registrarTotalConexiones(50, '02', '2019', 5047, '00000000000000000000000000000001');

-- CONEXIONES PERIODO '03-2019' - 'MARZO 2019' 
-- CALL registrarTotalConexiones(2, '03', '2019', 3584, '00000000000000000000000000000001'); -- Zona I-I
-- CALL registrarTotalConexiones(11, '03', '2019', 6025, '00000000000000000000000000000001'); -- Zona IV
-- CALL registrarTotalConexiones(14, '03', '2019', 3353, '00000000000000000000000000000001'); -- Zona V
-- CALL registrarTotalConexiones(18, '03', '2019', 2760, '00000000000000000000000000000001'); -- Zona VI
-- CALL registrarTotalConexiones(23, '03', '2019', 9068, '00000000000000000000000000000001'); -- Zona VII
-- CALL registrarTotalConexiones(27, '03', '2019', 9740, '00000000000000000000000000000001'); -- Zona VIII
-- CALL registrarTotalConexiones(32, '03', '2019', 13835, '00000000000000000000000000000001'); -- Zona IX
-- CALL registrarTotalConexiones(41, '03', '2019', 13377, '00000000000000000000000000000001'); -- Zona XI
-- CALL registrarTotalConexiones(45, '03', '2019', 16241, '00000000000000000000000000000001'); -- Zona XII

CALL registrarTotalConexiones(3, '03', '2019', 1103, '00000000000000000000000000000001'); 
CALL registrarTotalConexiones(4, '03', '2019', 484, '00000000000000000000000000000001'); 
CALL registrarTotalConexiones(5, '03', '2019', 307, '00000000000000000000000000000001');
CALL registrarTotalConexiones(6, '03', '2019', 517, '00000000000000000000000000000001');
CALL registrarTotalConexiones(7, '03', '2019', 1173, '00000000000000000000000000000001');
CALL registrarTotalConexiones(8, '03', '2019', 2636, '00000000000000000000000000000001'); -- Zona I-II
CALL registrarTotalConexiones(9, '03', '2019', 1776, '00000000000000000000000000000001'); -- Zona II
CALL registrarTotalConexiones(10, '03', '2019', 1237, '00000000000000000000000000000001'); -- Zona III
CALL registrarTotalConexiones(12, '03', '2019', 3657, '00000000000000000000000000000001');
CALL registrarTotalConexiones(13, '03', '2019', 2368, '00000000000000000000000000000001');
CALL registrarTotalConexiones(15, '03', '2019', 1646, '00000000000000000000000000000001');
CALL registrarTotalConexiones(16, '03', '2019', 984, '00000000000000000000000000000001');
CALL registrarTotalConexiones(17, '03', '2019', 723, '00000000000000000000000000000001');
CALL registrarTotalConexiones(19, '03', '2019', 721, '00000000000000000000000000000001');
CALL registrarTotalConexiones(20, '03', '2019', 1025, '00000000000000000000000000000001');
CALL registrarTotalConexiones(21, '03', '2019', 303, '00000000000000000000000000000001');
CALL registrarTotalConexiones(22, '03', '2019', 711, '00000000000000000000000000000001');
CALL registrarTotalConexiones(24, '03', '2019', 1708, '00000000000000000000000000000001');
CALL registrarTotalConexiones(25, '03', '2019', 6118, '00000000000000000000000000000001');
CALL registrarTotalConexiones(26, '03', '2019', 1242, '00000000000000000000000000000001');
CALL registrarTotalConexiones(28, '03', '2019', 4907, '00000000000000000000000000000001');
CALL registrarTotalConexiones(29, '03', '2019', 652, '00000000000000000000000000000001');
CALL registrarTotalConexiones(30, '03', '2019', 1518, '00000000000000000000000000000001');
CALL registrarTotalConexiones(31, '03', '2019', 2663, '00000000000000000000000000000001');
CALL registrarTotalConexiones(33, '03', '2019', 5160, '00000000000000000000000000000001');
CALL registrarTotalConexiones(34, '03', '2019', 594, '00000000000000000000000000000001');
CALL registrarTotalConexiones(35, '03', '2019', 960, '00000000000000000000000000000001');
CALL registrarTotalConexiones(36, '03', '2019', 2004, '00000000000000000000000000000001');
CALL registrarTotalConexiones(37, '03', '2019', 595, '00000000000000000000000000000001');
CALL registrarTotalConexiones(38, '03', '2019', 1401, '00000000000000000000000000000001');
CALL registrarTotalConexiones(39, '03', '2019', 3121, '00000000000000000000000000000001');
CALL registrarTotalConexiones(40, '03', '2019', 2240, '00000000000000000000000000000001'); -- Zona X
CALL registrarTotalConexiones(42, '03', '2019', 10468, '00000000000000000000000000000001');
CALL registrarTotalConexiones(43, '03', '2019', 546, '00000000000000000000000000000001');
CALL registrarTotalConexiones(44, '03', '2019', 2363, '00000000000000000000000000000001');
CALL registrarTotalConexiones(46, '03', '2019', 4530, '00000000000000000000000000000001');
CALL registrarTotalConexiones(47, '03', '2019', 1384, '00000000000000000000000000000001');
CALL registrarTotalConexiones(48, '03', '2019', 3310, '00000000000000000000000000000001');
CALL registrarTotalConexiones(49, '03', '2019', 1963, '00000000000000000000000000000001');
CALL registrarTotalConexiones(50, '03', '2019', 5054, '00000000000000000000000000000001');

-- CONEXIONES PERIODO '04-2019' - 'ABRIL 2019' 
-- CALL registrarTotalConexiones(2, '04', '2019', 3591, '00000000000000000000000000000001');
-- CALL registrarTotalConexiones(11, '04', '2019', 6032, '00000000000000000000000000000001');
-- CALL registrarTotalConexiones(14, '04', '2019', 3368, '00000000000000000000000000000001');
-- CALL registrarTotalConexiones(18, '04', '2019', 2759, '00000000000000000000000000000001');
-- CALL registrarTotalConexiones(23, '04', '2019', 9085, '00000000000000000000000000000001');
-- CALL registrarTotalConexiones(27, '04', '2019', 9766, '00000000000000000000000000000001');
-- CALL registrarTotalConexiones(32, '04', '2019', 13886, '00000000000000000000000000000001');
-- CALL registrarTotalConexiones(41, '04', '2019', 13416, '00000000000000000000000000000001');
-- CALL registrarTotalConexiones(45, '04', '2019', 16321, '00000000000000000000000000000001');

CALL registrarTotalConexiones( 3, '04', '2019', 1109, '00000000000000000000000000000001'); -- I-I-a
CALL registrarTotalConexiones( 4, '04', '2019', 486, '00000000000000000000000000000001');
CALL registrarTotalConexiones( 5, '04', '2019', 306, '00000000000000000000000000000001');
CALL registrarTotalConexiones( 6, '04', '2019', 518, '00000000000000000000000000000001');
CALL registrarTotalConexiones( 7, '04', '2019', 1172, '00000000000000000000000000000001');
CALL registrarTotalConexiones( 8, '04', '2019', 2641, '00000000000000000000000000000001');
CALL registrarTotalConexiones( 9, '04', '2019', 1780, '00000000000000000000000000000001');
CALL registrarTotalConexiones(10, '04', '2019', 1240, '00000000000000000000000000000001');
CALL registrarTotalConexiones(12, '04', '2019', 3661, '00000000000000000000000000000001');
CALL registrarTotalConexiones(13, '04', '2019', 2371, '00000000000000000000000000000001');
CALL registrarTotalConexiones(15, '04', '2019', 1657, '00000000000000000000000000000001');
CALL registrarTotalConexiones(16, '04', '2019', 986, '00000000000000000000000000000001');
CALL registrarTotalConexiones(17, '04', '2019', 725, '00000000000000000000000000000001');
CALL registrarTotalConexiones(19, '04', '2019', 721, '00000000000000000000000000000001');
CALL registrarTotalConexiones(20, '04', '2019', 1020, '00000000000000000000000000000001');
CALL registrarTotalConexiones(21, '04', '2019', 306, '00000000000000000000000000000001');
CALL registrarTotalConexiones(22, '04', '2019', 712, '00000000000000000000000000000001');
CALL registrarTotalConexiones(24, '04', '2019', 1720, '00000000000000000000000000000001');
CALL registrarTotalConexiones(25, '04', '2019', 6115, '00000000000000000000000000000001');
CALL registrarTotalConexiones(26, '04', '2019', 1250, '00000000000000000000000000000001');
CALL registrarTotalConexiones(28, '04', '2019', 4920, '00000000000000000000000000000001');
CALL registrarTotalConexiones(29, '04', '2019', 653, '00000000000000000000000000000001');
CALL registrarTotalConexiones(30, '04', '2019', 1525, '00000000000000000000000000000001');
CALL registrarTotalConexiones(31, '04', '2019', 2668, '00000000000000000000000000000001');
CALL registrarTotalConexiones(33, '04', '2019', 5182, '00000000000000000000000000000001');
CALL registrarTotalConexiones(34, '04', '2019', 594, '00000000000000000000000000000001');
CALL registrarTotalConexiones(35, '04', '2019', 962, '00000000000000000000000000000001');
CALL registrarTotalConexiones(36, '04', '2019', 2013, '00000000000000000000000000000001');
CALL registrarTotalConexiones(37, '04', '2019', 599, '00000000000000000000000000000001');
CALL registrarTotalConexiones(38, '04', '2019', 1413, '00000000000000000000000000000001');
CALL registrarTotalConexiones(39, '04', '2019', 3123, '00000000000000000000000000000001');
CALL registrarTotalConexiones(40, '04', '2019', 2250, '00000000000000000000000000000001');
CALL registrarTotalConexiones(42, '04', '2019', 10511, '00000000000000000000000000000001');
CALL registrarTotalConexiones(43, '04', '2019', 546, '00000000000000000000000000000001');
CALL registrarTotalConexiones(44, '04', '2019', 2359, '00000000000000000000000000000001');
CALL registrarTotalConexiones(46, '04', '2019', 4536, '00000000000000000000000000000001');
CALL registrarTotalConexiones(47, '04', '2019', 1385, '00000000000000000000000000000001');
CALL registrarTotalConexiones(48, '04', '2019', 3328, '00000000000000000000000000000001');
CALL registrarTotalConexiones(49, '04', '2019', 1986, '00000000000000000000000000000001');
CALL registrarTotalConexiones(50, '04', '2019', 5086, '00000000000000000000000000000001');

-- CONEXIONES PERIODO '05-2019' - 'MAYO 2019' 
-- CALL registrarTotalConexiones(2, '05', '2019', 3584, '00000000000000000000000000000001'); -- Zona I-I
-- CALL registrarTotalConexiones(11, '05', '2019', 6025, '00000000000000000000000000000001'); -- Zona IV
-- CALL registrarTotalConexiones(14, '05', '2019', 3367, '00000000000000000000000000000001'); -- Zona V
-- CALL registrarTotalConexiones(18, '05', '2019', 2755, '00000000000000000000000000000001'); -- Zona VI
-- CALL registrarTotalConexiones(23, '05', '2019', 9069, '00000000000000000000000000000001'); -- Zona VII
-- CALL registrarTotalConexiones(27, '05', '2019', 9758, '00000000000000000000000000000001'); -- Zona VIII
-- CALL registrarTotalConexiones(32, '05', '2019', 13901, '00000000000000000000000000000001'); -- Zona IX
-- CALL registrarTotalConexiones(41, '05', '2019', 13413, '00000000000000000000000000000001'); -- Zona XI
-- CALL registrarTotalConexiones(45, '05', '2019', 16313, '00000000000000000000000000000001'); -- Zona XII

CALL registrarTotalConexiones(3, '05', '2019', 1109, '00000000000000000000000000000001'); 
CALL registrarTotalConexiones(4, '05', '2019', 485, '00000000000000000000000000000001'); 
CALL registrarTotalConexiones(5, '05', '2019', 306, '00000000000000000000000000000001');
CALL registrarTotalConexiones(6, '05', '2019', 515, '00000000000000000000000000000001');
CALL registrarTotalConexiones(7, '05', '2019', 1169, '00000000000000000000000000000001');
CALL registrarTotalConexiones(8, '05', '2019', 2636, '00000000000000000000000000000001'); -- Zona I-II
CALL registrarTotalConexiones(9, '05', '2019', 1782, '00000000000000000000000000000001'); -- Zona II
CALL registrarTotalConexiones(10, '05', '2019', 1240, '00000000000000000000000000000001'); -- Zona III
CALL registrarTotalConexiones(12, '05', '2019', 3652, '00000000000000000000000000000001');
CALL registrarTotalConexiones(13, '05', '2019', 2373, '00000000000000000000000000000001');
CALL registrarTotalConexiones(15, '05', '2019', 1660, '00000000000000000000000000000001'); -- V1
CALL registrarTotalConexiones(16, '05', '2019', 983, '00000000000000000000000000000001'); -- V2
CALL registrarTotalConexiones(17, '05', '2019', 724, '00000000000000000000000000000001'); -- V3
CALL registrarTotalConexiones(19, '05', '2019', 720, '00000000000000000000000000000001'); -- VI 1
CALL registrarTotalConexiones(20, '05', '2019', 1024, '00000000000000000000000000000001'); -- VI 2
CALL registrarTotalConexiones(21, '05', '2019', 306, '00000000000000000000000000000001');  -- VI 3
CALL registrarTotalConexiones(22, '05', '2019', 705, '00000000000000000000000000000001'); -- VI 4
CALL registrarTotalConexiones(24, '05', '2019', 1721, '00000000000000000000000000000001'); -- VII 1
CALL registrarTotalConexiones(25, '05', '2019', 6103, '00000000000000000000000000000001'); -- VII 2
CALL registrarTotalConexiones(26, '05', '2019', 1245, '00000000000000000000000000000001'); -- VII 3
CALL registrarTotalConexiones(28, '05', '2019', 4914, '00000000000000000000000000000001'); -- 8 - 1
CALL registrarTotalConexiones(29, '05', '2019', 654, '00000000000000000000000000000001'); -- 8 - 2  
CALL registrarTotalConexiones(30, '05', '2019', 1525, '00000000000000000000000000000001'); -- 8 - 3 
CALL registrarTotalConexiones(31, '05', '2019', 2665, '00000000000000000000000000000001'); -- 8 - 4
CALL registrarTotalConexiones(33, '05', '2019', 5190, '00000000000000000000000000000001'); -- 9 - 1
CALL registrarTotalConexiones(34, '05', '2019', 594, '00000000000000000000000000000001'); -- 
CALL registrarTotalConexiones(35, '05', '2019', 963, '00000000000000000000000000000001');
CALL registrarTotalConexiones(36, '05', '2019', 2019, '00000000000000000000000000000001');
CALL registrarTotalConexiones(37, '05', '2019', 600, '00000000000000000000000000000001');
CALL registrarTotalConexiones(38, '05', '2019', 1413, '00000000000000000000000000000001');
CALL registrarTotalConexiones(39, '05', '2019', 3122, '00000000000000000000000000000001');
CALL registrarTotalConexiones(40, '05', '2019', 2252, '00000000000000000000000000000001'); -- Zona X
CALL registrarTotalConexiones(42, '05', '2019', 10505, '00000000000000000000000000000001');
CALL registrarTotalConexiones(43, '05', '2019', 545, '00000000000000000000000000000001');
CALL registrarTotalConexiones(44, '05', '2019', 2363, '00000000000000000000000000000001');
CALL registrarTotalConexiones(46, '05', '2019', 4534, '00000000000000000000000000000001');
CALL registrarTotalConexiones(47, '05', '2019', 1385, '00000000000000000000000000000001');
CALL registrarTotalConexiones(48, '05', '2019', 3330, '00000000000000000000000000000001');
CALL registrarTotalConexiones(49, '05', '2019', 1982, '00000000000000000000000000000001');
CALL registrarTotalConexiones(50, '05', '2019', 5082, '00000000000000000000000000000001');

-- CONEXIONES PERIODO '06-2019' - 'JUNIO 2019' 
-- CALL registrarTotalConexiones(2, '06', '2019', 3588, '00000000000000000000000000000001'); -- Zona I-I
-- CALL registrarTotalConexiones(11, '06', '2019', 6028, '00000000000000000000000000000001'); -- Zona IV
-- CALL registrarTotalConexiones(14, '06', '2019', 3371, '00000000000000000000000000000001'); -- Zona V
-- CALL registrarTotalConexiones(18, '06', '2019', 2747, '00000000000000000000000000000001'); -- Zona VI
-- CALL registrarTotalConexiones(23, '06', '2019', 9085, '00000000000000000000000000000001'); -- Zona VII
-- CALL registrarTotalConexiones(27, '06', '2019', 9762, '00000000000000000000000000000001'); -- Zona VIII
-- CALL registrarTotalConexiones(32, '06', '2019', 13904, '00000000000000000000000000000001'); -- Zona IX
-- CALL registrarTotalConexiones(41, '06', '2019', 13423, '00000000000000000000000000000001'); -- Zona XI
-- CALL registrarTotalConexiones(45, '06', '2019', 16382, '00000000000000000000000000000001'); -- Zona XII

CALL registrarTotalConexiones(3, '06', '2019', 1112, '00000000000000000000000000000001'); 
CALL registrarTotalConexiones(4, '06', '2019', 485, '00000000000000000000000000000001'); 
CALL registrarTotalConexiones(5, '06', '2019', 306, '00000000000000000000000000000001');
CALL registrarTotalConexiones(6, '06', '2019', 517, '00000000000000000000000000000001');
CALL registrarTotalConexiones(7, '06', '2019', 1168, '00000000000000000000000000000001');
CALL registrarTotalConexiones(8, '06', '2019', 2630, '00000000000000000000000000000001'); -- Zona I-II
CALL registrarTotalConexiones(9, '06', '2019', 1781, '00000000000000000000000000000001'); -- Zona II
CALL registrarTotalConexiones(10, '06', '2019', 1239, '00000000000000000000000000000001'); -- Zona III
CALL registrarTotalConexiones(12, '06', '2019', 3654, '00000000000000000000000000000001');
CALL registrarTotalConexiones(13, '06', '2019', 2374, '00000000000000000000000000000001');
CALL registrarTotalConexiones(15, '06', '2019', 1662, '00000000000000000000000000000001');
CALL registrarTotalConexiones(16, '06', '2019', 989, '00000000000000000000000000000001');
CALL registrarTotalConexiones(17, '06', '2019', 720, '00000000000000000000000000000001'); -- V - 3
CALL registrarTotalConexiones(19, '06', '2019', 720, '00000000000000000000000000000001');
CALL registrarTotalConexiones(20, '06', '2019', 1024, '00000000000000000000000000000001');
CALL registrarTotalConexiones(21, '06', '2019', 305, '00000000000000000000000000000001');
CALL registrarTotalConexiones(22, '06', '2019', 698, '00000000000000000000000000000001');
CALL registrarTotalConexiones(24, '06', '2019', 1726, '00000000000000000000000000000001');
CALL registrarTotalConexiones(25, '06', '2019', 6114, '00000000000000000000000000000001');
CALL registrarTotalConexiones(26, '06', '2019', 1245, '00000000000000000000000000000001');
CALL registrarTotalConexiones(28, '06', '2019', 4914, '00000000000000000000000000000001');
CALL registrarTotalConexiones(29, '06', '2019', 651, '00000000000000000000000000000001');
CALL registrarTotalConexiones(30, '06', '2019', 1527, '00000000000000000000000000000001');
CALL registrarTotalConexiones(31, '06', '2019', 2670, '00000000000000000000000000000001');
CALL registrarTotalConexiones(33, '06', '2019', 5194, '00000000000000000000000000000001');
CALL registrarTotalConexiones(34, '06', '2019', 595, '00000000000000000000000000000001');
CALL registrarTotalConexiones(35, '06', '2019', 963, '00000000000000000000000000000001');
CALL registrarTotalConexiones(36, '06', '2019', 2015, '00000000000000000000000000000001');
CALL registrarTotalConexiones(37, '06', '2019', 597, '00000000000000000000000000000001');
CALL registrarTotalConexiones(38, '06', '2019', 1417, '00000000000000000000000000000001');
CALL registrarTotalConexiones(39, '06', '2019', 3123, '00000000000000000000000000000001');
CALL registrarTotalConexiones(40, '06', '2019', 2258, '00000000000000000000000000000001'); -- Zona X
CALL registrarTotalConexiones(42, '06', '2019', 10506, '00000000000000000000000000000001');
CALL registrarTotalConexiones(43, '06', '2019', 546, '00000000000000000000000000000001');
CALL registrarTotalConexiones(44, '06', '2019', 2371, '00000000000000000000000000000001');
CALL registrarTotalConexiones(46, '06', '2019', 4572, '00000000000000000000000000000001');
CALL registrarTotalConexiones(47, '06', '2019', 1396, '00000000000000000000000000000001');
CALL registrarTotalConexiones(48, '06', '2019', 3335, '00000000000000000000000000000001');
CALL registrarTotalConexiones(49, '06', '2019', 1989, '00000000000000000000000000000001');
CALL registrarTotalConexiones(50, '06', '2019', 5090, '00000000000000000000000000000001');

-- CONEXIONES PERIODO '07-2019' - 'JULIO 2019' 
-- CALL registrarTotalConexiones(2, '07', '2019', 3594, '00000000000000000000000000000001'); -- Zona I-I
-- CALL registrarTotalConexiones(11, '07', '2019', 6030, '00000000000000000000000000000001'); -- Zona IV
-- CALL registrarTotalConexiones(14, '07', '2019', 3375, '00000000000000000000000000000001'); -- Zona V
-- CALL registrarTotalConexiones(18, '07', '2019', 2747, '00000000000000000000000000000001'); -- Zona VI
-- CALL registrarTotalConexiones(23, '07', '2019', 9080, '00000000000000000000000000000001'); -- Zona VII
-- CALL registrarTotalConexiones(27, '07', '2019', 9771, '00000000000000000000000000000001'); -- Zona VIII
-- CALL registrarTotalConexiones(32, '07', '2019', 13911, '00000000000000000000000000000001'); -- Zona IX
-- CALL registrarTotalConexiones(41, '07', '2019', 13433, '00000000000000000000000000000001'); -- Zona XI
-- CALL registrarTotalConexiones(45, '07', '2019', 16409, '00000000000000000000000000000001'); -- Zona XII

CALL registrarTotalConexiones(3, '07', '2019', 1115, '00000000000000000000000000000001'); 
CALL registrarTotalConexiones(4, '07', '2019', 487, '00000000000000000000000000000001'); 
CALL registrarTotalConexiones(5, '07', '2019', 305, '00000000000000000000000000000001');
CALL registrarTotalConexiones(6, '07', '2019', 518, '00000000000000000000000000000001');
CALL registrarTotalConexiones(7, '07', '2019', 1169, '00000000000000000000000000000001');
CALL registrarTotalConexiones(8, '07', '2019', 2634, '00000000000000000000000000000001'); -- Zona I-II
CALL registrarTotalConexiones(9, '07', '2019', 1781, '00000000000000000000000000000001'); -- Zona II
CALL registrarTotalConexiones(10, '07', '2019', 1237, '00000000000000000000000000000001'); -- Zona III
CALL registrarTotalConexiones(12, '07', '2019', 3655, '00000000000000000000000000000001'); -- IV - 1
CALL registrarTotalConexiones(13, '07', '2019', 2375, '00000000000000000000000000000001'); -- IV - 2
CALL registrarTotalConexiones(15, '07', '2019', 1660, '00000000000000000000000000000001');
CALL registrarTotalConexiones(16, '07', '2019', 995, '00000000000000000000000000000001');
CALL registrarTotalConexiones(17, '07', '2019', 720, '00000000000000000000000000000001');
CALL registrarTotalConexiones(19, '07', '2019', 716, '00000000000000000000000000000001');
CALL registrarTotalConexiones(20, '07', '2019', 1025, '00000000000000000000000000000001');
CALL registrarTotalConexiones(21, '07', '2019', 308, '00000000000000000000000000000001');
CALL registrarTotalConexiones(22, '07', '2019', 698, '00000000000000000000000000000001');
CALL registrarTotalConexiones(24, '07', '2019', 1717, '00000000000000000000000000000001');
CALL registrarTotalConexiones(25, '07', '2019', 6118, '00000000000000000000000000000001');
CALL registrarTotalConexiones(26, '07', '2019', 1245, '00000000000000000000000000000001');
CALL registrarTotalConexiones(28, '07', '2019', 4913, '00000000000000000000000000000001');
CALL registrarTotalConexiones(29, '07', '2019', 651, '00000000000000000000000000000001');
CALL registrarTotalConexiones(30, '07', '2019', 1528, '00000000000000000000000000000001');
CALL registrarTotalConexiones(31, '07', '2019', 2679, '00000000000000000000000000000001');
CALL registrarTotalConexiones(33, '07', '2019', 5194, '00000000000000000000000000000001');
CALL registrarTotalConexiones(34, '07', '2019', 594, '00000000000000000000000000000001');
CALL registrarTotalConexiones(35, '07', '2019', 966, '00000000000000000000000000000001');
CALL registrarTotalConexiones(36, '07', '2019', 2018, '00000000000000000000000000000001');
CALL registrarTotalConexiones(37, '07', '2019', 594, '00000000000000000000000000000001');
CALL registrarTotalConexiones(38, '07', '2019', 1422, '00000000000000000000000000000001');
CALL registrarTotalConexiones(39, '07', '2019', 3123, '00000000000000000000000000000001');
CALL registrarTotalConexiones(40, '07', '2019', 2262, '00000000000000000000000000000001'); -- Zona X
CALL registrarTotalConexiones(42, '07', '2019', 10513, '00000000000000000000000000000001');
CALL registrarTotalConexiones(43, '07', '2019', 547, '00000000000000000000000000000001');
CALL registrarTotalConexiones(44, '07', '2019', 2373, '00000000000000000000000000000001');
CALL registrarTotalConexiones(46, '07', '2019', 4570, '00000000000000000000000000000001');
CALL registrarTotalConexiones(47, '07', '2019', 1401, '00000000000000000000000000000001');
CALL registrarTotalConexiones(48, '07', '2019', 3338, '00000000000000000000000000000001');
CALL registrarTotalConexiones(49, '07', '2019', 1989, '00000000000000000000000000000001');
CALL registrarTotalConexiones(50, '07', '2019', 5111, '00000000000000000000000000000001');

-- CONEXIONES PERIODO '08-2019' - 'AGOSTO 2019' 
-- CALL registrarTotalConexiones(2, '08', '2019', 3601, '00000000000000000000000000000001'); -- Zona I-I
-- CALL registrarTotalConexiones(11, '08', '2019', 6050, '00000000000000000000000000000001'); -- Zona IV
-- CALL registrarTotalConexiones(14, '08', '2019', 3390, '00000000000000000000000000000001'); -- Zona V
-- CALL registrarTotalConexiones(18, '08', '2019', 2768, '00000000000000000000000000000001'); -- Zona VI
-- CALL registrarTotalConexiones(23, '08', '2019', 9105, '00000000000000000000000000000001'); -- Zona VII
-- CALL registrarTotalConexiones(27, '08', '2019', 9788, '00000000000000000000000000000001'); -- Zona VIII
-- CALL registrarTotalConexiones(32, '08', '2019', 13979, '00000000000000000000000000000001'); -- Zona IX
-- CALL registrarTotalConexiones(41, '08', '2019', 13502, '00000000000000000000000000000001'); -- Zona XI
-- CALL registrarTotalConexiones(45, '08', '2019', 16474, '00000000000000000000000000000001'); -- Zona XII

CALL registrarTotalConexiones(3, '08', '2019', 1116, '00000000000000000000000000000001'); 
CALL registrarTotalConexiones(4, '08', '2019', 487, '00000000000000000000000000000001'); 
CALL registrarTotalConexiones(5, '08', '2019', 307, '00000000000000000000000000000001');
CALL registrarTotalConexiones(6, '08', '2019', 519, '00000000000000000000000000000001');
CALL registrarTotalConexiones(7, '08', '2019', 1172, '00000000000000000000000000000001');
CALL registrarTotalConexiones(8, '08', '2019', 2651, '00000000000000000000000000000001'); -- Zona I-II
CALL registrarTotalConexiones(9, '08', '2019', 1785, '00000000000000000000000000000001'); -- Zona II
CALL registrarTotalConexiones(10, '08', '2019', 1238, '00000000000000000000000000000001'); -- Zona III
CALL registrarTotalConexiones(12, '08', '2019', 3663, '00000000000000000000000000000001');
CALL registrarTotalConexiones(13, '08', '2019', 2387, '00000000000000000000000000000001');
CALL registrarTotalConexiones(15, '08', '2019', 1669, '00000000000000000000000000000001');
CALL registrarTotalConexiones(16, '08', '2019', 1001, '00000000000000000000000000000001');
CALL registrarTotalConexiones(17, '08', '2019', 720, '00000000000000000000000000000001');
CALL registrarTotalConexiones(19, '08', '2019', 720, '00000000000000000000000000000001');
CALL registrarTotalConexiones(20, '08', '2019', 1032, '00000000000000000000000000000001');
CALL registrarTotalConexiones(21, '08', '2019', 308, '00000000000000000000000000000001');
CALL registrarTotalConexiones(22, '08', '2019', 708, '00000000000000000000000000000001');
CALL registrarTotalConexiones(24, '08', '2019', 1727, '00000000000000000000000000000001');
CALL registrarTotalConexiones(25, '08', '2019', 6123, '00000000000000000000000000000001');
CALL registrarTotalConexiones(26, '08', '2019', 1255, '00000000000000000000000000000001');
CALL registrarTotalConexiones(28, '08', '2019', 4916, '00000000000000000000000000000001');
CALL registrarTotalConexiones(29, '08', '2019', 651, '00000000000000000000000000000001');
CALL registrarTotalConexiones(30, '08', '2019', 1540, '00000000000000000000000000000001');
CALL registrarTotalConexiones(31, '08', '2019', 2681, '00000000000000000000000000000001');
CALL registrarTotalConexiones(33, '08', '2019', 5220, '00000000000000000000000000000001');
CALL registrarTotalConexiones(34, '08', '2019', 599, '00000000000000000000000000000001');
CALL registrarTotalConexiones(35, '08', '2019', 970, '00000000000000000000000000000001');
CALL registrarTotalConexiones(36, '08', '2019', 2028, '00000000000000000000000000000001');
CALL registrarTotalConexiones(37, '08', '2019', 589, '00000000000000000000000000000001');
CALL registrarTotalConexiones(38, '08', '2019', 1436, '00000000000000000000000000000001');
CALL registrarTotalConexiones(39, '08', '2019', 3137, '00000000000000000000000000000001');
CALL registrarTotalConexiones(40, '08', '2019', 2265, '00000000000000000000000000000001'); -- Zona X
CALL registrarTotalConexiones(42, '08', '2019', 10580, '00000000000000000000000000000001');
CALL registrarTotalConexiones(43, '08', '2019', 548, '00000000000000000000000000000001');
CALL registrarTotalConexiones(44, '08', '2019', 2374, '00000000000000000000000000000001');
CALL registrarTotalConexiones(46, '08', '2019', 4588, '00000000000000000000000000000001');
CALL registrarTotalConexiones(47, '08', '2019', 1404, '00000000000000000000000000000001');
CALL registrarTotalConexiones(48, '08', '2019', 3351, '00000000000000000000000000000001');
CALL registrarTotalConexiones(49, '08', '2019', 1994, '00000000000000000000000000000001');
CALL registrarTotalConexiones(50, '08', '2019', 5137, '00000000000000000000000000000001');

-- CONEXIONES PERIODO '09-2019' - 'SETIEMBRE 2019'
-- CALL registrarTotalConexiones(2, '09', '2019', 3591, '00000000000000000000000000000001'); -- Zona I-I
-- CALL registrarTotalConexiones(11, '09', '2019', 6032, '00000000000000000000000000000001'); -- Zona IV
-- CALL registrarTotalConexiones(14, '09', '2019', 3368, '00000000000000000000000000000001'); -- Zona V
-- CALL registrarTotalConexiones(18, '09', '2019', 2759, '00000000000000000000000000000001'); -- Zona VI
-- CALL registrarTotalConexiones(23, '09', '2019', 9085, '00000000000000000000000000000001'); -- Zona VII
-- CALL registrarTotalConexiones(27, '09', '2019', 9766, '00000000000000000000000000000001'); -- Zona VIII
-- CALL registrarTotalConexiones(32, '09', '2019', 13886, '00000000000000000000000000000001'); -- Zona IX
-- CALL registrarTotalConexiones(41, '09', '2019', 13416, '00000000000000000000000000000001'); -- Zona XI
-- CALL registrarTotalConexiones(45, '09', '2019', 16321, '00000000000000000000000000000001'); -- Zona XII

CALL registrarTotalConexiones(3, '09', '2019', 1109, '00000000000000000000000000000001'); -- I-I-A 
CALL registrarTotalConexiones(4, '09', '2019', 486, '00000000000000000000000000000001'); -- I-I-B
CALL registrarTotalConexiones(5, '09', '2019', 306, '00000000000000000000000000000001'); -- I-I-C
CALL registrarTotalConexiones(6, '09', '2019', 518, '00000000000000000000000000000001'); -- I-I-D
CALL registrarTotalConexiones(7, '09', '2019', 1172, '00000000000000000000000000000001'); -- I-I-R
CALL registrarTotalConexiones(8, '09', '2019', 2641, '00000000000000000000000000000001'); -- I-II
CALL registrarTotalConexiones(9, '09', '2019', 1780, '00000000000000000000000000000001'); -- II
CALL registrarTotalConexiones(10, '09', '2019', 1240, '00000000000000000000000000000001'); --
CALL registrarTotalConexiones(12, '09', '2019', 3661, '00000000000000000000000000000001');
CALL registrarTotalConexiones(13, '09', '2019', 2371, '00000000000000000000000000000001');
CALL registrarTotalConexiones(15, '09', '2019', 1657, '00000000000000000000000000000001');
CALL registrarTotalConexiones(16, '09', '2019', 986, '00000000000000000000000000000001');
CALL registrarTotalConexiones(17, '09', '2019', 725, '00000000000000000000000000000001');
CALL registrarTotalConexiones(19, '09', '2019', 721, '00000000000000000000000000000001');
CALL registrarTotalConexiones(20, '09', '2019', 1020, '00000000000000000000000000000001');
CALL registrarTotalConexiones(21, '09', '2019', 306, '00000000000000000000000000000001');
CALL registrarTotalConexiones(22, '09', '2019', 712, '00000000000000000000000000000001');
CALL registrarTotalConexiones(24, '09', '2019', 1720, '00000000000000000000000000000001');
CALL registrarTotalConexiones(25, '09', '2019', 6115, '00000000000000000000000000000001');
CALL registrarTotalConexiones(26, '09', '2019', 1250, '00000000000000000000000000000001');
CALL registrarTotalConexiones(28, '09', '2019', 4920, '00000000000000000000000000000001');
CALL registrarTotalConexiones(29, '09', '2019', 653, '00000000000000000000000000000001');
CALL registrarTotalConexiones(30, '09', '2019', 1525, '00000000000000000000000000000001');
CALL registrarTotalConexiones(31, '09', '2019', 2668, '00000000000000000000000000000001');
CALL registrarTotalConexiones(33, '09', '2019', 5182, '00000000000000000000000000000001');
CALL registrarTotalConexiones(34, '09', '2019', 594, '00000000000000000000000000000001');
CALL registrarTotalConexiones(35, '09', '2019', 962, '00000000000000000000000000000001');
CALL registrarTotalConexiones(36, '09', '2019', 2013, '00000000000000000000000000000001');
CALL registrarTotalConexiones(37, '09', '2019', 599, '00000000000000000000000000000001');
CALL registrarTotalConexiones(38, '09', '2019', 1413, '00000000000000000000000000000001');
CALL registrarTotalConexiones(39, '09', '2019', 3123, '00000000000000000000000000000001');
CALL registrarTotalConexiones(40, '09', '2019', 2250, '00000000000000000000000000000001');
CALL registrarTotalConexiones(42, '09', '2019', 10511, '00000000000000000000000000000001');
CALL registrarTotalConexiones(43, '09', '2019', 546, '00000000000000000000000000000001');
CALL registrarTotalConexiones(44, '09', '2019', 2359, '00000000000000000000000000000001');
CALL registrarTotalConexiones(46, '09', '2019', 4536, '00000000000000000000000000000001');
CALL registrarTotalConexiones(47, '09', '2019', 1385, '00000000000000000000000000000001');
CALL registrarTotalConexiones(48, '09', '2019', 3328, '00000000000000000000000000000001');
CALL registrarTotalConexiones(49, '09', '2019', 1986, '00000000000000000000000000000001');
CALL registrarTotalConexiones(50, '09', '2019', 5086, '00000000000000000000000000000001');
*/