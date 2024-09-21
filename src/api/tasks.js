import {
  getTasks,
  addTask,
  deleteTask,
  updateTask,
  assignTask,
  unassignTask,
} from "../module/tasks.js";
import { postDataHandler } from "../postDataHandler.js";

const routeTasksApis = async (req, res) => {
  let body = "";
  if (req.method === "POST" || req.method === "DELETE") {
    body = await postDataHandler(req);
  }

  const sendResponse = (data, statusCode = 200) => {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(statusCode);
    res.end(JSON.stringify(data));
  };

  const routes = {
    "/add": async () => {
      const task = JSON.parse(body, (key, value) =>
        key === "deadline" ? new Date(value) : value
      );
      await addTask(task);
      const tasks = await getTasks();
      sendResponse(tasks);
    },
    "/update": async () => {
      const { id, updatedTask } = JSON.parse(body);
      await updateTask(id, updatedTask);
      sendResponse({ status: "ok" });
    },
    "/delete": async () => {
      const { id } = JSON.parse(body);
      const newTasks = await deleteTask(id);
      sendResponse(newTasks);
    },
    "/assignTask": async () => {
      const { id, username } = JSON.parse(body);
      await assignTask(id, username);
      sendResponse({ status: "ok" });
    },
    "/unassignTask": async () => {
      const { id } = JSON.parse(body);
      await unassignTask(id);
      sendResponse({ status: "ok" });
    },
  };

  if (routes[req.url] && (req.method === "POST" || req.method === "DELETE")) {
    await routes[req.url]();
  } else {
    sendResponse({ message: "Not Found" }, 404);
  }
};

export default routeTasksApis;
