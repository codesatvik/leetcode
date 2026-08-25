import { createClient } from "redis";
import fs from "fs";
import { spawn } from "child_process";
import { prisma } from "./db";

const client = createClient();
client.connect().then(async () => {
  while (1) {
    const response = await client.rPop("problems");
    if (!response) {
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }
    const parsedResponse = JSON.parse(response as string);
    const code = parsedResponse.code;
    const language = parsedResponse.language;
    const submissionId = parsedResponse.submissionId;
    let finalOutput = "";
    console.log(parsedResponse.userId);

    if (language === "cpp") {
      console.log("running users c++ code");
      const filePath = __dirname + "/code/a.cpp";
      const outPath = __dirname + "/code/out";
      fs.writeFileSync(filePath, code);
      const reponseCompiler = spawn("g++", [filePath, "-o", "./code/out"]);
      let exitCodeCompiler = null;
      await new Promise<void>((resolve) => {
        reponseCompiler.on("exit", async (exitCode) => {
          exitCodeCompiler = exitCode;
          if (exitCode !== 0) {
            await prisma.submissions.update({
              where: {
                id: submissionId,
              },
              data: { status: "failure" },
            });
          }
          resolve();
        });
      });
      if (exitCodeCompiler !== 0) {
        continue;
      }
      const response = spawn("./code/out");
      response.stdout.on("data", (chunk) => {
        finalOutput += chunk.toString();
      });
      await new Promise<void>((resolve) => {
        response.on("exit", async (exitCode) => {
          console.log(exitCode);
          if (exitCode === 0) {
            await prisma.submissions.update({
              where: {
                id: submissionId,
              },
              data: {
                status: "success",
                output: finalOutput,
              },
            });
          } else {
            await prisma.submissions.update({
              where: {
                id: submissionId,
              },
              data: {
                status: "failure",
              },
            });
          }
          resolve();
        });
      });
    }

    if (language === "js") {
      console.log("running users js code");
      const filePath = __dirname + "/code/a.js";
      fs.writeFileSync(filePath, code);
      const response = spawn("node", [filePath]);
      response.stdout.on("data", (chunk) => {
        console.log(chunk.toString());
      });
    }
    if (language === "py") {
      console.log("running users py code");
      const filePath = __dirname + "/code/a.py";
      fs.writeFileSync(filePath, code);
      const response = spawn("python", [filePath]);
      response.stdout.on("data", (chunk) => {
        console.log(chunk.toString());
      });
    }
  }
});
