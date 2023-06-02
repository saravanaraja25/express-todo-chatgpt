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
  console.log(
    "###################################################Entering Todos GET API #####################################################"
  );
  console.log(req);
  console.log(
    "###################################################Exiting Todos GET API ####################################"
  );
  prisma.todo
    .findMany()
    .then((data) => {
      console.log(
        "#########################################################Response from GET API#########################################################"
      );
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

app.post("/todos", async (req, res) => {
  // bulk create
  console.log(
    "###################################################Entering Todos POST API #####################################################"
  );
  console.log(req.body);
  console.log(
    "###################################################Exiting Todos POST API ####################################"
  );
  const { todos } = req.body;
  await prisma.todo
    .createMany({
      data: todos,
    })
    .then((data) => {
      console.log(
        "#########################################################Response from POST API#########################################################"
      );
      console.log(data);
      res.json(data).status(201);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

app.get("/todos/:id", async (req, res) => {
  const { id } = req.params;
  console.log(
    "###################################################Entering Todos GET API #####################################################"
  );
  console.log(req.params, req.body);
  console.log(
    "###################################################Exiting Todos GET API ####################################"
  );
  try {
    const todo = await prisma.todo.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    console.log(
      "#########################################################Response from GET API#########################################################"
    );
    console.log(todo);
    res.json(todo);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

app.put("/todos/:id", async (req, res) => {
  console.log(
    "###################################################Entering Todos PUT API #####################################################"
  );
  console.log(req.params, req.body);
  console.log(
    "###################################################Exiting Todos PUT API ####################################"
  );
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
      console.log(
        "#########################################################Response from PUT API#########################################################"
      );
      console.log(data);
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
  console.log(
    "###################################################Entering Todos DELETE API #####################################################"
  );
  console.log(req.body);
  console.log(
    "###################################################Exiting Todos DELETE API ####################################"
  );
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
      console.log(
        "#########################################################Response from DELETE API#########################################################"
      );
      console.log(data);
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
