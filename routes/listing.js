const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");

// Validation Middleware
const validateListingMiddleware = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Index Route - List all Listings
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
}));

// New Listing Form Route
router.get("/new", isLoggedIn, wrapAsync(async (req, res) => {
    res.render("listings/new.ejs");
}));

// Show Listing Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner"); // Each review and owner is associated with each listing

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
}));

// Create Listing Route
router.post("/", isLoggedIn, validateListingMiddleware, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

// Edit Listing Form Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", { listing });
}));

// Update Listing Route
router.put("/:id", isLoggedIn, isOwner, validateListingMiddleware, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

// Delete Listing Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);

    if (deletedListing) {
        req.flash("success", "Listing Deleted!");
    } else {
        req.flash("error", "Failed to delete the listing.");
    }

    res.redirect("/listings");
}));

module.exports = router;
