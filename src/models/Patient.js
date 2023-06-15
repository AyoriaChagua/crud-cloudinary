const {Schema, model} = require("mongoose")

const patientSchema = new Schema({
    lastname: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    speciality: {
        type: String,
        required: true,
        enum: ['Cardiology', 'Dermatology', 'Neurology', 'Ophthalmology']
    },
    imageUrl:{
        type: String,
        required: true
    }
})

module.exports = model("Patient", patientSchema)