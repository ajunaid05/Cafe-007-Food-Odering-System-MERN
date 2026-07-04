const mongoose = require("mongoose");

const uri =
"mongodb+srv://Ahmad_Junaid:ahmadjunaid@cluster0.mfhwvkn.mongodb.net/?appName=Cluster0";

console.log("Node:", process.version);
console.log("Mongoose:", mongoose.version);

mongoose.connect(uri)
.then(() => {
    console.log("✅ Connected!");
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});