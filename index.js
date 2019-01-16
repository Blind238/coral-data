'use strict'
const Koa = require('koa')
const Router = require('koa-router')
const serve = require('koa-static')
const parse = require('koa-body')

const Sequelize = require('sequelize')

// const zipPending = require('./lib/zipPending')
// const updateVisualRecognition = require('./lib/watson')

const path = require('path')

const app = new Koa()
const router = new Router()
const sequelize = new Sequelize('coralData', null, null, {
  dialect: 'sqlite',
  storage: 'db.sqlite',
  logging: false
})

app.context.db = sequelize

sequelize.import(path.join(__dirname, '/models/user.js'))
sequelize.import(path.join(__dirname, '/models/role.js'))
sequelize.import(path.join(__dirname, '/models/observation.js'))

Object.keys(sequelize.models).forEach(model => {
  if (sequelize.models[model].associate) {
    sequelize.models[model].associate(sequelize.models)
  }
})

sequelize.sync()

router.post('/api/observation', parse(), async (ctx, next) => {
  let { lat, lon } = ctx.request.body

  ctx.body = await ctx.db.models['observation'].create({
    lat,
    lon,
    depth: 2,
    temp: 28
  })
})

router.get('/api/observation', async (ctx, next) => {
  ctx.body = await ctx.db.models['observation'].findAll()
})

router.get('/db', async (ctx, next) => {
  // retrieve and go trough list
  let results = await ctx.db.models.observation.findAll()
  let resString = ''
  results.forEach((item, i, arr) => {
    let res = item.get()
    resString += res
  })
  console.log(resString)
  next()
}, (ctx, next) => {
  ctx.body = 'db!'
})

app.use(router.routes())
  .use(router.allowedMethods())

// in development we are already serving via vue-cli (webpack)
if (process.env.NODE_ENV === 'production') {
  app.use(serve('dist'))
}

app.listen(2380, _ => console.log('backend server listening on http://localhost:2380'))
