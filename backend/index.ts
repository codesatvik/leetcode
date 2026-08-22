import express from "express";
const app = express()
app.use(express.json())
import { createClient } from "redis"

const client = createClient(); //docker redis
client.connect();

app.post("/submission", (req, res) => { 
    const userId = req.body.userId;
    const questionId = req.body.questionId;
    const code = req.body.code;
    const language = req.body.language;

    client.lPush("problems", JSON.stringify({userId,questionId,code,language}))
    res.json({
        message: "processing"
    })
})


app.listen(3000)