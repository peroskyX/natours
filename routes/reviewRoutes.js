const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const protectMiddleware = require('../middlewares/protect');

const router = express.Router({ mergeParams: true });

// Middleware works in sequence so protect all routes after this middleware
router.use(authController.protect);

// Reviews routes
router.route('/').get(reviewController.getAllReviews).post(
  authController.restrictTo('user'), // to review, user's role should be "user" not admin, guide, etc.
  reviewController.setTourUserIds,
  reviewController.createReview
);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    protectMiddleware.protectComent,
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
