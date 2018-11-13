require('./config/config');

const colors = require('colors');

const express = require('express')
const app = express()

const mongoose = require('mongoose');

const path = require('path');

const bodyParser = require('body-parser')
    // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())

//Configuracion global de rutas
app.use(require('./rutas'));

//Hacer pública la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));
console.log(path.resolve(__dirname, '../public'));

//27017 es el puerto de mongoDB y cafe el nombre de la base que he creado
mongoose.connect(process.env.urlDB, (error, res) => {
    if (error) throw error;
    console.log('Base de datos ONLINE'.green)
});

app.listen(process.env.PORT, () => console.log(`Escuchando puerto ${process.env.PORT}`.yellow))