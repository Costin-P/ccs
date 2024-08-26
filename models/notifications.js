let mongoose = require('mongoose')
let Schema = mongoose.Schema

const notificationsSchema = new Schema({
  type: {
    type: String,
    default: "alert"
  },
  date: {
    type: Date,
    required: true,
  },
  car: {
    type: String,
    required: true,
  },
})

var notificationsModel = mongoose.model('notifications', notificationsSchema, 'notifications')

module.exports = notificationsModel
