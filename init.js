const fs = require("fs");
const path = require("path");

const j = p => path.join(__dirname, p);

if(!fs.existsSync(j("data/")))
    fs.mkdirSync(j("data/"));
if(!fs.existsSync(j("data/config.json")))
    fs.writeFileSync(j("data/config.json"), "{}");