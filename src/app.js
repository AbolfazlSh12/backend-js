import * as http from "http";
import { parse } from "url";
import usersHandler from "./api/users.js";
import tasksHandler from "./api/tasks.js";

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = parse(req.url, true);
    const path = parsedUrl.pathname;

    if (path.startsWith("/users")) {
      req.url = req.url.replace("/users", "");
      usersHandler(req, res);
    } else if (path.startsWith("/tasks")) {
      req.url = req.url.replace("/tasks", "");
      tasksHandler(req, res);
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Not Found" }));
    }
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end("Server error!");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
