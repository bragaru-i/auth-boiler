const express = require('express');

const usersController = require('../controllers/users-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMyPassword/', authController.protect, authController.updatePassword);

router.patch('/updateMe', authController.protect, usersController.updateMe);
router.delete('/deleteMe', authController.protect, usersController.deleteMe);

// Get all users , create a new user

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    usersController.getAllUsers
  )
  .post(usersController.createUser);

// Update, delete and get a user by id

router
  .route('/:uid')
  .patch(usersController.updateUser)
  .get(usersController.getUserById)
  .delete(usersController.deleteUserById);

module.exports = router;
