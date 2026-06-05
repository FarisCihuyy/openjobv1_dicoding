require("dotenv").config();
const express = require("express");
const path = require("path");
const ErrorHandler = require("./api/middlewares/error");
const { NotFoundError } = require("./exceptions");
const response = require("./utils/response");

const userRoutes = require("./api/routes/user.route");
const authRoutes = require("./api/routes/auth.route");
const companyRoutes = require("./api/routes/company.route");
const categoryRoutes = require("./api/routes/category.route");
const jobRoutes = require("./api/routes/job.route");
const applicationRoutes = require("./api/routes/application.route");
const { bookmarksRouter } = require("./api/routes/bookmark.route");
const profileRoutes = require("./api/routes/profile.route");
const documentRoutes = require("./api/routes/document.route");
const { connectRedis } = require("./redis");
const { connectRabbitMQ } = require("./rabbitmq/producer");

const app = express();

const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 9000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/users", userRoutes);
app.use("/authentications", authRoutes);
app.use("/companies", companyRoutes);
app.use("/categories", categoryRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.use("/bookmarks", bookmarksRouter);
app.use("/profile", profileRoutes);
app.use("/documents", documentRoutes);

app.get("/", (req, res) => {
  return response(res, 200, "Welcome to OpenJob API", null);
});

app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

app.use(ErrorHandler);

const start = async () => {
  try {
    await connectRedis();
    await connectRabbitMQ();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
