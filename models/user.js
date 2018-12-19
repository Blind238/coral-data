'use strict'
module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define('user', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    pass: DataTypes.STRING
  })

  user.associate = models => {
    models.user.belongsTo(models.role)
  }

  return user
}
