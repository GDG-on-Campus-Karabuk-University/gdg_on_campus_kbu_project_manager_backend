const mongoose = require("mongoose");

const connectDatabase = () => {
    /* Warning: useNewUrlParser is a deprecated option: useNewUrlParser has no effect since Node.js Driver version 4.0.0 and will be removed in the next major version

    To clarify things, there were at least 4 methods we could use, but since it does work without them, i decided not to */

    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDb Connection Successful");
    })
    .catch(err => {
        console.error(err);
    })
}

module.exports = connectDatabase;