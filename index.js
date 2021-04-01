const express = require('express'),
    morgan = require('morgan'),
    app = express(),
    Config = require('./config'),
    passport = require('passport'),
    cors = require('cors'),
    // { check, validationResult } = require('express-validator'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    Movies = Models.Movie,
    Users = Models.User;

let allowedOrigins = ['http://localhost:8080', 'https://boemyflix.herokuapp.com/'];

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(morgan('common'));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something is broken');
});

let auth = require('./auth')(app);
require('./passport');
mongoose.connect(Config.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true})
.then(res => console.log('successful db connect'))
.catch(e => console.error('db connection failed'));

// GET Requests
app.get('/', (req, res) => {
    res.status(200).send('Welcome to the myFlix API!');
});

app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

// app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
//     Movies.findOne({Title: req.params.Title})
//         .then((movies) => {
//             res.status(200).json(movies);
//         })
//         .catch((err) => {
//             console.error(err);
//             res.status(500).send('Error ' + err);
//         });
// });

// app.get('/movies/genres/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
//     Movies.findOne({'Genre.Name': req.params.Title}, 'Genre')
//         .then((genre) => {
//             res.status(200).json(genre);
//         })
//         .catch((err) => {
//             console.error(err);
//             res.status(500).send('Error ' + err);
//         });
// });

// app.get('/movies/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
//     Movies.findOne({'Director.Name': req.params.Name}, 'Director')
//         .then((director) => {
//             res.status(200).json(director);
//         })
//         .catch((err) => {
//             console.error(err);
//             res.status(500).send('Error ' + err);
//         });
// });

// app.get('/users', (req, res) => {
//     Users.find()
//         .then((users) => {
//             res.status(200).json(users);
//         })
//         .catch((err) => {
//             console.error(err);
//             res.status(500).send('Error: ' + err);
//         });
// });

// app.post('/users', [
//     check('Username', 'Username is required').isLength({min: 5}),
//     check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
//     check('Password', 'Password is required').not().isEmpty(),
//     check('Email', 'Email does not appear to be valid').isEmail()
//     ], (req, res) => {
//     let errors = validationResult(req);
    
//     if (!errors.isEmpty()) {
//         return res.status(422).json({ errors: errors.array()});
//     }

//     let hashedPassword = Users.hashedPassword(req.body.Password);
//     Users.findOne({ Username: req.body.Username })
//         .then((user) => {
//             if (user) {
//                 return res.status(400).send(req.body.Username + ' already exists.');
//             } else {
//                 Users
//                     .create({
//                         Username: req.body.Username,
//                         Password: hashedPassword,
//                         Email: req.body.Email,
//                         Birthday: req.body.Birthday
//                     })
//                     .then((user) => {res.status(201).json(user) })
//                 .catch((error) => {
//                     console.error(error);
//                     res.status(500).send('Error: ' + error);
//                 })
//             }
//         })
//         .catch((error) => {
//             console.error(error);
//             res.status(500).send('Error: ' + error);
//         });
// });

// app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
//     Users.findOne({Username: req.params.Username})
//         .then((user) => {
//             res.status(200).json(user);
//         })
//         .catch((error) => {
//             console.error(error);
//             res.status(500).send('Error: ' + error);
//         });
// });

// app.put('/users/:Username' , passport.authenticate('jwt', { session: false }), (req, res) => {
//     Users.findOneAndUpdate({Username: req.params.Username},
//         {
//             $set:
//             {
//                 Username: req.body.Username,
//                 Password: req.body.Password,
//                 Email: req.body.Email,
//                 Birthday: req.body.Birthday
//             }
//         },
//         { new: true})
//         .then((updateUser) => {
//             res.status(201).json(updateUser);
//         })
//         .catch((error) => {
//             console.error(error);
//             res.status(500).send('Error: ' + error);
//         });
// });

// app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
//     Users.findOneAndUpdate({Username: req.params.Username},
//         {
//             $push: {FavoriteMovies: req.params.MovieID}
//         },
//         {new: true},
//         (err, updateUser) => {
//             if (err) {
//                 console.error(err);
//                 res.status(500).send('Error ' + err);
//             } else {
//                 res.json(updateUser);
//             }
//         });
// });

// app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
//     Users.findOneAndUpdate({Username: req.params.Username},
//         {
//             $pull: { FavoriteMovies: req.params.MovieID}
//         })
//         .then(() => {
//             res.status(200).send(req.params.MovieID + 'was successfully deleted from ' + req.params.Username + '\'s list of favorite movies.');
//         })
//         .catch((err) => {
//             console.error(err);
//             res.status(500).send('Error: ' + err);
//         });
// });

// app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
//     Users.findOneAndRemove({ Username: req.params.Username})
//         .then((user) => {
//             if (!user) {
//                 res.status(400).send(req.params.Username + ' was not found');
//             } else {
//                 res.status(200).send(req.params.Username + ' was deleted.');
//             }
//         })
//         .catch((err) => {
//             console.error(err);
//             res.status(500).send('Error: ' + err);
//         });
// });

// Listens for requests
app.listen(Config.PORT, '0.0.0.0', () => {
    console.log('Listening on Port ' + Config.PORT);
});

// mongoose.connect(Config.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true});

// cors inner {
//     origin: (origin, callback) => {
//         if(!origin) return callback(null, true);
//         if(allowedOrigins.indexOf(origin) === -1) {
//             let message = "The CORS policy for this application doesn't allow access from origin " + origin;
//             return callback(new Error(message ), false);
//         }
//         return callback(null, true);
//     }
// }