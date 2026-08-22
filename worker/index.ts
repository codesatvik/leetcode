import { createClient } from "redis";

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

            if (language === "c++") {
                console.log("running users c++ code")
                await new Promise((r) => setTimeout(r, 10000))
            }
            
            if (language === "js") {
                console.log("running users js code")
                await new Promise((r) => setTimeout(r, 10000))
            }
        }
    })