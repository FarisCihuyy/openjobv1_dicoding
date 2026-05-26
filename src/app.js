require("dotenv").config();
const express = require("express");
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

const app = express();

const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 9000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/authentications", authRoutes);
app.use("/companies", companyRoutes);
app.use("/categories", categoryRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.use("/bookmarks", bookmarksRouter);
app.use("/profile", profileRoutes);

app.get("/", (req, res) => {
  return response(res, 200, "Welcome to OpenJob API", null);
});

app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

app.use(ErrorHandler);

app.listen(PORT, HOST, () => {
  console.log(`Running at http://${HOST}:${PORT}`);
});
