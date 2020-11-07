const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');

const storage = multer.diskStorage({ //where to store
    destination: (req, file, cb) => { //cb -> callback
        cb(null, 'public/images'); //null = no error -> file location
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname) //null -> no error -> file.originalname will have same name when put it otherwise will give random name.
    }
}); //adding custom values

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false); //false -> reject upload
    }
    cb(null, true); //true -> accept
}; //checking to see if a file is in specific forms -> img

const upload = multer({ storage: storage, fileFilter: imageFileFilter}); //setting up our custom things

const uploadRouter = express.Router(); //creating router

uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter; //exporting