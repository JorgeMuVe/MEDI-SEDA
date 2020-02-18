/**
 * @class Sesion(Router)
 * @file apiSesion.js
 * @author {carrillog.luis[at]gmail[dot]com,jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Luis.Carrillo.Gutiérrez__Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

 /* TABLA BASE DE DATOS
DROP TABLE IF EXISTS sesion;
DELIMITER $$
CREATE TABLE IF NOT EXISTS sesion (
    firmaSesion CHAR(32) CHARACTER SET utf8 NOT NULL UNIQUE KEY,
    firmaUsuario CHAR(32) CHARACTER SET utf8,
    codigoUsuario INTEGER UNSIGNED,
    fechaIngreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fechaSalida TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
$$
DELIMITER ;
-- NUM TABLA = 1;
-- NUM PROCE = 2;
 */

'use strict';
const gestorRutaSesion = require('express').Router(); // INICIAR ENRUTADOR DE EXPRESS SERVER
const proveedorDeDatos = require('../conexiondb.js'); //CONEXIÓN A BASE DE DATOS
const jwt = require('jsonwebtoken'); // Generador de Token Web
process.env.SECRET_KEY = 'mediseda'; // LLAVE SECRETA PARA ENCRIPTAR SESION

/**
 * @description Gestionar Ruta para Crear un registro de Inicio de SESIÓN (POST) "/api/sesion/ingresar"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaSesion.post('/ingresar', async (solicitud,respuesta) => { //CREAR REGISTRO DE INICIO DE SESION
    /*
    DROP PROCEDURE IF EXISTS verificarIngreso;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS verificarIngreso (
    IN `@cuentaUsuario` CHAR(9),
    IN `@contrasegna` CHAR(40))
    BEGIN
    SET @firmaDigital = NULL;
    SET @codigoUsuario = NULL;
    SET @eSign = NULL;

    IF EXISTS ( SELECT * FROM usuario WHERE cuentaUsuario = `@cuentaUsuario` AND contrasegnaUsuario = `@contrasegna`)
        THEN SELECT firmaDigital , codigoUsuario INTO @firmaDigital , @codigoUsuario FROM usuario
        WHERE cuentaUsuario = `@cuentaUsuario` AND contrasegnaUsuario = `@contrasegna` AND HEX(UNHEX(habilitado))='01';

        SELECT REPLACE(UUID(), '-', '') INTO @eSign;

        INSERT INTO sesion (firmaSesion, firmaUsuario, codigoUsuario) 
        VALUES (@eSign,@firmaDigital,@codigoUsuario);

        SELECT u.codigoUsuario, u.cuentaUsuario,u.nombres,u.apellidosPaterno,u.apellidosMaterno,u.grupo,u.firmaDigital,@eSign AS firmaSesion
        FROM usuario u WHERE u.codigoUsuario = @codigoUsuario;

    ELSE SELECT "0" AS codError;
    END IF;
    END $$
    DELIMITER ;
    */
    try{   
        const { cuentaUsuario,contrasegnaUsuario } = solicitud.body;
        if (contrasegnaUsuario.length > 40) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }) } 
        else await proveedorDeDatos.query('CALL verificarIngreso(?,?)', [cuentaUsuario,contrasegnaUsuario] // Consulta a procedimiento almacenado
        ,(error,resultado) => {
            if(error)
                respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else{
                if(resultado[0][0].codError !== '0' ){ // Si no existen error
                    const datosUsuario = {
                        codigoUsuario : resultado[0][0]["codigoUsuario"],
                        cuentaUsuario : resultado[0][0]["cuentaUsuario"],
                        nombres : resultado[0][0]["nombres"],
                        apellidosPaterno : resultado[0][0]["apellidosPaterno"],
                        apellidosMaterno : resultado[0][0]["apellidosMaterno"],
                        grupo : resultado[0][0]["grupo"],
                        firmaDigital : resultado[0][0]["firmaDigital"],
                        firmaSesion : resultado[0][0]["firmaSesion"]
                    }
                    let token = jwt.sign(datosUsuario,process.env.SECRET_KEY); // Encriptar Datos de ingreso
                    respuesta.json({ token : token }); // Envio token encriptado
                }else{
                    respuesta.json({ error : "No existe Usuario" }); // Enviar error en JSON
                }
            }
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    }catch(error){ respuesta.json({ error : error.code }) }  // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Cambiar/Actualizar la FECHA de SALIDA de sesión (PUT) "/api/sesion/salir"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaSesion.put('/salir', async (solicitud,respuesta) => { //CAMBIAR FECHA DE SALIDA DE SESION
    /* 
    DROP PROCEDURE IF EXISTS modificarFechaSalidaSesion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarFechaSalidaSesion (
    IN `@firmaSesion` CHAR(32) CHARACTER SET utf8,
    IN `@firmaUsuario` CHAR(32) CHARACTER SET utf8
    ) BEGIN

    UPDATE sesion SET fechaSalida = CURRENT_TIMESTAMP WHERE firmaSesion = `@firmaSesion` AND firmaUsuario = `@firmaUsuario`;
    INSERT INTO bitacora VALUES (`@quien`, 1, `@firmaSesion`, 4, CURRENT_TIMESTAMP);

    END;
    $$
    DELIMITER ;
    */
    try {
        const { firmaSesion, firmaUsuario } = solicitud.body;
        if ((firmaSesion.length !== 32) || (firmaUsuario.length !== 32)) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }) } 
        else await proveedorDeDatos.query('CALL modificarFechaSalidaSesion(?,?)', [firmaSesion,firmaUsuario] // Consulta a procedimiento almacenado
        , (error,resultado) => {
            if(error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else
            respuesta.send(resultado); // Enviar respuesta de consulta en JSON
        } );
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    }catch(error){ respuesta.json({ error : error.code }) }  // Enviar error en JSON
});

/**
 * @description Verificar el Número de Procedimientos Almacenados para el módulo SESIÓN (LOGEARSE) con la ruta (GET) "/api/sesion/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaSesion.get('/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosSesion;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosSesion ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total
        FROM information_schema.routines
        WHERE specific_name='verificarIngreso' OR
              specific_name='modificarFechaSalidaSesion'; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [2] */
        await proveedorDeDatos.query( "CALL contarProcedimientosSesion()",
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

module.exports = gestorRutaSesion; //EXPORTAR FUNCIONES AL ROUTER
