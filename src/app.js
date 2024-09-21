import { createServer } from "http";
import { parse } from "url";
import usersHandler from "./api/users.js";
import tasksHandler from "./api/tasks.js";

const PORT = 3000;

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  const path = parsedUrl.pathname;

  if (path.startsWith("/api/users")) {
    req.url = req.url.replace("/users", "");
    usersHandler(req, res);
  } else if (path.startsWith("/api/tasks")) {
    req.url = req.url.replace("/tasks", "");
    tasksHandler(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not Found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
