//Verificar token
const jwt = require('jsonwebtoken');

let verificaToken = (req, res, next) => {
    //Para leer los headers (ponerlo en postman --> get --> header --> token = ...)
    let token = req.get('token');

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: 'Token no válido'
            });
        }
        req.usuario = decoded.data;
        //console.log(decoded); //Muestra el usuario del token enviado
        //Esta funcion es necesaria para qe despues del middleware de app.get... siga la funcion y haga el callback
        next();
    });



};

let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.rol === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            emessage: 'El usuario no es un administrador'
        });
    }
};


module.exports = {
    verificaToken,
    verificaAdmin_Role
};