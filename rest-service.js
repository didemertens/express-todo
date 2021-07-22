const express = require('express')
const session = require('express-session')
var hash = require('pbkdf2-password')()
const {createUser, getUser} = require('./user-service')

// https://github.com/expressjs/express/blob/master/examples/auth/index.js

// Dummy database
const users = {
  sam: { name: 'sam' }
}

function logRequests(req, res, next) {
  next()
}

function restrictedPage(req, res, next) {
  console.log('secret')
  if (req.session.user) {
    next()
  } else {
    req.session.error = 'Access denied!'
    res.redirect('/')
  }
}

async function authenticate(name, pass, fn) {
  const user = await getUser(name)

  // query the db for the given username
  if (!user) return fn(new Error('cannot find user'));
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  hash({ password: pass, salt: user.salt, name: name }, function (err, pass, salt, hash) {
    if (err) return fn(err)
    if (hash === user.hash) return fn(null, user)
    fn(new Error('invalid password'))
  })
}


function createRestService() {
  const app = express()
  const port = 3000

  app.use(express.json())

  app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'shhhh, very secret'
  }))

  app.use(logRequests)

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  app.get('/health-check', (req, res) => {
    res.send({
      healthy: true,
    })
  })

  app.get('/secret-room', restrictedPage, (req, res) => {
    res.send('Secret room')
  })

  app.post('/login', async (req, res) => {
    await authenticate(req.body.username, req.body.password, function(err, user) {
      console.log('authenticate', user)
      if (user) {
        req.session.regenerate(function(){
          req.session.success = 'Authenticated as ' + user.name
            + ' click to <a href="/logout">logout</a>. '
            + ' You may now access <a href="/restricted">/restricted</a>.';
          res.redirect('/');
        })

      } else {
        req.session.error = 'Authentication failed, please check your '
        + ' username and password.'
      res.redirect('/health-check');
      }
    })
  })

  app.post('/register', async (req, res) => {
    await createUser(req.body.username, req.body.password)
    res.send('Registered user')
  })

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })

}

module.exports = createRestService