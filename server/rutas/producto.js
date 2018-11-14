const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autentificacion');
const Producto = require('../modelos/producto');


//Obtener productos
app.get('/producto', verificaToken, (req, res) => {
    let desde = Number(req.query.desde) || 0;
    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5) //Ponemos un límite estatico
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        });
});


//Obtener producto por id
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'El id no es válido'
                    }
                });
            }
            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    let regexp = new RegExp(termino, 'i'); //'i': implica que en insensible a mayusculas y minusculas

    Producto.find({ nombre: regexp })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        });
});


//Crear producto
app.post('/producto', verificaToken, (req, res) => {
    let body = req.body;
    let producto = new Producto({
        usuario: req.usuario._id, //Datos de verificaToken

        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((err, productoDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });
});


//Actualizar producto
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado en la base de datos'
                }
            });
        }

        //Por hacerlo de otra manera en vez de .findByIdAndUpdate, 
        //primero lo encontramos y si existe se actualiza
        //Es mejor la otra manera
        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto: productoGuardado
            });
        })
    });
});


//Borrar producto (solo debería decir que no esta disponible)
app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoBorrado) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El id no es válido'
                }
            });
        }
        res.json({
            ok: true,
            producto: productoBorrado,
            message: 'Producto borrado'
        });
    });
});

module.exports = app;