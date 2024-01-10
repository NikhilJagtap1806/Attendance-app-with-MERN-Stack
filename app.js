const mongoose = require("mongoose");
const express = require("express");
const session = require('express-session');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Import the User model
// const User = require('./models/user');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Use session for authentication
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


// Connecting to the database
// mongoose.connect('mongodb://127.0.0.1:27017/Attendance_App', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });



passport.use(new LocalStrategy({
    passReqToCallback: true
}, async (req, username, password, done) => {
    const user = await User.findOne({ username });

    if (user) {
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (isPasswordMatch) {
            req.flash('success', 'Successfully logged in!');
            return done(null, user);
        }
    }

    req.flash('error', 'Invalid username or password');
    return done(null, false);
}));


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});


app.post('/login', passport.authenticate('local', { failureFlash: true, }), (req, res) => { if (req.isAuthenticated()) { res.redirect('/'); } else { res.json(req.flash()); } });


// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Rendering through express js
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        console.log(user);

        if (user) {
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            console.log(isPasswordMatch);

            if (isPasswordMatch) {
               

                req.flash('success', 'Successfully logged in!');
                return res.redirect('/');
            }
        }

        req.flash('error', 'Invalid username or password');
        console.log(req.flash('error'));
        res.redirect('/login');
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});


// Signup route
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
