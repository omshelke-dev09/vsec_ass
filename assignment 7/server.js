const express = require("express");
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// In-memory array acting as our database
let users = [
    { id: 101, name: "Amit", score: 82 },
    { id: 102, name: "Pooja", score: 89 },
    { id: 103, name: "Karan", score: 76 }
];

// 1. GET - Fetch all users
app.get("/api/users", (req, res) => {
    res.status(200).json(users);
});

// 2. POST - Add a new user
app.post("/api/users", (req, res) => {
    const newUser = req.body;
    
    users.push(newUser);

    res.status(201).json({
        info: "User successfully created",
        data: newUser
    });
});

// 3. PUT - Update an existing user by ID
app.put("/api/users/:id", (req, res) => {
    const searchId = parseInt(req.params.id);
    
    const index = users.findIndex(u => u.id === searchId);

    if (index !== -1) {
        users[index].name = req.body.name;
        users[index].score = req.body.score;

        res.json({
            info: "User updated successfully",
            data: users[index]
        });
    } else {
        res.status(404).send("User not found in the system");
    }
});

// 4. DELETE - Remove a user by ID
app.delete("/api/users/:id", (req, res) => {
    const searchId = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === searchId);

    if (index !== -1) {
        users.splice(index, 1); 
        res.send("User deleted successfully");
    } else {
        res.status(404).send("User not found in the system");
    }
});

// Start the server on port 8080
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is live on http://localhost:${PORT}`);
});