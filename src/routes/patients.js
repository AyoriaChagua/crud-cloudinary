const Patient = require("../models/Patient.js")
const multer = require("multer");
const upload = multer({ dest: 'uploads/' });
const cloudinary = require('cloudinary').v2;
require("dotenv").config()
const {Router} = require("express")
const router_patients = Router()

router_patients.get('/', async (req, res)=>{
    try {
        const patients = await Patient.find({})
        res.render("patients", {patients})
    } catch (error) {
        res.status(500).json({ error: 'Error searching for patients' });
    }
})


router_patients.post('/', upload.single('image'), async (req, res) => {
    try {
        const imageFile = req.file.path;

        const result = await cloudinary.uploader.upload(imageFile, {
            folder: "patients"
        });
        const url = cloudinary.url(result.public_id, {
            width: 100,
            height: 100,
            Crop: 'fill'
          });

        const patient = req.body;
        const newPatient = new Patient({
            lastname: patient.lastname,
            name: patient.name,
            gender: patient.gender,
            speciality: patient.speciality,
            imageUrl: url,
        });

        await newPatient.save();
        res.redirect("/patients");
    } catch (error) {
        return res.status(500).json({ error });
    }
});




router_patients.get('/delete/:id', async (req, res)=>{
    try {
        const { id } = req.params
        await Patient.findByIdAndDelete(id)
        res.redirect("/patients")
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar al paciente' });

    }
})

router_patients.get('/:id', async (req, res)=>{
    try {
        const { id } = req.params
        const patient = await Patient.findById(id);
        res.render('patient-edit', {patient})
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener al paciente' });
    }
    
})

router_patients.post('/:id', upload.single('image'),async (req, res)=>{
    try {
        const imageFile = req.file.path;

        const result = await cloudinary.uploader.upload(imageFile, {
            folder: "patients"
        });
        const url = cloudinary.url(result.public_id, {
            width: 100,
            height: 100,
            Crop: 'fill'
          });

        const patient = {
            lastname: patient.lastname,
            name: patient.name,
            gender: patient.gender,
            speciality: patient.speciality,
            imageUrl: url,
        }
        
        await Patient.findByIdAndUpdate(req.params.id, patient, { new: true });
        res.redirect('/patients')
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar al patient' });
    }
})


module.exports = router_patients