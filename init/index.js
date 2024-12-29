const mongoose = require("mongoose");
const initData = require("./data.js");
const Listings = require("../models/listing.js");

main().then((data) => {
    console.log("Connected to DB !");
}).catch((err) => { console.log(err); });

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wandelust ")
}

const initDB = async () => {
    try {
        await Listings.deleteMany({});
        initData.data = initData.data.map((obj) => (
            {
                ...obj,
                owner: "66f8f7b4803ffced37e369f9"
            }
        ));
        await Listings.insertMany(initData.data);
        console.log("Data was initialized");
    } catch (err) {
        console.log("Error initializing data:", err);
    }
};

initDB();
