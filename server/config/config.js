
// Puerto
process.env.PORT = process.env.PORT || 3000;

// Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Database
let urlDB;

if ( process.env.NODE_ENV === 'dev' ) {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://omariot:hKw6ZAVhEXsgQBFP@cafe-f6dvg.mongodb.net/cafe';
}

process.env.URLDB = urlDB;