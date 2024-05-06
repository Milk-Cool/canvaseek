#!/bin/env node

require("./init.js");
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 5960;

const j = p => path.join(__dirname, p);

const replace = (text, replacers) => {
    for(let key in replacers)
        text = text.replaceAll(`{{${key}}}`, replacers[key]);
    return text;
}
const replaceServeText = (res, path, replacers) => {
    let text = fs.readFileSync(path, "utf-8");
    text = replace(text, replacers);
    res.send(text);
}

const getConfig = () => JSON.parse(fs.readFileSync(j("data/config.json")));
const setConfig = config => fs.writeFileSync(j("data/config.json"), JSON.stringify(config));

const checkConfig = () => {
    const config = getConfig();
    if(!(
        "domain" in config
        && "key" in config
        && "max" in config
    ))
        return false;
    return true;
}

const getCount = () => fs.readdirSync(j("data/")).length - 1;

app.use(express.urlencoded({ "extended": false }));

app.get("/style.css", (req, res) => res.sendFile(j("public/style.css")));

app.get("/config", (req, res) => {
    const config = getConfig();
    replaceServeText(res, j("public/config.html"), {
        "domain": config.domain ?? "",
        "key": config.key ?? "",
        "max": config.max ?? ""
    });
});
app.post("/config", (req, res) => {
    setConfig({
        "domain": req.body.domain,
        "key": req.body.key,
        "max": req.body.max
    });
    res.redirect("/");
});

app.get("/", (req, res) => {
    if(!checkConfig()) return res.redirect("/config");
    replaceServeText(res, j("public/index.html"), {
        "count": getCount()
    })
});

app.listen(port, "localhost", () => console.log(`Listening on ${port}!`));