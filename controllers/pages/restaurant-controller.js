const { Restaurant, Category, Comment, User, sequelize } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ],
      order: [
        [{ model: Comment }, 'createdAt', 'DESC'] // 對Comment的createdAt屬性進行倒序排序
      ]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')
        return restaurant.increment('viewCounts', { by: 1 })
      })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        const isLiked = restaurant.LikedUsers.some(liked => liked.id === req.user.id)
        res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked
        })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category, Comment],
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM Favorites WHERE Favorites.restaurant_id = Restaurant.id)'), 'favoritedCount'],
          [sequelize.literal('(SELECT COUNT(*) FROM Comments WHERE Comments.restaurant_id = Restaurant.id)'), 'commentCount']
        ]
      },
      raw: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('Restaurant didn\'t exist!')
        const commentCount = restaurant.commentCount
        const favoritedCount = restaurant.favoritedCount
        res.render('dashboard', {
          restaurant,
          commentCount,
          favoritedCount
        })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        const data = restaurants.map(r => ({
          ...r,
          description: r.description.substring(0, 50)
        }))
        res.render('feeds', {
          restaurants: data,
          comments
        })
      })
      .catch(err => next(err))
  },
  getTopRestaurants: (req, res, next) => {
    Restaurant.findAll({
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM Favorites WHERE Favorites.restaurant_id = Restaurant.id)'), 'favoritedCount']
        ]
      },
      order: [[sequelize.literal('favoritedCount'), 'DESC']],
      limit: 10,
      raw: true
    })
      .then(restaurants => {
        if (!restaurants) throw new Error("Restaurant didn't exist!")
        const result = restaurants.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          favoritedCount: r.favoritedCount,
          isFavorited: req.user && req.user.FavoritedRestaurants.some(fr => fr.id === r.id)
        }))
        res.render('top-restaurants', { restaurants: result })
      })
  }
}
module.exports = restaurantController
