const Config = {
    PORT: process.env.PORT || 8001,
    JWT_SECRET: 'asdf',
    CONNECTION_URI: process.env.CONNECTION_URI || 'mongodb://127.0.0.1:27017/myFlixdb'
}

module.exports = Config