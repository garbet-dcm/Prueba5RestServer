const express = require('express')
const app = express()
const Usuario = require('../modelos/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');

app.get('/usuario', function(req, res) {

    //localhost:3000/usuario?desde=10 (desde el el 10 por ejemplo)
    let desde = Number(req.query.desde) || 0;
    //localhost:3000/usuario?limite=5 (desde el el 5 por ejemplo)
    let limite = Number(req.query.limite) || 0;
    //Para usar ambos parámetros
    //localhost:3000/usuario?desde=10&limite=5

    Usuario.find({ estado: true }, 'nombre email rol estado google img') //Esos son los parámetros que muestra get
        .skip(desde) //Para que empiece a partir del 'desde'
        .limit(limite) //Para que solo envíe 'limite' usuarios
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Usuario.count({ estado: true }, (err, count) => {
                res.json({
                    ok: true,
                    usuarios,
                    count
                });
            })
        })
});

//Los parametros que enviamos son nombre y edad. Si nombre o edad no se envía se envía nuevo estatus
//Utilizar en postman Body --> Protocolo x-www-form-urlencoded
//HTTP/1.1 Status Codes están estandarizados
app.post('/usuario', function(req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        //img: body.img,
        rol: body.rol,
        //estado: body.estado,
        //google: body.google
    });

    //Para guardar en la base de datos
    usuario.save((err, usuarioDB) => {
        //Se comprueba si hay error (según los parámetros de usuarioSchema en ../modelos/usuario.js)
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //Si no lo hay, se guarda
        res.json({ //Manda status(200) por defecto
            ok: true,
            usuario: usuarioDB
        });
    });

    /*
    if (body.nombre === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'No enviado el nombre'
        });
    } else if (body.edad === undefined) {
        res.status(400).json({
            ok: false,
            mensaje: 'No enviado la edad'
        });
    } else {
        res.json({ body })
    }
    */
})

//localhost:3000/usuario/lo_que_sea_que_ponga (En postman pondra un objeto con lo_que_sea_que_ponga)
app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'rol', 'estado']);

    //Para eliminar de body lo que se puede hacer desde put, se podría hacer asi
    //delete body.password;
    //delete body.google;
    //Pero vamos a utilizar la librería underscore, cambiando req.body por:
    //let body = _.pick(req.body,['nombre','email','img','rol','estado']);
    //Se selecccionan los que se pueden modificar


    //id del objeto de la base de datos a modificar
    //body, lo que queremos modificar
    //options:
    //  -new: true, para que se muestre el objeto actualizado
    //  -runValidators: Para hacer las validaciones del esquema
    //callback
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

})

app.delete('/usuario/:id', function(req, res) {
    let id = req.params.id;
    /*
    //Borrado permanente
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                of: false,
                err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                of: false,
                err: 'Usuario no encontrado'
            });
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
    */

    //Borrado por cambio de parámetro 'estado'
    Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
})

//Estoy exportando app con todos los datos que he programado
module.exports = app;