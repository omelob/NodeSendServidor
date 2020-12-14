// solucion

exports.checkPassword = async (req, res, next) => {
    try {
        const link = await Link.findOne({ url: req.params.url });
    
        if (!link) {
            return res.status(404).json({
            msg: "Not found",
            });
        }
    
        if (link.password) {
            return res.json({
            file: link.name, // <- retornar el archivo
            url: link.url,
            isFilePassword: true,
            });
        }
    
        next();
        } catch (error) {
        console.log(error);
        }
};

//Antes
// retorna si el enlace tiene o no password
exports.tienePassword = async (req, res, next) => {
    //primero miramos si tiene un enlace
    const { url } = req.params;

    //console.log(url);

    // verificar si existe el enlace
    const enlace = await Enlaces.findOne({url});
    
    if (!enlace) {
        res.status(404).json({msg: 'Este enlace no existe'});
        return next();
    }

    // miramos si tiene psw
    if (enlace.password) {
        return res.json({password: true, enlace: enlace.url});
    }

    next();
}