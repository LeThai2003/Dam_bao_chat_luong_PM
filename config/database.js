const mongoose = require("mongoose");

module.exports.connect = () => {
  mongoose.connect(process.env.DATABASE_PATH)
    .then(() => console.log('Connected!'));
}