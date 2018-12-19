'use strict'
module.exports = (sequelize, DataTypes) => {
  var role = sequelize.define('role', {
    name: DataTypes.STRING
  })

  // role.association = models => {
  //   models.role.hasMany(models.user);
  // };

  return role
}
