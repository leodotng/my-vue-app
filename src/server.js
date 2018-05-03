const express = require('express')
const cors = require('cors')
const bodyParser = ('body-parser')
const Sequelize = ('sequelize')
const epilogue = require('epilogue')
const OktaJwtVerifier = require('@okta/jwt-veritifer')

const oktaJwtVerifier = new OktaJwtVerifier({
    clientId: '0oaew74todQXdJhpA0h7',
    issuer: 'https://dev-600280.oktapreview.com/oauth2/default'
})

let app = express()
app.use(cors())
app.use(bodyParser.json())

app.use((req, res, next) => {
    if(!req.headers.authorization) {
        return next(new Error('Authorization header is required'))
    }
    let parts = req.headers.authorization.trim().split(' ')
    let accessToken = parts.pop()
    oktaJwtVerifier.verifyAccessToken(accessToken)
    .then(jwt => {
        req.user = {
            uid: jwt.claims.uid,
            email: jwt.claims.sub
        }
        next()
    })
    .catch(next)
})

let database = new Sequelize({
    dialect: 'sqlite',
    storage: './test.sqlite'
})

// Define our Post model
// id, createdAt, and updatedAt are added by sequelize automatically

let Post = database.define('posts', {
    title: Sequelize.STRING,
    body: Sequelize.TEXT
})

epilogue.initialize({
    app: app,
    sequelize: database
})


