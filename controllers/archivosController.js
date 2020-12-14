const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const Enlaces = require('../models/Enlace');


exports.subirArchivo = async (req, res, next) => {

    const configuracionMulter = {
        limits : { fileSize : req.usuario ? 1024*1024*10 : 1024*1024},
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, __dirname+'/../uploads')
            },
            filename: (req, file, cb) => {
                //const extension = file.mimetype.split('/')[1];
                const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                cb(null, `${shortid.generate()}${extension}`);
            }        
        })
    }
    
    const upload = multer(configuracionMulter).single('archivo');

    upload(req, res, async (error) => {
        console.log(req.file);

        if (!error) {
            res.json({archivo: req.file.filename});
        } else {
            console.log(error);
            return next();
        }
    });
}

    
    


exports.eliminarArchivo = async (req, res) => {
    console.log(req.archivo);

    try {
        fs.unlinkSync(__dirname+`/../uploads/${req.archivo}`);
        console.log('Archivo eliminado');
    } catch (error) {
        console.log(error);
    }
}

// descarga un archivo
exports.descargar = async (req, res, next) => {

    // obtiene el enlace
    const { archivo } = req.params;
    const enlace = await Enlaces.findOne({ nombre: archivo});

    const archivoDescarga = __dirname + '/../uploads/' + archivo;

    res.download(archivoDescarga);
    

    // eliminar el archivo y la entrada a la db
    // si las descargas son iguales a 1 => borrar la entrada y borrar el archivo
    const { descargas, nombre } = enlace;

    if (descargas === 1) {
        
        // eliminar el archivo
        req.archivo = nombre;
        
        // eliminar el valor de la entrada de la db
        await Enlaces.findOneAndRemove(enlace.id);

        next(); // pasa al siguiente Controller como fue declarado en enlaces.js
    } else {
        // si las descargas son >1 => restar 1 por cada descarga
        enlace.descargas--;
        await enlace.save();
    }

}