
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const file = "./items.json";

function readItems() {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveItems(items) {
  fs.writeFileSync(file, JSON.stringify(items, null, 2));
}

app.get("/", (req, res) => {
  res.send("Campus Lost and Found Server is Running!");
});

app.get("/api/items", (req, res) => {
  res.json(readItems());
});

app.post("/api/items", (req, res) => {
  const items = readItems();

  const newItem = {
    id: Date.now().toString(),
    name: req.body.name,
    type: req.body.type,
    category: req.body.category,
    location: req.body.location,
    date: new Date().toLocaleDateString()
  };

  items.unshift(newItem);
  saveItems(items);

  res.json(newItem);
});

app.delete("/api/items/:id", (req, res) => {
  const items = readItems();
  const updatedItems = items.filter(
    item => item.id !== req.params.id
  );

  saveItems(updatedItems);
  res.json({ message: "Item deleted successfully" });
});

app.listen(PORT, () => {
  console.log("Server running on port 5000");
});
