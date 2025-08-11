const express = require("express");
const corsMiddleware = require("./config/cors");
const app = express();
const { swaggerUi, specs } = require("./config/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use(corsMiddleware);
app.use(express.json());
const connectDB = require("./config/db");
const routes = require("./api/routes/index");
const path = require("path");
connectDB();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({
    message: err.message || "Server Error",
  });
});

app.use("/api", routes);
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
