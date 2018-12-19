'use strict'
const Koa = require('koa')
const Router = require('koa-router')
const Sequelize = require('sequelize')
const zipPending = require('./lib/zipPending')
const updateVisualRecognition = require('./lib/watson')

const path = require('path')

const app = new Koa()
const router = new Router()
const sequelize = new Sequelize('coralData', null, null, {
  dialect: 'sqlite',
  storage: 'db.sqlite'
})

router.get('/', (ctx, next) => {
  ctx.body = 'home'
})

router.get('/other', (ctx, next) => {
  ctx.body = 'other'
})

router.get('/db', async (ctx, next) => {
  sequelize.import(path.join(__dirname, '/models/user.js'))
  sequelize.import(path.join(__dirname, '/models/role.js'))
  sequelize.import(path.join(__dirname, '/models/observation.js'))

  sequelize.models.forEach(model => {
    if (model.associate) {
      model.associate(sequelize.models)
    }
  })

  await sequelize.sync()

  // retrieve and go trough list
  let results = await sequelize.models.observation.findAll()
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

app.listen(2380)
