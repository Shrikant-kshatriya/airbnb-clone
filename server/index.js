const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const imageDownloader = require('image-downloader');
const cookieParser = require('cookie-parser');
const { default: mongoose } = require('mongoose');
const Place = require('./models/place.js');
const User = require('./models/User.js');
const Booking = require('./models/booking.js')
const multer = require('multer')
const fs = require('fs');

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'sdgiudaigvnadviuv';

dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'))
app.use(cors(
    {
        credentials: true,
        origin: ['http://127.0.0.1:5173', 'https://airbnb-client-l9yr.onrender.com']
    }
));

mongoose.connect(process.env.MONGODB_URL);

app.get('/', (req, res) => {
    res.json('OK');
});

app.post('/register', async (req, res) => {
    const {name,email,password} = req.body;
    try {
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt)
        });
        res.json(userDoc);
        
    } catch (error) {
        res.status(422).json(error);
    }

});

app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    const userDoc = await User.findOne({email:email});
    if(userDoc){
        const passOK = bcrypt.compareSync(password, userDoc.password);
        if(passOK){
            jwt.sign({
                email: userDoc.email,
                id: userDoc._id,
            },jwtSecret,{}, (err, token) => {
                if(err) throw err;
                res.cookie('token', token).json(userDoc);
            });
        }
        else{
            res.status(422).json('passNotOK')
        }
    }else {
        res.json('not found')
    }
});

app.get('/profile', (req, res) => {
    const {token} = req.cookies;
    if(token){
        jwt.verify(token, jwtSecret, {},async (err, userData) => {
            if(err) throw err;
            const user = await User.findById
            (userData.id, 'name email _id');
            res.json(user);
        })
    }else {
        res.json(null);
    }
});

app.post('/logout', (req, res) => {
    res.cookie('token','').json(true);
});

app.post('/upload-by-link', async (req, res) => {
    const {link} = req.body;
    const newName = 'Photo' + Date.now() + '.jpg';
    await imageDownloader.image({
        url: link,
        dest: __dirname + '/uploads/' +newName,
    });
    res.json(newName);
});

const photosMiddleware = multer({dest:'uploads'});
app.post('/upload',photosMiddleware.array('photos', 100), (req, res) => {
    const uploadedFiles = [];
    for(let i = 0; i < req.files.length; i++){
        const {path, originalname} = req.files[i];
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath)
        uploadedFiles.push(newPath.replace('uploads\\', ''));
    }
    res.json(uploadedFiles); 
});

app.post('/places', (req, res) => {
    const {token} = req.cookies;
    const {
        title, address, addedPhotos, desc,
        perks, extraInfo, checkIn,
        checkOut, maxGuest, price } = req.body;
    jwt.verify(token, jwtSecret, {},async (err, userData) => {
        if(err) throw err;
        const placeDoc = await Place.create({
            owner: userData.id,
            title, 
            address, 
            photos: addedPhotos,
            desc,
            perks,
            extraInfo,
            checkIn,
            checkOut, 
            maxGuest,
            price,
        });
        res.json(placeDoc);

    })
});

app.put('/places', async (req, res) => {
    const {token} = req.cookies;
    const {
        id, title, address, addedPhotos, desc,
        perks, extraInfo, checkIn,
        checkOut, maxGuest, price } = req.body;
    jwt.verify(token, jwtSecret, {},async (err, userData) => {
        if(err) throw err;
        const placeDoc = await Place.findById(id);
        if(userData.id === placeDoc.owner.toString()){
            placeDoc.set({
                title, 
                address, 
                photos: addedPhotos,
                desc,
                perks,
                extraInfo,
                checkIn,
                checkOut, 
                maxGuest,
                price,
            });
            await placeDoc.save();
            res.json('ok');
        }
    });
});

app.get('/user-places', (req, res) => {
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {},async (err, userData) => {
        if(err) throw err;
        const {id} = userData;
        res.json(await Place.find({owner: id}));
    });
});


app.get('/places/:id', async (req, res) => {
    const {id} = req.params;
    res.json(await Place.findById(id));
});

// getting all places
app.get('/places', async (req, res) => {
    res.json(await Place.find());
});

app.post('/bookings', async (req, res) => {
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {},async (err, userData) => {
        if(err) throw err;
        const {id} = userData;
        const {place,checkIn,checkOut,
            numberOfGuest,name,phone,price} = req.body;
        const bookingDoc = await Booking.create({
            place,
            user: id,
            checkIn,
            checkOut,
            numberOfGuest,
            name,
            phone,
            price
        });
        res.json(bookingDoc);
        
    });
});

app.get('/bookings', (req, res) => {
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {},async (err, userData) => {
        if(err) throw err;
        const {id} = userData;
        res.json(await Booking.find({user: id}).populate('place'));
    });
});

app.listen(3000);