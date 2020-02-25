require('../config/config');

const host = `http://${ process.env.IP }:${ process.env.PORT }`;

module.exports = {
    info: {
      // API informations (required)
        title: 'Rest Server Curso NodeJs API',
        version: '1.0.0',
        description: "Rest Server curso nodejs con Ruben",
    },
    host: host, // Host (optional)
    basePath: '/', // Base path (optional)
  };