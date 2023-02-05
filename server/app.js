const mongoose = require("mongoose");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");

require("dotenv").config();

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB successfully");
});

const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
  quantity: Number,
});

const Item = mongoose.model("Item", itemSchema);

app.use(express.json());

app.get("/api/items", async (req, res) => {
  const items = await Item.find();
  res.send(items);
});

app.get("/api/items/:id", (req, res) => {
  const id = req.params.id;
  Item.findById(id, (err, item) => {
    if (err) return res.status(400).send(err);
    if (!item)
      return res.status(404).send("The item with the given ID was not found.");
    res.send(item);
  });
});

app.post("/api/items", async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  res.send(item);
});

app.put("/api/items/:id", async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.send(item);
});

app.delete("/api/items/:id", async (req, res) => {
  const item = await Item.findByIdAndDelete(req.params.id);
  res.send(item);
});

app.get("/api/items/search/?", async (req, res) => {
  console.log("Received searchTerm: ", req.query.searchTerm);
  const searchTerm = req.query.searchTerm;
  try {
    const items = await Item.find({ name: new RegExp(searchTerm, "i") });
    console.log("Found items: ", items);
    res.send(items);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
