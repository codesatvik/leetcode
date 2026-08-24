import express, { response } from "express";
const app = express()
app.use(express.json())
import { createClient } from "redis"
import { prisma } from "./db";

const client = createClient(); //docker redis
client.connect();

app.post("/submission", async  (req, res) => { 
    const userId = req.body.userId;
    const questionId = req.body.questionId;
    const code = req.body.code;
    const language = req.body.language;

    const response = await prisma.submissions.create({
        data: {
            language,
            code,
            status:"Processing"
        }
    })

    client.lPush("problems", JSON.stringify({submisionId:response.id,questionId,code,language}))
    res.json({
        message: "processing",
        id:response.id
    })

})


app.listen(3000)