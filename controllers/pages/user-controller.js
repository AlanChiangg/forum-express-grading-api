const { User, Restaurant, Comment } = require('../../models')
const { imgurFileHandler } = require('../../helpers/file-helpers')
const userServices = require('../../services/user-services')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    userServices.signUp(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_message', '成功註冊帳號！')
      req.session.newUser = data
      res.redirect('/signin')
    })
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    return Promise.all([
      User.findByPk(req.params.id, {
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          { model: Restaurant, as: 'FavoritedRestaurants' }
        ],
        nest: true
      }),
      Comment.findAll({
        raw: true,
        nest: true,
        where: { userId: req.params.id },
        include: Restaurant
      })
    ])
      .then(([user, comments]) => {
        if (!user) throw new Error('User didn\'t exist!')
        const loginUser = req.user.id
        const result = user.toJSON()
        console.log(comments)
        res.render('users/profile', {
          user: result,
          loginUser,
          comments
        })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    return User.findByPk(req.params.id, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error('User didn\'t exist!')
        res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('User name is required!')
    if (req.user.id !== Number(req.params.id)) throw new Error('User can only edit him or her own profile!')
    const { file } = req
    return Promise.all([
      User.findByPk(req.params.id),
      imgurFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error('User name is required!')
        return user.update({
          name,
          image: filePath || user.image
        })
      })
      .then(() => {
        req.flash('success_messages', '使用者資料編輯成功')
        res.redirect(`/users/${req.params.id}`)
      })
      .catch(err => next(err))
  },
  addFavorite: (req, res, next) => {
    userServices.addFavorite(req, (err, data) => err ? next(err) : res.redirect('back'))
  },
  removeFavorite: (req, res, next) => {
    userServices.removeFavorite(req, (err, data) => err ? next(err) : res.redirect('back'))
  },
  addLike: (req, res, next) => {
    userServices.addLike(req, (err, data) => err ? next(err) : res.redirect('back'))
  },
  removeLike: (req, res, next) => {
    userServices.removeLike(req, (err, data) => err ? next(err) : res.redirect('back'))
  },
  getTopUsers: (req, res, next) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
      .then(users => {
        const result = users
          .map(user => ({
            ...user.toJSON(),
            followerCount: user.Followers.length,
            isFollowed: req.user.Followings.some(f => f.id === user.id)
          }))
          .sort((a, b) => b.followerCount - a.followerCount)
        res.render('top-users', { users: result })
      })
      .catch(err => next(err))
  },
  addFollowing: (req, res, next) => {
    userServices.addFollowing(req, (err, data) => err ? next(err) : res.redirect('back'))
  },
  removeFollowing: (req, res, next) => {
    userServices.removeFollowing(req, (err, data) => err ? next(err) : res.redirect('back'))
  }
}
module.exports = userController
