import express, { response } from "express";
const app = express();
app.use(express.json());
import { createClient } from "redis";
import { prisma } from "./db";

const client = createClient(); //docker redis
client.connect();

app.post("/submission", async (req, res) => {
  const userId = req.body.userId;
  const questionId = req.body.questionId;
  const code = req.body.code;
  const language = req.body.language;

  const response = await prisma.submissions.create({
    data: {
      language,
      code,
      status: "Processing",
    },
  });

  client.lPush(
    "problems",
    JSON.stringify({ submissionId: response.id, code, language }),
  );
  res.json({
    message: "processing",
    id: response.id,
  });
});

app.get("/submission/:submissionId", async (req, res) => {
  const response = await prisma.submissions.findFirst({
    where: {
      id: req.params.submissionId,
    },
  });
  res.json({
    submission: response,
  });
});

app.listen(3000);
