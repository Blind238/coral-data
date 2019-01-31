'use strict'
const Koa = require('koa')
const Router = require('koa-router')
const serve = require('koa-static')
const parse = require('koa-body')
const mount = require('koa-mount')

const Sequelize = require('sequelize')

// const zipPending = require('./lib/zipPending')
// const watsonVR = require('./lib/watson')

// zipPending()
//   .then(_ => {
//     watsonVR.updateClassifiers()
//   })
// watsonVR.listClassifiers().then(res => console.log(JSON.stringify(res, null, 2)))

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

app.use(router.routes())
  .use(router.allowedMethods())

// expose images for review
app.use(mount('/images', serve('images')))

// in development we are already serving via vue-cli (webpack)
if (process.env.NODE_ENV === 'production') {
  app.use(serve('dist'))
}

app.listen(2380, _ => console.log('backend server listening on http://localhost:2380'))
