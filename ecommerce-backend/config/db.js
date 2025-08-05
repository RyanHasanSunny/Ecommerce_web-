const mongoose = require('mongoose');
const color = require('colors'); // For colored console logs




const mongodb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${mongoose.connection.host}`.green.bold);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`.red.bold);
        process.exit(1); // Exit the process with failure
    }
}


module.exports = mongodb;