const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../modelos/usuario');
const Producto = require('../modelos/producto');
const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());

app.post('/upload/:tipo/:id', (req, res) => {
    let tipo = req.params.tipo;
    let id = req.params.id;

    //Validar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: `${tipo} no es un tipo válido`,
                tipos: 'Tipos validos: ' + tiposValidos.join(', ')
            }
        });
    }

    if (Object.keys(req.files).length == 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        });
    }

    // The name of the input field (i.e. "archivo") is used to retrieve the uploaded file
    let archivo = req.files.archivo;

    //Validar archivo
    let extensionesValidas = ['png', 'bmp', 'jpg', 'jpeg', 'gif'];
    let nombreArchivo = archivo.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length - 1];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones válidas son: ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    //Nombre del archivo para guardar
    let nombreGuardar = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreGuardar}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (tipo === 'usuarios') {
            cambiarImagenUsuario(id, res, nombreGuardar);
        } else if (tipo === 'productos') {
            cambiarImagenProducto(id, res, nombreGuardar);
        }



        /*
        res.json({
            ok: true,
            message: 'Archivo subido correctamente'
        });*/
    });
});

function cambiarImagenUsuario(id, res, nombreGuardar) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            //Hay que borrar la imagen subida si hay un error
            borrarImagen('usuarios', nombreGuardar);

            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            //Hay que borrar la imagen subida si no se asocia a un usuario
            borrarImagen('usuarios', nombreGuardar);

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        //Borrar imagen anterior (si existe)
        borrarImagen('usuarios', usuarioDB.img)

        //Guardar nuevo nombre de imagen
        usuarioDB.img = nombreGuardar;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado
            });
        })

    });
}

function cambiarImagenProducto(id, res, nombreGuardar) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            //Hay que borrar la imagen subida si hay un error
            borrarImagen('productos', nombreGuardar);

            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            //Hay que borrar la imagen subida si no se asocia a un producto
            borrarImagen('productos', nombreGuardar);

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        //Borrar imagen anterior (si existe)
        borrarImagen('productos', productoDB.img)

        //Guardar nuevo nombre de imagen
        productoDB.img = nombreGuardar;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado
            });
        })

    });
}


//Borrar imagen anterior (si existe)
function borrarImagen(tipo, nombre) {
    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${nombre}`);
    console.log(pathImg);
    if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg);
    }
}

module.exports = app;