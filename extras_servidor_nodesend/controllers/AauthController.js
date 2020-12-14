const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config({ path: 'variables.env'});

exports.autenticarUsuario = async (req, res, next) => {

    // revisar si hay errores
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()});
    }

    // buscar el usuario para ver si esta registrado
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    //console.log(usuario);

    if(!usuario){
        res.status(401).json({msg: 'El Usuario no Existe'});
        return next();
    }
    // verificar el psw y autenticar el ususario
    if(bcrypt.compareSync(password, usuario.password)){

        // crear un JWT json web token
        const token = jwt.sign({
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email
        }, process.env.SECRETA, {
            expiresIn: '8h'
        });
        
        res.json({token})

    }else{
        res.status(401).json({msg: "Password Incorrecto"});
        return next();
    }
    
}

exports.usuarioAutenticado = (req, res, next) => {
    //console.log(req.get('Authorization'));
    const authHeader = req.get('Authorization');
    
    if(authHeader){
         // obtener el token
        const token = authHeader.split(' ')[1];
        
         // comprobar el JWT
        try {
            const usuario = jwt.verify(token, process.env.SECRETA);
            res.json({usuario})
        } catch (error) {
            console.log(error);
            console.log('JWT no valido');
        }
    }
    return next();
}