/**
 * @class Usuario(Router)
 * @file apiUsuario.js
 * @author {carrillog.luis[at]gmail[dot]com,jorge.muvez[at]gmail[dot]com }
 * @date 2019
 * @copyright Luis.Carrillo.Gutiérrez__Jorge.Muñiz.Velasquez__World.Connect.Perú
 */

/*
DROP TABLE IF EXISTS usuario;
DELIMITER $$
CREATE TABLE IF NOT EXISTS usuario (
    codigoUsuario INTEGER UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    cuentaUsuario CHAR(9) NOT NULL,
    contrasegnaUsuario CHAR(40) NOT NULL,
    nombres VARCHAR(40) NOT NULL,
    apellidosPaterno VARCHAR(40) NOT NULL,
    apellidosMaterno VARCHAR(40) NULL,
    firmaDigital CHAR(32) CHARACTER SET utf8 NOT NULL UNIQUE KEY, 
    grupo TINYINT(1) NOT NULL DEFAULT 1, (-- 0 OPERADOR --- 1 ADMINISTRADOR --- 2 GERENTE)
    habilitado BINARY(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
$$
DELIMITER ;
-- NUM TABLA  = 2;
-- NUM PROCE = 8;
*/

'use strict';
const gestorRutaUsuario = require('express').Router();// INICIAR ENRUTADOR DE EXPRESS SERVER
const proveedorDeDatos = require('../conexiondb.js'); //CONEXIÓN A BASE DE DATOS

/**
 * @description Gestionar Ruta para Listar USUARIOS para Paginado (POST) "/api/usuario/paginado"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaUsuario.post('/paginado' ,async (solicitud,respuesta)=>{ // LISTAR TODOS LOS USUARIOS
    /*
    DROP PROCEDURE IF EXISTS listarUsuariosPaginado;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarUsuariosPaginado (
        IN `@inicio` INTEGER UNSIGNED,
        IN `@resultados` INTEGER UNSIGNED
    ) BEGIN
        SELECT codigoUsuario, cuentaUsuario, nombres, apellidosPaterno, apellidosMaterno, 
        firmaDigital, grupo, CAST(habilitado AS INTEGER) as habilitado FROM usuario LIMIT `@inicio`,`@resultados`;
    END;
    $$
    DELIMITER ;
    */
    try{
        await proveedorDeDatos.query('CALL listarUsuariosPaginado(?,?)',
        [ parseInt(solicitud.body.inicio), parseInt(solicitud.body.resultados) ]        
        ,(error,resultado) => { // Consulta a procedimiento almacenado
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else
            respuesta.json(resultado[0] ); // Enviar resultado de consulta en JSON
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    }catch(error){ respuesta.json({ error : error.code }) }  // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Listar los USUARIOS DISPONIBLES (GET) "/api/usuario/disponibles"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaUsuario.get('/disponibles' ,async (solicitud,respuesta)=>{ // LISTAR USUARIOS DISPONIBLES
    /*
    DROP PROCEDURE IF EXISTS listarUsuariosDisponibles;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarUsuariosDisponibles (
    ) BEGIN
        SELECT codigoUsuario, cuentaUsuario, nombres, apellidosPaterno, apellidosMaterno, firmaDigital , contrasegnaUsuario , grupo
        FROM usuario WHERE HEX(UNHEX(habilitado))='01';
    END;
    $$
    DELIMITER ;
    */
    try{
        await proveedorDeDatos.query('CALL listarUsuariosDisponibles()', (error,resultado) => {// Consulta a procedimiento almacenado
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else
            respuesta.json(resultado[0] ); // Enviar resultado de consulta en JSON
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    }catch(error){ respuesta.json({ error : error.code }) }  // Enviar error en JSON

});

/**
 * @description Listar datos de los USUARIOS para la creación de un componente gestionado con la ruta (GET) "/api/usuario/disponibles"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaUsuario.get('/componente' ,async (solicitud,respuesta)=>{
    /*
    DROP PROCEDURE IF EXISTS listarUsuariosParaComponente;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS listarUsuariosParaComponente (
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;
        SELECT firmaDigital, CONCAT(nombres, ', ', apellidosPaterno, IFNULL(apellidosMaterno, '')) as nombreCompleto
        FROM usuario;
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try{
        await proveedorDeDatos.query( 'CALL listarUsuariosParaComponente()',
        (error,resultado) => {
            if (error)
                respuesta.json({ "error" : (error.sqlMessage + " - " + error.sql) });
            else
                respuesta.json( resultado[0] );
        });
        proveedorDeDatos.release();
    } catch(errorExcepcion) {
        respuesta.json({ "error" : errorExcepcion.code });
    }
});

/**
 * @description Gestionar Ruta para Agrega una NUEVA CUENTA de USUARIO (POST) "/api/usuario"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaUsuario.post('/', async (solicitud,respuesta) => { //AGREGAR NUEVO USUARIO
    /* 
    DROP PROCEDURE IF EXISTS agregarNuevoUsuario;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS agregarNuevoUsuario (
    IN `@cuentaUsr` CHAR(9),
    IN `@contrasegna` CHAR(40),
    IN `@nombre` VARCHAR(40),
    IN `@apPaterno` VARCHAR(40),
    IN `@apMaterno` VARCHAR(40),
    IN `@grupo` TINYINT(1),
    IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    SET @eSign = NULL;
    SELECT REPLACE(UUID(), '-', '') INTO @eSign;
    INSERT INTO usuario(cuentaUsuario, contrasegnaUsuario, nombres, apellidosPaterno, apellidosMaterno, firmaDigital, grupo) 
    VALUES (`@cuentaUsr`, `@contrasegna`, `@nombre`, `@apPaterno`, `@apMaterno`, @eSign , `@grupo`);

    SET @tmp = LAST_INSERT_ID();
    INSERT INTO bitacora VALUES (`@quien`, 2, @tmp, 0, CURRENT_TIMESTAMP);

    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try{   
        const { cuentaUsuario,contrasegnaUsuario,nombres,
                apellidosPaterno,apellidosMaterno,grupo,quien  } = solicitud.body;
        
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }) }
        else await proveedorDeDatos.query('CALL agregarNuevoUsuario(?,?,?,?,?,?,?)', // Consulta a procedimiento almacenado
        [   cuentaUsuario,contrasegnaUsuario,nombres,apellidosPaterno,apellidosMaterno,grupo,quien ]
        , (error, resultado) => {
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }); // Enviar error en JSON
            else
            respuesta.send(resultado); // Enviar resultado de consulta en JSON
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    }catch(error){ respuesta.json({ error : error.code }) }  // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para MODIFICAR USUARIO CUENTA DE USUARIO (PUT) "/api/usuario"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaUsuario.put('/', async (solicitud,respuesta) => { //MODIFICAR USUARIO CUENTA DE USUARIO 
    /* 
    DROP PROCEDURE IF EXISTS modificarUsuarioCuenta;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarUsuarioCuenta (
    IN `@codigoUsr` INTEGER UNSIGNED,
    IN `@cuentaUsr` CHAR(9),
    IN `@contrasegna` CHAR(40),
    IN `@nombre` VARCHAR(40),
    IN `@apPaterno` VARCHAR(40),
    IN `@apMaterno` VARCHAR(40),
    IN `@grupo` TINYINT(1),
    IN `@habilitado` INTEGER UNSIGNED,
    IN `@quien` CHAR(32) CHARACTER SET utf8

    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    SET @estaHabilitado = 0;
    IF `@habilitado` = 1 THEN SET @estaHabilitado = HEX(1); 
    ELSE SET @estaHabilitado = HEX(0);  
    END IF;

    UPDATE usuario SET
        cuentaUsuario = `@cuentaUsr`,
        contrasegnaUsuario = `@contrasegna`,
        nombres = `@nombre`,
        apellidosPaterno = `@apPaterno`,
        apellidosMaterno = `@apMaterno`,
        grupo = `@grupo`,
        habilitado = @estaHabilitado
    WHERE codigoUsuario = `@codigoUsr`;
    INSERT INTO bitacora VALUES (`@quien`, 2, `@codigoUsr`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        const { codigoUsuario,cuentaUsuario,contrasegnaUsuario,nombres, 
                apellidosPaterno,apellidosMaterno,grupo,habilitado,quien } = solicitud.body;
    
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }) } 
        else await proveedorDeDatos.query('CALL modificarUsuarioCuenta(?,?,?,?,?,?,?,?,?)', // Consulta a procedimiento almacenado
        [   codigoUsuario,cuentaUsuario,contrasegnaUsuario,nombres,apellidosPaterno,apellidosMaterno,grupo,habilitado,quien ]
        , (error, resultado) => {
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) })// Enviar error en JSON
            else
            respuesta.send(resultado) // Enviar resultado de consulta en JSON
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    }catch(error){ respuesta.json({ error : error.code }) }// Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Modificar los datos de una CUENTA de USUARIO (sin alterar la contraseña) (PUT) "/api/usuario/datos"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaUsuario.put('/datos', async (solicitud,respuesta) => { //MODIFICAR DATOS DE CUENTA DE USUARIO
    /* 
    DROP PROCEDURE IF EXISTS modificarDatosCuenta;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarDatosCuenta (
    IN `@codigoUsr` INTEGER UNSIGNED,
    IN `@cuentaUsr` CHAR(9),
    IN `@nombre` VARCHAR(40),
    IN `@apPaterno` VARCHAR(40),
    IN `@apMaterno` VARCHAR(40),
    IN `@grupo` TINYINT(1),
    IN `@habilitado` INTEGER UNSIGNED,
    IN `@quien` CHAR(32) CHARACTER SET utf8

    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    SET @estaHabilitado = 0;
    IF `@habilitado` = 1 THEN SET @estaHabilitado = HEX(1); 
    ELSE SET @estaHabilitado = HEX(0);  
    END IF;

    UPDATE usuario SET
        cuentaUsuario = `@cuentaUsr`,
        nombres = `@nombre`,
        apellidosPaterno = `@apPaterno`,
        apellidosMaterno = `@apMaterno`,
        grupo = `@grupo`,
        habilitado = @estaHabilitado
    WHERE codigoUsuario = `@codigoUsr`;
    INSERT INTO bitacora VALUES (`@quien`, 2, `@codigoUsr`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END;
    $$
    DELIMITER ;
    */
    try {
        const { codigoUsuario,cuentaUsuario,nombres,apellidosPaterno,
                apellidosMaterno,grupo,habilitado,quien } = solicitud.body;
                
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }) }
        else await proveedorDeDatos.query('CALL modificarDatosCuenta(?,?,?,?,?,?,?,?)', // Consulta a procedimiento almacenado
        [   codigoUsuario,cuentaUsuario,nombres,apellidosPaterno,apellidosMaterno,grupo,habilitado,quien ]
        , (error, resultado) => {
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }) // Enviar error en JSON
            else
            respuesta.send(resultado) // Enviar resultado de consulta en JSON
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    }catch(error){ respuesta.json({ error : error.code }) } // Enviar error en JSON
});

/**
 * @description Gestionar Ruta para Actualizar la CONTRASEÑA de una CUENTA de USUARIO (PUT) "/api/usuario/contrasegna"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaUsuario.put('/contrasegna', async (solicitud,respuesta) => { //MODIFICAR CONTRASEÑA DE CUENTA DE USUARIO
    /* 
    DROP PROCEDURE IF EXISTS verificarContrasegna;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS verificarContrasegna (

    IN `@usuario` INTEGER UNSIGNED, 
    IN `@acContrasegna` VARCHAR(80),
    IN `@nuContrasegna` VARCHAR(80),
    IN `@quien` CHAR(32) CHARACTER SET utf8

    ) BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK;
    START TRANSACTION;

    IF EXISTS(SELECT codigoUsuario FROM usuario WHERE codigoUsuario = `@usuario` AND BINARY contrasegnaUsuario = `@acContrasegna`) THEN
        UPDATE usuario SET contrasegnaUsuario = `@nuContrasegna` 
        WHERE BINARY codigoUsuario = `@usuario`;
        INSERT INTO bitacora VALUES (`@quien`, 2, `@usuario`, 2, CURRENT_TIMESTAMP);
        SELECT "200" codigo;

    ELSE SELECT "401" codigo;
    END IF;

    COMMIT;
    END;
    $$
    */
    try {
        const { codigoUsuario,actualContrasegna,nuevaContrasegna,quien } = solicitud.body;
        
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }) }
        else await proveedorDeDatos.query('CALL verificarContrasegna(?,?,?,?)', // Consulta a procedimiento almacenado
        [ codigoUsuario,actualContrasegna,nuevaContrasegna,quien ]
        , (error, resultado) => {
            if (error)
            respuesta.json({ error : (error.sqlMessage + " - " + error.sql) }) // Enviar error en JSON
            else
            respuesta.json(resultado[0]) // Enviar resultado de consulta en JSON
        });
        proveedorDeDatos.release(); //Liberar la conexión usada del POOL de conexiones
    }catch(error){ respuesta.json({ error : error.code }) } // Enviar error en JSON
});


/**
 * @description Gestionar Ruta para Cambiar el Estado Habilitado de un Usuario (PUT) "/api/usuario/habilitar"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaUsuario.put('/habilitar', async (solicitud, respuesta ) => {
    /*
    DROP PROCEDURE IF EXISTS modificarHabilitadoUsuario;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS modificarHabilitadoUsuario (
        IN `@usuario` INTEGER UNSIGNED,
        IN `@habilitado` INTEGER UNSIGNED,
        IN `@quien` CHAR(32) CHARACTER SET utf8
    ) BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        UPDATE usuario SET habilitado = HEX(`@habilitado`) WHERE codigoUsuario =`@usuario`;
        INSERT INTO bitacora VALUES (`@quien`, 2, `@usuario`, 2, CURRENT_TIMESTAMP);
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try {
        const {usuario, habilitado, quien} = solicitud.body;
        if (quien.length !== 32) { respuesta.json({ "error" : 'parámetro(s) INADECUADO(s)' }); }
        else await proveedorDeDatos.query("CALL modificarHabilitadoUsuario(?,?,?)", 
            [ parseInt(usuario),parseInt(habilitado),quien], 
            (error, resultado) => {
                if (error)
                    respuesta.json({ "error" : error });
                else
                    respuesta.json( resultado );   
        });
        proveedorDeDatos.release();
    } catch(errorExcepcion) { 
        respuesta.json({ "error" : errorExcepcion.code });
    }
});

/**
 * @description Devuelve el Número de CUENTAS de USUARIO registradas (incluyendo deshabilitadas) gestionado con la ruta (GET) "/api/usuario/total"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaUsuario.get('/total', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarUsuariosRegistrados;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarUsuariosRegistrados ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total FROM usuario; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try {
        await proveedorDeDatos.query("CALL contarUsuariosRegistrados()",
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
 * @description Verificar el Número de Procedimientos Almacenados para el módulo de USUARIO gestionado con la ruta (GET) "/api/usuario/verificacion"
 * @since 0.0.1 
 * @param {object} solicitud Parámetros adjuntos a la petición Web de la ruta gestionada
 * @param {object} respuesta Gestor del despliegue de datos o errores
 * @returns {JSON} Datos de la base de datos o errores producidos por obtener estos
 */
gestorRutaUsuario.get('/verificacion', async (solicitud, respuesta) => {
    /*
    DROP PROCEDURE IF EXISTS contarProcedimientosUsuario;
    DELIMITER $$
    CREATE PROCEDURE IF NOT EXISTS contarProcedimientosUsuario ( ) 
    BEGIN 
    DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK; 
    START TRANSACTION;
        SELECT count(*) AS total
        FROM information_schema.routines
        WHERE specific_name='listarUsuarios' OR
              specific_name='listarUsuariosDisponibles' OR 
              specific_name='listarUsuariosParaComponente' OR 
              specific_name='agregarNuevoUsuario' OR 
              specific_name='modificarUsuarioCuenta' OR
              specific_name='modificarDatosCuenta' OR
              specific_name='verificarContrasegna' OR 
              specific_name='contarUsuariosRegistrados'; 
    COMMIT;
    END; 
    $$
    DELIMITER ;
    */
    try { /* Nos debe dar [8] */
        await proveedorDeDatos.query("CALL contarProcedimientosUsuario()",
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

module.exports = gestorRutaUsuario; //EXPORTAR FUNCIONES AL ROUTER

/** DATOS PARA USUARIOS y OPERARIOS

TRUNCATE usuario;

CALL agregarNuevoUsuario('000000000', SHA1('0000'), 'Luis', 'Lopez', 'Rosas', 2, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('974571746', SHA1('0000'), 'Jorge', 'Muñiz', 'Velasquez', 2, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('972726248', SHA1('0000'), 'Freddy', 'Villa', 'Gutierrez', 1, '00000000000000000000000000000001');

CALL agregarNuevoUsuario('900000001', SHA1('9000'), 'Alejandro', 'Sallo', 'Quispe', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('900000002', SHA1('9000'), 'Benigno', 'Herrera', '', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('979408062', SHA1('9000'), 'Crisostomo','Escalante', 'Muñoz', 0,'00000000000000000000000000000001');
CALL agregarNuevoUsuario('958240620', SHA1('9000'), 'David','Tupayachi', 'Mar', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('974356382', SHA1('9000'), 'Dionicio','Cueva', 'Huarancca', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('900000006', SHA1('9000'), 'Eliseo', 'Jara', 'Auqui', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('982000190', SHA1('9000'), 'Erasmo', 'Amaut', 'Callañaupa', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('957211958', SHA1('9000'), 'Esteban','Huilca','Lonconi', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('900000009', SHA1('9000'), 'Fransisco','Seño','', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('991642585', SHA1('9000'), 'Genaro', 'Gomez', 'Cruz', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('993665064', SHA1('9000'), 'Gustavo', 'Quispe', 'Mora', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('915057955', SHA1('9000'), 'Hernan', 'Lozano', 'Huamañahui', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('900000013', SHA1('9000'), 'Humberto', 'Huaman', 'Cahua', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('931559194', SHA1('9000'), 'Huwerth', 'Bustamante', 'Puelles', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('900000015', SHA1('9000'), 'Javier', 'Bueno', 'Cordova', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('900000016', SHA1('9000'), 'Juan', 'Aguilar', 'Vilca', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('960490596', SHA1('9000'), 'Julio', 'Hancco', 'Pilco', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('958212315', SHA1('9000'), 'Julio', 'Perez', 'Mamani', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('900000019', SHA1('9000'), 'Juvenal', 'Chavez', 'B', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('900000020', SHA1('9000'), 'Marcial', 'Paucar', '', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('994717447', SHA1('9000'), 'Martin', 'Pfuño', 'Choque', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('900000021', SHA1('9000'), 'Mateo', 'Quispe', 'Cochan', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('997144093', SHA1('9000'), 'Pablo', 'Valdivia', 'Alvares', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('987792568', SHA1('9000'), 'Ronal', 'Sapana', 'Condori', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('974219000', SHA1('9000'), 'Ruben', 'Sumayta', 'Vargas', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('940861570', SHA1('9000'), 'Ruben', 'Choque', 'Luque', 0, '00000000000000000000000000000001');
CALL agregarNuevoUsuario('900000027', SHA1('9000'), 'Salvador', 'Valenzuela','', 0, '00000000000000000000000000000001');
*/
