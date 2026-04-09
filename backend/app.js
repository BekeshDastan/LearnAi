require('dotenv').config(); 

const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const client = require("prom-client");

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require('./routes/course.routes');
const aiRoutes = require('./routes/ai.routes'); 

const app = express();

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
    registers: [register]
});

const httpRequestDurationSeconds = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [register]
});

const registrationsTotal = new client.Counter({
    name: "registrations_total",
    help: "Total registration attempts by result",
    labelNames: ["result"],
    registers: [register]
});

const coursesCreatedTotal = new client.Counter({
    name: "courses_created_total",
    help: "Total courses created",
    registers: [register]
});

const chaptersCreatedDurationSeconds = new client.Histogram({
    name: "chapters_created_duration_seconds",
    help: "Time spent creating chapters in seconds",
    buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 20],
    registers: [register]
});

const chaptersCreatedFastPercentage = new client.Gauge({
    name: "chapters_created_fast_percentage",
    help: "Percentage of chapters created in less than 10 seconds",
    registers: [register]
});

let totalChaptersCreated = 0;
let fastChaptersCreated = 0;

const normalizeRoutePath = (originalUrl) => {
    const cleanPath = originalUrl.split("?")[0];
    return cleanPath
    .replace(/\/[a-f\d]{24}(?=\/|$)/gi, "/:id")
    .replace(/\/\d+(?=\/|$)/g, "/:id");
};

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

app.use((req, res, next) => {
    if (req.path === "/metrics") {
        return next();
    }

    const start = process.hrtime.bigint();
    const rawPath = (req.originalUrl || req.url).split("?")[0];
    const end = httpRequestDurationSeconds.startTimer();
    const route = normalizeRoutePath(req.originalUrl || req.url);

    res.on("finish", () => {
        const elapsedSeconds = Number(process.hrtime.bigint() - start) / 1e9;
        const labels = {
            method: req.method,
            route,
            status_code: String(res.statusCode)
        };

        httpRequestsTotal.inc(labels);
        end(labels);

        if (req.method === "POST" && rawPath === "/auth/users") {
            const result = res.statusCode === 201 ? "success" : "failure";
            registrationsTotal.inc({ result });
        }

        if (req.method === "POST" && (rawPath === "/api/courses" || rawPath === "/api/courses/init")) {
            if (res.statusCode === 201) {
                coursesCreatedTotal.inc();
            }
        }

        if (req.method === "POST" && /^\/api\/courses\/[^/]+\/chapters$/.test(rawPath)) {
            if (res.statusCode === 201) {
                chaptersCreatedDurationSeconds.observe(elapsedSeconds);
                totalChaptersCreated++;
                if (elapsedSeconds < 10) {
                    fastChaptersCreated++;
                }
                if (totalChaptersCreated > 0) {
                    const percentage = (fastChaptersCreated / totalChaptersCreated) * 100;
                    chaptersCreatedFastPercentage.set(percentage);
                }
            }
        }
    });

    next();
});

app.get("/metrics", async (req, res) => {
    try {
        res.set("Content-Type", register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        res.status(500).end(error.message);
    }
});

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