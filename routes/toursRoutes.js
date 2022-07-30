const express = require('express');

const handlers = require('../controller/toursHandler');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', handlers.checkID);

router.use('/:tourId/review', reviewRouter);

router.route('/top-5-cheap').get(handlers.cheapTours, handlers.getAllTours);
router.route('/monthly-plan/:year').get(handlers.monthlyPlan);

router.route('/').get(handlers.getAllTours).post(handlers.createTour);
router.route('/:id').get(handlers.getTour).patch(handlers.patchTour).delete(handlers.deleteTour);

module.exports = router;
