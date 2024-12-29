const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isreviewAuthor } = require("../middleware.js");
const { reviewSchema } = require("../schema.js");

// Validation Middleware
const validateReviewMiddleware = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Post Review Route
router.post("/",
    isLoggedIn,
    validateReviewMiddleware,
    wrapAsync(async (req, res) => {
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);

        listing.reviews.push(newReview);
        newReview.author = req.user._id;

        await newReview.save();
        await listing.save();
        req.flash("success", "New Review Created!");

        res.redirect(`/listings/${listing._id}`);
    })
);

// Delete Review Route
router.delete("/:reviewId",
    isLoggedIn,
    isreviewAuthor,
    wrapAsync(async (req, res) => {
        let { id, reviewId } = req.params;
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // Remove review from listing
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review Deleted!");

        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;
