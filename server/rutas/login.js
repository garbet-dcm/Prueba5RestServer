const express = require('express')
const app = express()
const Usuario = require('../modelos/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


app.post('/login', (req, res) => {
    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            //500:error de bae de datos
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Comprobación si usuario existe en DB
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '[Usuario] o contraseña incorrectos',
                }
            });
        }

        //Comprobación de contraseña enviada y la guardada en DB
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o [contraseña] incorrectos'
                }
            });
        }

        let token = jwt.sign({
            data: usuarioDB
        }, process.env.SECRET, { expiresIn: process.env.CADUCIDAD_TOKEN });


        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });

});


module.exports = app;