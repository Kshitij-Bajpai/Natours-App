const express = require('express');

const handlers = require('../controller/usersHandler');
const authHandlers = require('../controller/authHandler');

const router = express.Router();

router.post('/signup', authHandlers.signup);
router.post('/login', authHandlers.login);

router.post('/forgotPassword', authHandlers.forgotPassword);
router.patch('/resetPassword/:token', authHandlers.resetPassword);

router.patch('/updatePassword', authHandlers.protectUser, authHandlers.updatePassword);
router.patch('/selfUpdate', authHandlers.protectUser, handlers.updateUserByUser);
router.delete('/selfDelete', authHandlers.protectUser, handlers.deleteUserByUser);

router.route('/').get(handlers.getAllUsers).post(handlers.createUser);
router
  .route('/:id')
  .get(handlers.getUser)
  .patch(handlers.patchUser)
  .delete(
    authHandlers.protectUser,
    authHandlers.restrictTo('admin', 'lead-advisor'),
    handlers.deleteUser
  );

module.exports = router;
