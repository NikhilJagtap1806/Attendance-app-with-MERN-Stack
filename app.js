const mongoose = require("mongoose");
const express = require("express");
const session = require('express-session');
const bcrypt = require('bcrypt');
// const database=require('./database')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Import the User model
const User = require('./models/user');

const app = express();
const port = 3000;


app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// Use session for authentication
app.use(session({
    secret: 'Nikhil1806',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
//connecting to the database


mongoose.connect('mongodb://localhost:27017/Attendance_App', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});






//routes rendering 
passport.use(
    new LocalStrategy((username, password, done) => {
      // Implement your user authentication logic here
      // Example: Check if the user exists in your database
      const user = { id: 1, username: 'admin', password: 'admin' };
  
      if (username === user.username && password === user.password) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid username or password' });
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser((id, done) => {
    // Retrieve user from your database
    const user = { id: 1, username: 'admin' };
    done(null, user);
  });
  

app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});
app.get('/signup', (req, res) => {
    res.render('signup')
})
// { pageTitle: 'Signup|Attendance App' }
app.get('/login', (req, res) => {
    res.render('login');
})



// Signup route
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Hash the password before saving it
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

// Login route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            // Store user information in the session
            req.session.user = {
                id: user._id,
                username: user.username,
                email: user.email
            };

            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});

// app.post(
//     '/login',
//     passport.authenticate('local', {
//       successRedirect: '/',
//       failureRedirect: '/login',
//       failureFlash: true,
//     })
//   );
  
// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});






//rendering through express js 




app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})