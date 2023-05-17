const mongoose = require('mongoose');


mongoose.connect(
    process.env.MONGODB_URI,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
.then(db => console.log(`Database is connected to ${db.connection.name}`))
.catch(error => console.log(error))
