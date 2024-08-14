const express = require('express')
const app = express()
const port = 3001

app.use(express.json())
let USERS = [];
const QUESTIONS = [{
    title: "Two states",
    description: "Given an array , return the maximum of the array?",
    testCases: [{
        input: "[1,2,3,4,5]",
        output: "5"
    }]
}];


const SUBMISSION = []

const loginMiddleware = (req,res , next)=>{
  const { email, password } = req.body
  const userExists = USERS.find(x => x.email === email)
  
  if (!userExists) 
      return res.status(401).json({ "msg": "user id does not exist ! Please sign in first" })

  // If the password is not the same, return back 401 status code to the client
  if (userExists && userExists.password !== password) 
      return res.status(401).send({ "msg": "incorrect password" }).status(401)
  next()
}


app.post('/signup', function (req, res) {
  // Add logic to decode body
  // body should have email and password
  const { email, password, role } = req.body
  const emialExists = USERS.find(x => x.email === email)
  if (emialExists) return res.status(403).json({ msg: "email id already exists" })

  // const adminExists = USERS.find(x => x.role === "ADMIN" || x.role==="admin" || x.role==="Admin")

  const adminExists = USERS.find(x=>x.role.toLowerCase() === "admin")
  if (adminExists) {
      return res.json({ "msg": "admin already exists" }).status(403)
  }
  else if (!email || !password || !role) {
      return res.json({
          "msg": "All fields are mandatory to register"
      })
  }

  //Store email and password (as is for now) in the USERS array above (only if the user with the given email doesnt exist)
  const id = USERS.length + 1
  const newUser = {
      id,
      email,
      password, 
      role,
  }

  USERS.push(newUser)
  res.status(200).send(`${newUser.email} Signed In`)
})


app.post('/login', function (req, res) {
  // Add logic to decode body
  // body should have email and password
  const { email, password } = req.body

  // Check if the user with the given email exists in the USERS array
  // Also ensure that the password is the same
  const userExists = USERS.find(x => x.email === email)
  if (!userExists) res.json({ "msg": "user id does not exist ! Please sign in first" })


  // If the password is the same, return back 200 status code to the client
  // Also send back a token (any random string will do for now)
  else if (userExists && userExists.password === password) res.json({ token: `logintoken12345!@#$%` }).status(200)

  // If the password is not the same, return back 401 status code to the client
  if (userExists && userExists.password !== password) res.send({ "msg": "incorrect password" }).status(401)
})


app.get('/questions', function (req, res) {
  //return the user all the questions in the QUESTIONS array
  res.send(QUESTIONS)
})

app.get("/submissions", function (req, res) {
  // return the users submissions for this problem
  res.send(SUBMISSION)
});

app.post("/submissions", function (req, res) {
  // let the user submit a problem, randomly accept or reject the solution
  // Store the submission in the SUBMISSION array above
  if (Math.floor(Math.random() * 11) % 2 == 0) {
      SUBMISSION.push(QUESTIONS[Math.floor(Math.random() * 11)])
      res.json({ "msg": "accepted" })
  }
  res.json({ "msg": "rejected" })
});

// leaving as hard todos
// Create a route that lets an admin add a new problem
// ensure that only admins can do that.

app.post('/add' , loginMiddleware ,(req, res) => {
  const { email , password , role } = req.body

  if (email && password && role.toLowerCase() === "admin") {
      const { title, description, testCases } = req.body
      const newProblem = {
          title,
          description,
          testCases,
      }
      QUESTIONS.push(newProblem)
      res.status(200).json(QUESTIONS)
  } else res.status(403).json({ "msg": "only admin can add new problems" })
})

app.delete('/delete', loginMiddleware, (req, res) => {
  USERS = USERS.filter(x => x.email !== req.body.email)
  return res.json({"msg":"delted successfully"}).status(200)
})

app.listen(port, function() {
  console.log(`Example app listening on port ${port}`)
})