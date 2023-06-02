const express = require("express");

const app = express();
const fs = require("fs");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const port = process.env.PORT || 8000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json("Hello World");
});

app.get("/todos", (req, res) => {
  console.log(req);
  prisma.todo
    .findMany()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

app.post("/todos", async (req, res) => {
  // bulk create
  console.log(req);
  const { todos } = req.body;
  await prisma.todo
    .createMany({
      data: todos,
    })
    .then((data) => {
      res.json(data).status(201);
    });
});

app.get("/todos/:id", async (req, res) => {
  const { id } = req.params;
  console.log(req);
  try {
    const todo = await prisma.todo.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    res.json(todo);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

app.put("/todos/:id", async (req, res) => {
  console.log(req);
  const { id } = req.params;
  const { title } = req.body;
  await prisma.todo
    .update({
      where: {
        id: parseInt(id),
      },
      data: {
        title,
      },
    })
    .then((data) => {
      res.json({
        message: "Updated",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// bulk delete array of ids
app.delete("/todos", async (req, res) => {
  console.log(req);
  const { ids } = req.body;
  await prisma.todo
    .deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
    .then((data) => {
      res.json({
        message: "Deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

app.get("/.well-known/ai-plugin.json", (req, res) => {
  const host = req.headers["host"];
  fs.readFile("./.well-known/ai-plugin.json", "utf8", (err, data) => {
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
