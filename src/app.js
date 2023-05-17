const express = require("express");
const { engine } = require("express-handlebars");
const  router_products  = require("./routes/products.js");
const path = require("path")
require("dotenv").config()
require("./config/db.js")

const port = 5000
const app = express()

app.set("views", path.join(__dirname, "views"))
app.engine(
    ".hbs",
    engine({
        extname: ".hbs",
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },
    })
)
app.set("view engine", ".hbs")

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use("/products", router_products)

app.listen(port, ()=>{
    console.log(`Server on port ${port}`)
})
