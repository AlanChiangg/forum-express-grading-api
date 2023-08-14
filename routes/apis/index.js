const express = require('express')
const router = express.Router()

const admin = require('../apis/modules/admin')
const restController = require('../../controllers/apis/restaurant-controller')

router.use('/admin', admin)

router.get('/restaurants', restController.getRestaurants)

module.exports = router
