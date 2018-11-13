const express = require('express')
const app = express()
const Usuario = require('../modelos/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
const colors = require('colors');

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

        //Se obtiene el Token en funcion de los datos, secreto y tiempo de caducidad
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

//Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    //Según el objeto usuario que se creo
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true //En los otros post google: false por defecto ya que no se identificaba a través de google
    }

}
//verify().catch(console.error);


app.post('/loginGoogle', async(req, res) => {
    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            });
        });


    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Para evitar que personas ya registradas en la DB lo hagan también a través de google...
        //...se comprueba si existe el usuario y existe...
        if (usuarioDB) {
            console.log('Usuario existente'.red);

            //...si no se registro por google (usuario --> google: false)
            if (!usuarioDB.google) {
                console.log('Usuario no registrado en DB por Google'.red);

                return res.status(400).json({
                    ok: false,
                    message: 'Debe usar su atentificación normal'
                });
            } else { //Usuarioa través de Google
                console.log('Usuario registrado en DB por Google'.red);

                //Se obtiene el Token en funcion de los datos, secreto y tiempo de caducidad
                let token = jwt.sign({
                    data: usuarioDB
                }, process.env.SECRET, { expiresIn: process.env.CADUCIDAD_TOKEN });

                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else { //...y si no existe en la base de datos, se crea
            console.log('Crear usuario en base de datos'.yellow);

            let usuario = new Usuario();
            //PARAMETROS DE verify
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.password = bcrypt.hashSync('No es necesario ya que se accede a través de google', 10);
            usuario.img = googleUser.img;
            usuario.google = true;

            //Para guardar en la base de datos
            usuario.save((err, usuarioDB) => {
                //Se comprueba si hay error (según los parámetros de usuarioSchema en ../modelos/usuario.js)
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                //Se obtiene el Token en funcion de los datos, secreto y tiempo de caducidad
                let token = jwt.sign({
                    data: usuarioDB
                }, process.env.SECRET, { expiresIn: process.env.CADUCIDAD_TOKEN });

                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
});

module.exports = app;