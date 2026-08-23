import { createClient } from "redis";
import fs from "fs"
import { spawn } from "child_process";

const client = createClient()
client.connect()
    .then(async () => {
        while (1) {
            const response = await client.rPop("problems");
            if (!response) {
                await new Promise((r) => setTimeout(r, 1000));
                continue;
            }
            const parsedResponse = JSON.parse(response as string);
            const code = parsedResponse.code;
            const language = parsedResponse.language;

            if (language === "cpp") {
                console.log("running users c++ code")
                const filePath = __dirname + "/code/a.cpp";
                const outPath = __dirname + "/code/out";
                fs.writeFileSync(filePath, code);
                 await new Promise<void>((resolve, reject) => {
                  const compile = spawn("g++", [filePath, "-o", outPath]);
                  compile.on("close", (code) => code === 0 ? resolve() : reject(new Error("Compilation failed")));
                 });

                const response = spawn("./code/out");
                response.stdout.on("data", (chunk) => { 
                    console.log(chunk.toString())
                })
            }
            
            if (language === "js") {
                console.log("running users js code")
                const filePath = __dirname + "/code/a.js";
                fs.writeFileSync(filePath, code);
                const response = spawn("node", [filePath]);
                response.stdout.on("data", (chunk) => { 
                    console.log(chunk.toString());
                })
            }
             if (language === "py") {
                console.log("running users py code")
                const filePath = __dirname + "/code/a.py";
                fs.writeFileSync(filePath, code);
                const response = spawn("python", [filePath]);
                response.stdout.on("data", (chunk) => { 
                    console.log(chunk.toString());
                })
            }
        }
    })