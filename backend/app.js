require('dotenv').config(); 

const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require('./routes/course.routes');
const aiRoutes = require('./routes/ai.routes'); 

const app = express();

// const frontEndPath = path.resolve(__dirname, "../front-end");
// const indexPath = path.join(frontEndPath, "index.html");

// console.log("--- System Check ---");
// console.log("Looking for Front-end at:", frontEndPath);

// if (!fs.existsSync(frontEndPath)) {
//     console.error("❌ ERROR: Front-end directory NOT found!");
// } else {
//     console.log("✅ Front-end directory found!");
// }

app.use(cors());
app.use(express.json());

// app.use(express.static(frontEndPath));

// app.get("/test", (req, res) => {
//     res.json({ message: "Server is working!", path: frontEndPath });
// });

app.use("/auth", authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/ai', aiRoutes); 


// app.get("/", (req, res) => {
//     if (fs.existsSync(indexPath)) {
//         res.sendFile(indexPath);
//     } else {
//         res.status(404).send("index.html not found in front-end folder");
//     }
// });

app.use((req, res) => {
    console.log(`404 error at: ${req.url}`);
    res.status(404).send("<h1>404 - Page Not Found</h1>");
});

module.exports = app;