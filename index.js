const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const http = require("http");
const dbConnection = require("./database/dbConnection");
const routes = require("./routes");

const app = express();
const server = http.createServer(app);

app.use(morgan("common"));
app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/test", (req,res) => {
  return res.send({ msg: "hasnain" });
});

app.use("/", routes);

server.listen(3000);
server.on("listening", () => {
  try {
    console.log("server is up...");
    dbConnection();
  } catch (error) {
    process.exit(1);
  }
});
