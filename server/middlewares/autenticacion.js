const jwt = require('jsonwebtoken');

// Verificar Token
let verificaToken = (req, res, next) => {
    
    let token = req.get('token');
    
    jwt.verify( token, process.env.SEED, (err, decode) => {
        if ( err ) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        req.usuario = decode.usuario;
        next();
    });
    
};

// Verificar Token Url
let verificaTokenUrl = (req, res, next) => {
    let token = req.query.token;
    jwt.verify( token, process.env.SEED, (err, decode) => {
        if ( err ) {
            return res.status(401).json({
                ok: false,
                err
            });
        }

        req.usuario = decode.usuario;
        next();
    });
}

// Verifica ADMIN_ROLE
let verificaAdminRole = (req, res, next) => {
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'Este usuario no es ADMIN'
            }
        });
    }

};

module.exports = {
    verificaToken,
    verificaTokenUrl,
    verificaAdminRole
};