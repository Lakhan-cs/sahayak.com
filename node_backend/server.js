require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });
const http = require("http");
const app = require("./app");
const connectDB = require("./config/dbconnect");
const setupMessaging = require("./messaging");

const port = Number(process.env.PORT || 3001);
const httpServer = http.createServer(app);
setupMessaging(httpServer);

(async () => {
  await connectDB();
  httpServer.listen(port, () => {
    console.log(`Sahayak Node server running at http://127.0.0.1:${port}`);
    console.log(
      `Flask AI target: ${process.env.FLASK_BASE_URL || "http://127.0.0.1:5000"}`,
    );
  });
})();
