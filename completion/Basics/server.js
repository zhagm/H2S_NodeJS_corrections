const express = require("express");
const Todo = require("./todo.model");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());
app.unsubscribe(bodyParser.urlencoded({ extended: false }));

mongoose.connect(
  "mongodb+srv://z:z@cluster0-bltnv.mongodb.net/test?retryWrites=true",
  { useNewUrlParser: true }
);

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

app.get("/", (req, res) => {
  res.status(200).send("Connected to server.");
});

app.get("/todos", (req, res) => {
  Todo.find((err, todos) => {
    if (err) {
      console.log(err);
      res.status(400).send("Error: Could not fetch todos");
    } else {
      res.status(200).json(todos);
    }
  });
});

app.get("/todos/:id", (req, res) => {
  let { id } = req.params;
  Todo.findById(id, (err, todo) => {
    res.status(200).json(todo);
  });
});

app.post("/todos", (req, res) => {
  let todo = req.body;
  if (typeof todo.completed !== "boolean") {
    todo.completed = false;
  }
  Todo.create(todo, (err) => {
    if (err) {
      res.status(400).send("Error: Could not add new todo");
    }
  });
  res.status(200).json({ todo: "Todo added" });
});

app.post("/todos/:id", (req, res) => {
  Todo.findById(req.params.id, (err, todo) => {
    if (!todo) {
      res.status(404).send("Error: Could not find todo");
    } else {
      let { description, title, completed } = req.body;
      todo.title = title || todo.title;
      todo.description = description || todo.description;
      todo.completed = completed || todo.completed;
      todo.save()
          .then(todo => res.status(200).json("Todo updated"))
          .catch(err => res.status(400).send("Error: Update not possible"));
    }
  });
});

app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;
  Todo.deleteOne({ _id: id }, (err) => {
    if (err) {
      return res.status(404).send("Todo not found");
    }
    return res.status(200).send("Todo deleted");
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});