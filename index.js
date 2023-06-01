const express = require("express");

const app = express();
const fs = require("fs");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

app.use(express.json());

app.get("/", (req, res) => {
  res.json("Hello World");
});

app.get("/todos", (req, res) => {
  prisma.todo.findMany().then((data) => {
    res.json(data);
  });
});

app.post("/todos", async (req, res) => {
  const { title } = req.body;
  await prisma.todo
    .create({
      data: {
        title,
      },
    })
    .then((data) => {
      res.json(data).status(201);
    });
});

app.get("/todos/:id", async (req, res) => {
  const { id } = req.params;
   const todo = await prisma.todo.findUnique({
    where: {
      id: parseInt(id),
    },
  });
    res.json(todo);
});

app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  await prisma.todo.update({
    where: {
      id: parseInt(id),
    },
    data: {
      title,
    },
  });

  res.json({
    message: "Updated",
  });
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.todo.delete({
    where: {
      id: parseInt(id),
    },
  });
  res.json({
    message: "Deleted",
  });
});

app.get("/.well-known/ai-plugin.json", (req, res) => {
  const host = req.headers["host"];
  fs.readFile("./ai-plugin.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.set("Content-Type", "text/json");
      res.send(data);
    }
  });
});

app.get("/openapi.yaml", (req, res) => {
  const host = req.headers["host"];
  fs.readFile("./openapi.yaml", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.set("Content-Type", "text/yaml");
      res.send(data);
    }
  });
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
