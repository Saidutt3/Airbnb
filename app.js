


const express = require("express");
const PORT = process.env.PORT || 8080;
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const session = require("express-session");
const flash = require("connect-flash");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");




const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wandelust";
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wandelust";
main().then((data) => {
    console.log("Connected to DB!");
}).catch((err) => { console.log(err); });

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const sessionOptions = {
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() * 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};


app.get("/", (req, res) => {
    res.send("This is Root Page!!!");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success"); //middleware for successfull listing creation 
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld") //(user, password)
//     res.send(registeredUser);
// });


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found !!"))
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong !" } = err;

    res.status(statusCode).render("error.ejs", { message });

    // res.status(statusCode).send(message);
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});


// // Test listing
// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa ",
//         description: "By the beach ",
//         price: 2000,
//         location: "California ",
//         country: " INdia",
//     });
//     await sampleListing.save();
//     console.log("Sample was saved ");
//     res.send("Succes !!!");
// });

