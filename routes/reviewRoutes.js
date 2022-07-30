const express = require('express');

const handlers = require('../controller/reviewHandler');
const authHandler = require('../controller/authHandler');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(handlers.getAllReviews)
  .post(authHandler.protectUser, authHandler.restrictTo('user'), handlers.createReview);
router.route('/:id').get(handlers.getReview);

module.exports = router;
