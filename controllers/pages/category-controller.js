const categoryServices = require('../../services/category-services')

const categoryController = {
  getCategories: (req, res, next) => {
    categoryServices.getCategories(req, (err, data) => err ? next(err) : res.render('admin/categories', data))
  },
  postCategory: (req, res, next) => {
    categoryServices.postCategory(req, (err, data) => err ? next(err) : res.redirect('/admin/categories'))
  },
  putCategory: (req, res, next) => {
    categoryServices.putCategory(req, (err, data) => err ? next(err) : res.redirect('/admin/categories'))
  },
  deleteCategory: (req, res, next) => {
    categoryServices.deleteCategory(req, (err, data) => err ? next(err) : res.redirect('/admin/categories'))
  }
}

module.exports = categoryController
