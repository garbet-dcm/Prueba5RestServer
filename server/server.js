require('./config/config');

const express = require('express')
const app = express()

const bodyParser = require('body-parser')
    // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())




app.get('/usuario', function(req, res) {
    res.json('GET Usuario')
})

//Los parametros que enviamos son nombre y edad. Si nombre o edad no se envía se envía nuevo estatus
//Utilizar en postman Body --> Protocolo x-www-form-urlencoded
//HTTP/1.1 Status Codes están estandarizados
app.post('/usuario', function(req, res) {
    let body = req.body;

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
})

//localhost:3000/usuario/lo_que_sea_que_ponga (En postman pondra un objeto con lo_que_sea_que_ponga)
app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    res.json({ id })
})

app.delete('/usuario', function(req, res) {
    res.json('DELETE Usuario')
})

app.listen(process.env.PORT, () => console.log(`Escuchando puerto ${process.env.PORT}`))