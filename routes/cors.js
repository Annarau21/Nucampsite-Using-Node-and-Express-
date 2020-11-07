const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) !== -1) { //find index of header -> 'Origin' -1 -> not found
        corsOptions = { origin: true }; //req accepted
    } else {
        corsOptions = { origin: false }; // not accepted
    }
    callback(null, corsOptions); //no error and object
};

exports.cors = cors(); //return middleware with header, cores of all origins?
exports.corsWithOptions = cors(corsOptionsDelegate); //connect to the whitelist