const adminServices = require('../../services/admin-services')

const adminController = {
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  createRestaurant: (req, res, next) => {
    adminServices.postRestaurant(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  postRestaurant: (req, res, next) => {
    adminServices.postRestaurant(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getRestaurant: (req, res, next) => {
    adminServices.getRestaurant(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  editRestaurant: (req, res, next) => {
    adminServices.editRestaurant(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  putRestaurant: (req, res, next) => {
    adminServices.putRestaurant(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  deleteRestaurant: (req, res, next) => {
    adminServices.deleteRestaurant(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getUsers: (req, res, next) => {
    adminServices.getUsers(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  patchUser: (req, res, next) => {
    adminServices.patchUser(req, (err, data) => {
      if (err) return next(err)
      if (data.toString() === 'false') {
        return res.json({
          status: 'error',
          messages: '禁止變更 root 權限'
        })
      }
      return res.json({
        status: 'success',
        messages: '使用者權限變更成功'
      })
    })
  }
}

module.exports = adminController
