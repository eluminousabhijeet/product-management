const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const path = require('path');

// Bring in the database object
const config = require('./config/database');

// Mongodb Config
mongoose.set('useCreateIndex', true);

// Connect with the database
mongoose.connect(config.database, {
        useNewUrlParser: true
    })
    .then(() => {
        console.log("Databse connected successfully...");
    }).catch(err => {
        console.log(err);
    });

// Initialize the app
const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Defining the PORT
const PORT = process.env.PORT || 5000;

// Defining the Middlewares
app.use(cors());

// Set the static folder
app.use(express.static(path.join(__dirname, 'public')));

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  limit: "50mb",
  parameterLimit: 100000,
  extended: true
}));
app.use(bodyParser.json({limit: "50mb", extended: true}));
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req, res) => {
    return res.json({
        message: "Welcome to my app"
    });
});

// Create a custom middleware function
const checkUserType = function (req, res, next) {
    const userType = req.originalUrl.split('/')[1];
    // Bring in the passport authentication starategy
    require('./config/passport')(userType, passport);
    next();
};

app.use(checkUserType);

// Bring in the user routes
const usersRoute = require('./routes/users');
app.use('/user', usersRoute);

const adminRoute = require('./routes/admin');
app.use('/admin', adminRoute);

const productRoute = require('./routes/products');
app.use('/products', productRoute);


app.listen(PORT, () => {
    console.log("Server started on port " + PORT);
});