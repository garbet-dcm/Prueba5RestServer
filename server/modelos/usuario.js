const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//DEFINICION DE UN MODELO: Se crea un esquema
let Schema = mongoose.Schema;

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        required: [true, 'El email es necesario'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'El usuario es necesario']
    },
    img: {
        type: String,
        required: false
    },
    rol: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    },
});

//El método toJSON siempre se intenta llamar cuando se va a imprimir, 
//por eso aqui es donde se modifica el usuario para que no aparezca el campo de password
//Se tiene que utilizar function porque se usa .this
usuarioSchema.methods.toJSON = function() {
    let usuario = this;
    let usuarioObjeto = usuario.toObject();
    delete usuarioObjeto.password;
    return usuarioObjeto;
}
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);