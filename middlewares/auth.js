const jwt = require("jwt-simple");
const moment = require("moment");

const library_jwt = require("../services/jwt");
const secret = library_jwt.secret;

exports.auth = (req, res, next) => {
    //comprobar si me llega la cabecera de autenticacion
    if (!req.headers.authorization) {
        return res.status(403).json({
            status: "error",
            mensaje: "la peticion no tiene la cabecera de autenticacion"
        });
    }
    //limpiar token
    let token = req.headers.authorization.replace(/['"]+/g, '');

    //decodificar token
    try {
        let payload = jwt.decode(token, secret);

        //comprobar expiracion del token
        if (payload.exp <= moment().unix()) {
            return res.status(401).json({
                status: "error",
                mensaje: "token expirado"
            });
        }
        //agg datos al req
        req.user = payload;
        
    } catch (err) {
        return res.status(404).json({
            status: "error",
            mensaje: "token invalido",
            error: err.message
        });
    }


    next();
}