const Enlaces = require('../models/Enlace');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

exports.nuevoEnlace = async (req, res, next) => {

    // revisar si hay errores
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()});
    }
    //console.log(req.body);
    // crear un objeto de Enlace
    const { nombre_original, nombre } = req.body;

    const enlace = new Enlaces();
    enlace.url = shortid.generate();
    enlace.nombre = nombre;
    enlace.nombre_original = nombre_original;
    //enlace.password = password;

    // si el usuario esta autenticado
    if(req.usuario){
        const { password, descargas } = req.body;

        // asignar a enlace el numero de descargas
        if(descargas){
            enlace.descargas = descargas;
        }

        // asignar un password + hash
        if(password){
            const salt = await bcrypt.genSalt(10);
            enlace.password = await bcrypt.hash( password, salt );
        }

        // asignar el autor
        enlace.autor = req.usuario.id;
    };
    
    // almacenar en la db
    try {
        await enlace.save();
        return res.json({ msg: `${enlace.url}`});
        next();
    } catch (error) {
        console.log(error);
    }
}

// obtiene un listado de todos los enlaces
exports.todosEnlaces = async (req, res) => {
    try {
        const enlaces = await Enlaces.find({}).select('url -_id');
        res.json({enlaces});
    } catch (error) {
        console.log(error);
    }
}

// retorna si el enlace tiene o no password
exports.tienePassword = async (req, res, next) => {
    //primero miramos si tiene un enlace
    try {
            // verificar si existe el enlace
        const enlace = await Enlaces.findOne({url: req.params.url });
        
        if (!enlace) {
            return res.status(404).json({msg: 'Este enlace no existe'});
        }

        // miramos si tiene psw
        if (enlace.password) {
            return res.json({
                archivo: enlace.nombre,
                password: true, 
                enlace: enlace.url
            });
        }

        next();
    } catch (error) {
        console.log(error);
    }    
};

// verifica si el password es correcto
exports.verificarPassword = async (req, res, next) => {
    const { url } = req.params;
    const { password } = req.body;

    // consultar por enlace
    const enlace = await Enlaces.findOne({url});

    // verificar el psw
    if(bcrypt.compareSync( password, enlace.password)){
        // permite al usuario descargar el archivo
        next();
    }else{
        return res.status(401).json({msg: 'Password Incorrecto'})
    }
    
}

// obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {
    //console.log(req.params.url);
    const { url } = req.params;

    //console.log(url);

    // verificar si existe el enlace
    const enlace = await Enlaces.findOne({url});
    console.log(enlace);
    if (!enlace) {
        res.status(404).json({msg: 'Este enlace no existe'});
        return next();
    }
    
    // si el enlace existe
    res.json({archivo: enlace.nombre, password: false});

    next();
    
}