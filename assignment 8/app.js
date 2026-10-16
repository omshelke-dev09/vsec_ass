const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

// Connection URL for local MongoDB
const dbUrl = "mongodb://127.0.0.1:27017";
const client = new MongoClient(dbUrl);

let engineersCollection;

// Connect to MongoDB using Promises
client.connect()
    .then(() => {
        console.log("Database connection successful!");
        
        // Setup database and collection
        const database = client.db("UniversityDB");
        engineersCollection = database.collection("engineers");

        // Start the Express server only after DB is connected
        app.listen(5000, () => {
            console.log("Server is live on http://localhost:5000");
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
    });

// 1. GET - Fetch all engineers
app.get("/api/engineers", async (req, res) => {
    const allEngineers = await engineersCollection.find({}).toArray();
    res.json(allEngineers);
});

// 2. POST - Create a new engineer record
app.post("/api/engineers", async (req, res) => {
    const newRecord = req.body;
    const result = await engineersCollection.insertOne(newRecord);

    res.status(201).json({
        info: "Record added successfully",
        id: result.insertedId
    });
});

// 3. PUT - Update an engineer by their name
app.put("/api/engineers/:studentName", async (req, res) => {
    const nameToFind = req.params.studentName;
    const updatedData = req.body;

    const result = await engineersCollection.updateOne(
        { name: nameToFind }, 
        { $set: updatedData } 
    );

    if (result.matchedCount === 0) {
        return res.status(404).json({ error: "No student found with that name" });
    }

    res.json({ info: "Record updated successfully" });
});

// 4. DELETE - Remove an engineer by name
app.delete("/api/engineers/:studentName", async (req, res) => {
    const nameToFind = req.params.studentName;

    const result = await engineersCollection.deleteOne({ name: nameToFind });

    if (result.deletedCount === 0) {
        return res.status(404).json({ error: "No student found with that name" });
    }

    res.json({ info: "Record deleted successfully" });
});