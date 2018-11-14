const express = require('express');
const app = express();
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autentificacion');
const Categoria = require('../modelos/categoria');

//Muestra todas las categorias
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion') //Para que vengan ordenados alfabeticamente
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            //Error de base de datos
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                categorias
            });
        });
});


//Mostrar categoria por id
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        //Error de base de datos
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //No existe ID en la base de datos
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                message: 'No existe ID en la base de datos'
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


//Crear nueva categoria
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        //Error de base de datos
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //No se crea categoria en la base de datos
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                message: 'No se creo categoría en la base de datos'
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


//Actualiza categoria
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        //Error de base de datos
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //No existe categoria en la base de datos
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                message: 'No existe categoría en la base de datos'
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


//Borra categoria
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                of: false,
                err
            });
        }
        if (!categoriaBorrada) {
            return res.status(400).json({
                of: false,
                err: 'Categoría no encontrada en base de datos'
            });
        }
        res.json({
            ok: true,
            message: 'Categoría borrada'
        });
    });
});


module.exports = app;