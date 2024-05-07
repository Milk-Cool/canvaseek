#!/bin/env node

require("./init.js");
const express = require("express");
const fs = require("fs");
const path = require("path");
const cluster = require("cluster");

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

const j = p => path.join(__dirname, p);

const getConfig = () => JSON.parse(fs.readFileSync(j("data/config.json")));
const setConfig = config => fs.writeFileSync(j("data/config.json"), JSON.stringify(config));

const checkConfig = () => {
    const config = getConfig();
    if(!(
        "domain" in config
        && "key" in config
        && "max" in config
        && "workers" in config
    ))
        return false;
    return true;
}

const main = () => {
    const app = express();
    const port = 5960;

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

    let started = false;
    const startWorkers = () => {
        if(started) return;
        started = true;
        for(let i = 0; i < parseInt(getConfig().workers); i++) {
            const worker = cluster.fork();
            worker.on("online", () => {
                console.log(`Worker #${worker.id} online!`);
            });
        }
    }

    const searchFiles = query => {
        const output = [];
        for(let file of fs.readdirSync(j("data/"))) {
            if(file == "config.json") continue;
            const json = JSON.parse(fs.readFileSync(j("data/" + file)));
            if(
                json.uuid == query
                || json.display_name.toLowerCase().includes(query.toLowerCase())
                || json.filename.toLowerCase().includes(query.toLowerCase())
                || json["content-type"] == query
            ) output.push([file, json.id, json.display_name]);
        }
        return output;
    }

    const getCount = () => fs.readdirSync(j("data/")).length - 1;

    app.use(express.urlencoded({ "extended": false }));

    app.get("/style.css", (req, res) => res.sendFile(j("public/style.css")));

    app.get("/config", (req, res) => {
        const config = getConfig();
        replaceServeText(res, j("public/config.html"), {
            "domain": config.domain ?? "",
            "key": config.key ?? "",
            "max": config.max ?? "",
            "workers": config.workers ?? ""
        });
    });
    app.post("/config", (req, res) => {
        setConfig({
            "domain": req.body.domain,
            "key": req.body.key,
            "max": req.body.max,
            "workers": req.body.workers
        });
        startWorkers();
        res.redirect("/");
    });

    app.get("/", (req, res) => {
        if(!checkConfig()) return res.redirect("/config");
        replaceServeText(res, j("public/index.html"), {
            "count": getCount()
        })
    });
    app.post("/", (req, res) => {
        const files = searchFiles(req.body.query);
        files.sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
        const trsAndTds = files.map(x => `<tr><td><a href="/file/${x[0]}">${x[1]}</a></td><td>${x[2]}</td></tr>`).join("\n");
        replaceServeText(res, j("public/results.html"), {
            "count": files.length,
            "results": trsAndTds
        });
    });

    app.get("/file/*", (req, res) => {
        const name = req.path.split("/").filter(x => x)?.[1];
        if(!name || name.includes("..")) return res.status(400).end("You need to specify the filename!");
        if(!fs.existsSync(j("data/" + name))) return res.status(404).end("No such file found!");
        const json = JSON.parse(fs.readFileSync(j("data/" + name)));
        replaceServeText(res, j("public/file.html"), {
            "preview": json.thumbnail_url ? `<img src="${json.thumbnail_url}" class="preview"><br><br>` : "",
            "id": json.id ?? "",
            "uuid": json.uuid ?? "",
            "display_name": json.display_name ?? "",
            "filename": json.filename ?? "",
            "content_type": json.content_type ?? "",
            "url": json.url ?? "",
            "preview_url": json.preview_url ?? "",
            "created_at": (new Date(json.created_at ?? 0)).toString(),
            "updated_at": (new Date(json.updated_at ?? 0)).toString(),
            "modified_at": (new Date(json.modified_at ?? 0)).toString()
        });
    });

    if(checkConfig()) startWorkers();

    app.listen(port, "localhost", () => console.log(`Listening on ${port}!`));
};

const checkOne = async () => {
    const config = getConfig();
    const f = await fetch(new URL("/api/v1/files/" + Math.floor(Math.random() * parseInt(config.max)), config.domain), {
        "headers": {
            "Authorization": "Bearer " + config.key,
            "Accept": "application/json"
        }
    });
    if(f.status != 200) return;
    const json = await f.json();
    fs.writeFileSync(j("data/" + json.uuid), JSON.stringify(json));
};

const worker = async () => {
    while(true) await checkOne();
};

if(cluster.isPrimary)
    main();
else
    worker();