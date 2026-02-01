const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());

const frontEndPath = path.join(__dirname, "../front-end");
console.log("Serving static files from:", frontEndPath);

if (!fs.existsSync(frontEndPath)) {
  console.error("ERROR: Front-end folder not found at:", frontEndPath);
} else {
  console.log("Front-end folder found!");
}

app.get("/test", (req, res) => {
  res.json({ message: "Server is working!", frontEndPath });
});

app.use("/auth", authRoutes);

const pagesPath = path.join(frontEndPath, "pages");
if (fs.existsSync(pagesPath)) {
  console.log("Pages directory found!");
  const pagesFiles = fs.readdirSync(pagesPath);
  console.log("Available pages:", pagesFiles);
} else {
  console.error("ERROR: Pages directory not found!");
}

app.use(express.static(frontEndPath, {
  index: 'index.html',
  extensions: ['html', 'htm'],
  dotfiles: 'ignore'
}));

app.use((req, res) => {
  res.status(404).send(`
    <h1>404 - Page Not Found</h1>
    <p>Requested path: ${req.path}</p>
    <p>Available pages:</p>
    <ul>
      <li><a href="/">/ (index.html)</a></li>
      <li><a href="/pages/LoggingIn.html">/pages/LoggingIn.html</a></li>
      <li><a href="/pages/account.html">/pages/account.html</a></li>
      <li><a href="/pages/admin.html">/pages/admin.html</a></li>
    </ul>
  `);
});

module.exports = app;
