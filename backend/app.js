require('dotenv').config(); 

const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const client = require('prom-client');

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require('./routes/course.routes');
const aiRoutes = require('./routes/ai.routes'); 

const app = express();

// const frontEndPath = path.resolve(__dirname, "../front-end");
// const indexPath = path.join(frontEndPath, "index.html");

// console.log("--- System Check ---");
// console.log("Looking for Front-end at:", frontEndPath);

// if (!fs.existsSync(frontEndPath)) {
//      console.error(" ERROR: Front-end directory NOT found!");
// } else {
//      console.log(" Front-end directory found!");
// }



// Metrics registry
const register = new client.Registry();

// Default metrics such as CPU RAM ...
client.collectDefaultMetrics({ register });

// Custom metrics
// HTTPREQUESTS
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

// AVERAGE RESPONSE LATENCY
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'], 
  buckets: [0.1, 1, 5, 15, 30, 60, 120, 300],
  registers: [register]
});
// REGISTRATION COUNTER
const registrationsTotal = new client.Counter({
    name: "registrations_total",
    help: "Total registration attempts by result",
    labelNames: ["result"], 
    registers: [register]
});

const coursesCreatedTotal = new client.Counter({
    name: "courses_created_total",
    help: "Total courses successfully created",
    registers: [register]
});

const normalizeRoutePath = (url) => {
    let cleanPath = url.split("?")[0];
    if (cleanPath.endsWith('/') && cleanPath.length > 1) {
        cleanPath = cleanPath.slice(0, -1);
    }
    return cleanPath
        .replace(/\/[a-f\d]{24}(?=\/|$)/gi, "/:id") 
        .replace(/\/\d+(?=\/|$)/g, "/:id");        
};

// CREATION COUNTER
const customerCreationTotal = new client.Counter({
  name: 'customer_creation_success_total',
  help: 'Total number of successful customer creations',
  registers: [register]
});

registrationsTotal.inc({ result: "success" }, 0);
registrationsTotal.inc({ result: "failure" }, 0);
coursesCreatedTotal.inc(0);
customerCreationTotal.inc(0);

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    if (req.path === "/metrics") return next();

    const end = httpRequestDurationSeconds.startTimer();
    const route = normalizeRoutePath(req.originalUrl || req.url);

    res.on("finish", () => {
        const labels = {
            method: req.method,
            route,
            status_code: String(res.statusCode)
        };

        end(labels);
        httpRequestsTotal.inc({ method: req.method, route, status: String(res.statusCode) });

        if (req.method === "POST" && route.includes("/auth/users")) {
            const result = res.statusCode === 201 ? "success" : "failure";
            registrationsTotal.inc({ result });
        }

        if (req.method === "POST" && route.includes("/api/ai/") && route.includes("/confirm")) {
            if (res.statusCode === 201 || res.statusCode === 200) {
                coursesCreatedTotal.inc();
            }
        }
    });
    
    next(); 
});

app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', client.register.contentType);
  
  const mergedMetrics = await client.Registry.merge([register, client.register]).metrics();
  
  res.send(mergedMetrics);
});

// app.use(express.static(frontEndPath));

// app.get("/test", (req, res) => {
//      res.json({ message: "Server is working!", path: frontEndPath });
// });

app.use("/auth", authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/ai', aiRoutes); 


// app.get("/", (req, res) => {
//      if (fs.existsSync(indexPath)) {
//          res.sendFile(indexPath);
//      } else {
//          res.status(404).send("index.html not found in front-end folder");
//      }
// });


app.use((req, res) => {
    console.log(`404 error at: ${req.url}`);
    res.status(404).send("<h1>404 - Page Not Found</h1>");
});

module.exports = app;