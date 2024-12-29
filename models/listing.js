const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./review.js");

const ListingSchema = new Schema({
    title: String,
    description: String,
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1711972638202-e9585b245609?q=80&w=1949&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set: (v) =>
            v === "" ? "https://images.unsplash.com/photo-1711972638202-e9585b245609?q=80&w=1949&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

// Mongoose middleware: if a listing is deleted, then its reviews are also deleted
ListingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

module.exports = mongoose.model('Listing', ListingSchema);
