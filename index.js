require('dotenv').config()
const express = require('express')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const app = express()
app.use(express.json())

const port = 4000


// Temp Data
const submissions = [
    {
        id: 1,
        user_id: 1,
        isCorrect: true

    },
    {
        id: 2,
        user_id: 2,
        isCorrect: false
    }
]


const users = [
  {
    username: "Adam",
    password: "12345",
  },
  {
    username: "Brett",
    password: "abcde",
  }
]



// User Routes
app.get('/users', (req, res) => {
    res.json(users)
})


app.post("/users", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = { username: req.body.username, password: hashedPassword }
        users.push(user)
        res.status(201).send(user)
  } catch {
        res.status(500).send()
    }
})


// Login Route
app.post("/users/login", async (req, res) => {
  const user = users.find((user) => user.username === req.body.username)
  if (user == null) {
    return res.status(400).send("Cannot find user")
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
        const user = { username: req.body.username, password: req.body.password }
        // serialising user with a secret key stored in .env
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
        // generates an access token with the user information stored in side of it
        res.json({ accessToken: accessToken })
    } else {
      res.send("Incorrect password or username")
    }
  } catch {
    res.status(500).send()
  }
})


// Submission Routes
app.get('/submissions', authenticateToken, (req, res) => {
  res.json(submissions)
})

app.post("/submissions", authenticateToken, (req, res) => {
  const submission = {
    problemId: req.body.problemId,
    userId: req.body.userI,
    isCorrect: req.body.isCorrect,
  }
  submissions.push(submission)
  res.status(201).send(submission)
})


// Middleware
function authenticateToken(req, res, nex) {
  // Token comes from authorisation header
    const authHeader = req.headers["authorization"] //Bearer TOKEN
    // Extracting TOKEN from Bearer TOKEN
    const token = authHeader && authHeader.split(" ")[1] 
    if (token == null) return res.sendStatus(401)
 

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        // At this point we know our user is valid
        req.user = user
        // Move on from middleware
        next()
    })
}


app.listen(port, () => console.log(`App running at http://localhost:${port}`))

