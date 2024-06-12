// require("dotenv/config");
const express = require("express");
const cors = require("cors");
const { join } = require("path");
const dotenv = require("dotenv").config({ path: join(__dirname, "./.env") });
const db = require("./models");
const bodyParser = require("body-parser");

const { authorize } = require("./middleware/validator");

const PORT = process.env.PORT || 8000;
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" },
});

global.io = io;

module.exports = { io };

// app.use(
//   cors({
//     origin: [
//       process.env.WHITELISTED_DOMAIN &&
//         process.env.WHITELISTED_DOMAIN.split(","),
//     ],
//   })
// );

// console.log(process.env.WHITELISTED_DOMAIN);

app.use(
  cors({
    origin: "https://jcwdol-0904-galaxystore.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static(join(__dirname, "public/images")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//#region API ROUTES

// ===========================
// NOTE : Add your routes here
const {
  authRouter,
  userRouter,
  addressRouter,
  warehouseRouter,
  nearestWarehouseRouter,
  productRouters,
  rajaongkirRouter,
  cartRouter,
  ekpedisiRouter,
  orderRouter,
  promotionRouter,
  tokenValidatorRouter,
  uploadProfileRouter,
  mutationRouter,
  categoryRouters,
  notificationRouter,
  stockRouter,
  migrationRouter,
  transactionRouter,
  stockHistoryRouter,
  dashboardRouter,
} = require("./routers");

app.use("/api", authorize);
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/addresses", addressRouter);
app.use("/api/warehouses", warehouseRouter);
app.use("/api/nearest-warehouse", nearestWarehouseRouter);
app.use("/api/product", productRouters);
app.use("/api/rajaongkir", rajaongkirRouter);
app.use("/api/cart", cartRouter);
app.use("/api/ekspedisi", ekpedisiRouter);
app.use("/api/promotion", promotionRouter);
app.use("/api/order", orderRouter);
app.use("/api/auth", tokenValidatorRouter);
app.use("/api/upload", uploadProfileRouter);
app.use("/api/mutation", mutationRouter);
app.use("/api/category", categoryRouters);
app.use("/api/notification", notificationRouter);
app.use("/api/stock", stockRouter);
app.use("/api/migration", migrationRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/stock-history", stockHistoryRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(function (err, req, res, next) {
  if (err.code === "LIMIT_FILE_SIZE") {
    res.status(500).send({
      // result: "fail",
      // error: { code: 1001, message: "File is too big" },
      message: "File is too big",
    });
    return;
  }
});

app.get("/api", (req, res) => {
  res.send(`Hello, this is my API`);
});

app.get("/api/greetings", (req, res, next) => {
  res.status(200).json({
    message: "Hello, Student !",
  });
});

// ===========================

//#region CLIENT
const clientPath = "../../client/build";
app.use(express.static(join(__dirname, clientPath)));

// Serve the HTML page
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, clientPath, "index.html"));
});

//#endregion

// not found
app.use((req, res, next) => {
  if (req.path.includes("/api/")) {
    res.status(404).send("Not found !");
  } else {
    next();
  }
});

// error
app.use((err, req, res, next) => {
  if (req.path.includes("/api/")) {
    console.error("Error : ", err.stack);
    res.status(500).send("Error !");
  } else {
    next();
  }
});

//#endregion

io.on("connection", (socket) => {
  console.log("A client connected");

  //   // Handle client disconnection
  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });

  //   // Listen for transaction updates
  socket.on("transaction-update", (updatedTransaction) => {
    console.log("Received transaction update:", updatedTransaction);
  });
});

server.listen(PORT, (err) => {
  if (err) {
    console.log(`ERROR: ${err}`);
  } else {
    // db.sequelize.sync({ alter: true });
    console.log(`APP RUNNING at ${PORT} ✅`);
  }
});

module.exports = app;
