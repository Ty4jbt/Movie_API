# Movie_API

MyFlix is a REST API and server side component for a for a web application that provides users with access to information about different movies, directors, and genres. It also comes with endpoint for registering users.

## Usage
You can use the myFlix REST API to build web applications that:

- Return a list of ALL movies to the user
- Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
- Return data about a genre (description) by name/title (e.g., “21 Jump Street”)
- Return data about a director (bio, birth year, death year) by name
- Allow new users to register
- Allow users to update their user info (username, password, email, date of birth)
- Allow users to add a movie to their list of favorites
- Allow users to remove a movie from their list of favorites
- Allow existing users to deregister

## Tech Stack
The server side code uses MongoDB, Express.js and Node.js to build the REST API. User data ist verified using LocalStrategy and JWTStrategy from Passport.js. Passwords are encrypted using bcrypt.

