const express = require('express'),
    morgan = require('morgan'),
    app = express(),
    Config = require('./config'),
    passport = require('passport'),
    cors = require('cors'),
    { check, validationResult } = require('express-validator'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    Movies = Models.Movie,
    Users = Models.User;

// let allowedOrigins = ['http://localhost:8080', 'https://boemyflix.herokuapp.com/', 'http://localhost:1234', 'https://myflix-action.netlify.app/'];

// app.use(cors({
//     origin: (origin, callback) => {
//         if(!origin) return callback(null, true);
//         if(allowedOrigins.indexOf(origin) === -1) {
//             let message = "The CORS policy for this application doesn't allow access from origin " + origin;
//             return callback(new Error(message ), false);
//         }
//         return callback(null, true);
//     }
// }));
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

/**
 * GET request - loads home page
 */
app.get('/', (req, res) => {
    res.status(200).send('Welcome to the myFlix API!');
});

/**
 * GET request for ALL movies
 * @param {string} Title - title of the movie
 * @param {string} Description - description of the movie 
 * Object holding data about all movies. 
 * @returns {array} - Returns array of movie objects.
 */
app.get('/movies', (req, res) => {
    passport.authenticate('jwt', { session: false })
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

/**
 * GET request for a specific movie, shows a movie card with title, description, genre and director
 * @param {string} Title - title of the movie
 * @param {string} Description - description of the movie 
 * @param {string} Director.Name - director of the movie
 * @param {string} Genre.Name - name of the genre of the movie 
 * @returns {object} - Returns a movie object.
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({Title: req.params.Title})
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

/**
 * GET request for a genre, shows a genre card with name and description
 * @param {string} Genre.Name - genre's name
 * @param {string} Genre.Description - genre's description
 * @returns {object} - Returns a genre object.
 */
app.get('/movies/genres/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({'Genre.Name': req.params.Title}, 'Genre')
        .then((genre) => {
            res.status(200).json(genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

/**
 * GET request for a director, shows a director card with name, bio, death and birth
 * @param {string} Director.Name - director's name
 * @param {string} Director.Bio - director's bio
 * @param {date} Director.Birth - director's year of birth
 * @param {date} Director.Death - director's year of death
 * @returns {object} - Returns a director object.
 */
app.get('/movies/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({'Director.Name': req.params.Name}, 'Director')
        .then((director) => {
            res.status(200).json(director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        });
});

app.get('/users', (req, res) => {
    Users.find()
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * Post request for users, used for registration of new users
 * @param {string} UserName 
 * @param {string} Password
 * @param {string} Email
 * @param {date} Birthday
 * @returns {Object} Returns a user object.
 */
app.post('/users', [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {
        console.log('Post Users hit');
    let errors = validationResult(req);
    console.log(errors);
    
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array()});
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists.');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => {res.status(201).json(user) })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

/**
 * GET request for single users data
 * @param {string} UserName 
 * @returns {Object} Returns a user object.
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({Username: req.params.Username})
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

/**
 * PUT request for users, used to update user info
 * @param {string} UserName 
 * @param {string} Password
 * @param {string} Email
 * @param {date} Birthday
 * @returns {Object} Returns a user object.
 */
app.put('/users/:Username' , passport.authenticate('jwt', { session: false }), (req, res) => {

    let object = {};
    if (req.body.Username) {
        object.Username = req.body.Username
    }
    if (req.body.Password) {
        let hashedPassword = Users.hashPassword(req.body.Password);
        object.Password = hashedPassword
    }
    if (req.body.Email) {
        object.Email = req.body.Email
    }
    if (req.body.Birthday) {
        object.Birthday = req.body.Birthday
    }
    Users.findOneAndUpdate({Username: req.params.Username},
        {
            $set: object
        },
        { new: true})
        .then((updateUser) => {
            res.status(201).json(updateUser);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

/**
 * POST request for adding a movie to a user's list of favorites.
 * @param {string} UserName
 * @param {string} MovieID
 * @returns Returns a confirmation message to the console with the updated user object.
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({Username: req.params.Username},
        {
            $push: {FavoriteMovies: req.params.MovieID}
        },
        {new: true},
        (err, updateUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error ' + err);
            } else {
                res.json(updateUser);
            }
        });
});

/**
 * Removes a movie from a user's list of favorites.
 * @param {string} Username
 * @param {String} MovieID
 * @returns Returns a confirmation message with the updated user object. 
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({Username: req.params.Username},
        {
            $pull: { FavoriteMovies: req.params.MovieID}
        })
        .then(() => {
            res.status(200).send(req.params.MovieID + 'was successfully deleted from ' + req.params.Username + '\'s list of favorite movies.');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
* DELETE request that deletes a USER by name
* @param {string} UserName
* @returns Returns a confirmation message.
*/
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username})
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Listens for requests
app.listen(Config.PORT, '0.0.0.0', () => {
    console.log('Listening on Port ' + Config.PORT);
});
