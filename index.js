const express = require('express')
const cors = require('cors')
const {connect} = require('./services/MongodbService')
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

const AuthRoutes = require("./controllers/routes/auth")
const ThreadRoutes = require("./controllers/routes/thread")

app.use('/auth', AuthRoutes)
app.use('/thread', ThreadRoutes)

app.listen(3333)

console.log('Server is running')