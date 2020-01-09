
// Puerto
process.env.PORT = process.env.PORT || 3000;

// Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Vencimiento del Token
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias
process.env.EXPIRE_TOKEN = 60 * 60 * 24 * 30;

// Seed SECRET KEY
process.env.SEED = process.env.SEED || 'esta-es-mi-secret-key-DESARROLLO';

// Google Client ID
process.env.CLIENT_ID = process.env.CLIENT_ID || '96617404950-rn15g8r8fq4bijr7h3g985bd6ftbck99.apps.googleusercontent.com';

// Database
let urlDB;

if ( process.env.NODE_ENV === 'dev' ) {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;