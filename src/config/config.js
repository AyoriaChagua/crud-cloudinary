require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "test-secret";
const SITE_KEY = process.env.SITE_KEY ;
const SECRET_KEY = process.env.SECRET_KEY ;
const SENGRID_KEY = process.env.SENGRID_KEY;

module.exports = { JWT_SECRET, SITE_KEY, SECRET_KEY, SENGRID_KEY };
