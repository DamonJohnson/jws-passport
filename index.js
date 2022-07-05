if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')

const initializePassport = require("./passport-config")
initializePassport(
  passport,
  (username) => users.find((user) => user.username === username),
  (id) => users.find((user) => user.id === id)
)


const app = express()
app.use(express.json())

const port = 4000


const users = []

// Setting View Engine
app.set('view-engine', 'ejs')
// Allows application to access form data in req variable
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({ 
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.session())



// Routes
app.get('/', (req, res) => {
    res.render('index.ejs')
})

app.get("/login", (req, res) => {
  res.render("login.ejs")
})

app.post("/login", passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get("/register", (req, res) => {
    res.render("register.ejs")
})


app.post("/register", async (req, res) => {
  try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),// this will autogen on mongo
            username: req.body.username,
            password: hashedPassword
        })
      res.redirect('/login')
    } catch {
      res.redirect('/register')
  }
})







app.listen(port, () => console.log(`App running at http://localhost:${port}`))

