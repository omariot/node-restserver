
const express = require("express");
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const app = express();

/**
 * @swagger 
 * /usuario:
 *  get:
 *      description: Listado de Usuarios
 *      tags: [Usuarios]
 *      produces:
 *          - application/json
 *      parameters:
 *        - name: desde
 *          description: A partir desde estos registros.
 *          in: query
 *          type: Number
 *        - name: limite
 *          description: Limite de registros.
 *          in: query
 *          type: Number
 *        - name: token
 *          description: Token del usuario logueado
 *          type: string
 *      responses:
 *          '200': 
 *              description: A success response.
 */ 
app.get("/usuario", verificaToken, (req, res) => {
    let desde = req.query.desde || 0; 
    desde = Number(desde);

    let limite = req.query.limite || 5; 
    limite = Number(limite);
    Usuario.find({ estado: true } , 'nombre email role google estado img')
            .skip(desde)
            .limit(limite)
            .exec( (err, usuarios) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                Usuario.countDocuments({ estado: true }, (err, conteo) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err
                        });
                    }
                    res.json({
                        ok: true,
                        usuarios,
                        cuantos: conteo
                    });
                });
           });
  });
  
  
  app.post("/usuario", [verificaToken, verificaAdminRole], (req, res) => {
      let body = req.body;
      let usuario= new Usuario({
          nombre: body.nombre,
          email: body.email,
          password: bcrypt.hashSync( body.password, 10),
          role: body.role
      });  

      usuario.save((err, usuarioDB) => {
          if (err) {
              return res.status(400).json({
                  ok: false,
                  err
              });
          }
          
          return res.json({
              ok: true,
              usuarioDB
          });
      });

  });
  
  
  // Actualizar 
  app.put("/usuario/:id", [verificaToken, verificaAdminRole], (req, res) => {
      let id = req.params.id;
      let body = _.pick( req.body, ['nombre', 'email', 'img', 'role', 'estado']);

      Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
          res.json({
              ok: true,
              usuario: usuarioDB
          });
      });


  });
  
  app.delete("/usuario/:id", [verificaToken, verificaAdminRole], (req, res) => {

        let id = req.params.id;

        //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        
        let newEstado = {
            estado: false
        };

        Usuario.findByIdAndUpdate(id, newEstado, { new: true }, (err, usuarioBorrado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if ( !usuarioBorrado ) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario no encontrado'
                    }
                });
            }

            res.json({
                  ok: true,
                  usuario: usuarioBorrado
              });
        });

  });

  module.exports = app;