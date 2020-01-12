const express = require('express');
const jwt = require('jsonwebtoken');
const _ = require('underscore');
let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
let app = express();

let Categoria = require('../models/categoria');

// Get All
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({ })
    .sort('descripcion')
    .populate('usuario', 'nombre email')
    //.populate('producto', 'nombre descripcion')
    .exec( (err, categorias) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        Categoria.countDocuments({ }, (err, conteo) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                categorias,
                cuantos: conteo
            });
        })
   });
});

// Get by ID
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Categoria.findById({ _id: id } )
    .sort('descripcion')
    .populate('usuario', 'nombre email')
    .exec( (err, categorias) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        Categoria.countDocuments({ _id: id }, (err, conteo) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                categorias,
                cuantos: conteo
            });
        })
   });
});

// Create
app.post('/categoria/', verificaToken, (req, res) => {
    let body = req.body;
    
    let categoria= new Categoria({
          descripcion: body.descripcion,
          usuario: req.usuario._id
      });  

      categoria.save((err, categoriaDB) => {
          if (err) {
              return res.status(400).json({
                  ok: false,
                  err
              });
          }
          
          return res.status(201).json({
              ok: true,
              categoriaDB
          });
      });
});

// Update
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = _.pick( req.body, ['descripcion']);

      Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
          res.json({
              ok: true,
              categoria: categoriaDB
          });
      });

});

// Delete
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if ( !categoriaBorrado ) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Categoria no encontrada'
                    }
                });
            }

            res.json({
                  ok: true,
                  categoria: categoriaBorrado
              });
        })
});


module.exports = app;
