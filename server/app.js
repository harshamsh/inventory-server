const mongoose = require("mongoose");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");

// Load environment variables from .env file
require("dotenv").config();

// Middleware for parsing the incoming requests as JSON
app.use(bodyParser.json());

// Middleware for handling CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB successfully");
});

// Define the schema for the "Item" collection
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Require the "name" field to be filled
  },
  description: String,
  quantity: {
    type: Number,
    default: 1, // Default value for "quantity" if not specified
  },
  createdAt: {
    type: Date,
    default: Date.now, // Default value for "createdAt" to the current time
  },
});

// Create a model based on the "Item" schema
const Item = mongoose.model("Item", itemSchema);

// Get all items
app.get("/api/items", async (req, res) => {
  const items = await Item.find();
  res.send(items);
});

// Get a single item by ID
app.get("/api/items/:id", (req, res) => {
  const id = req.params.id;
  Item.findById(id, (err, item) => {
    if (err) return res.status(400).send(err);
    if (!item)
      return res.status(404).send("The item with the given ID was not found.");
    res.send(item);
  });
});

// Create a new item
app.post("/api/items", async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  res.send(item);
});

// Update an existing item by ID
app.put("/api/items/:id", async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.send(item);
});

// Delete an existing item by ID
app.delete("/api/items/:id", async (req, res) => {
  const item = await Item.findByIdAndDelete(req.params.id);
  res.send(item);
});

// Find items by Name
app.get("/api/items/search", async (req, res) => {
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

// App Listening at PORT
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
