import jwt from "jsonwebtoken";
import { registerUser, loginUser, getUserProfile } from "../module/users.js";
import { postDataHandler } from "../postDataHandler.js";

const secretKey = process.env.SECRET_KEY;

const routeUsersApis = async (req, res) => {
  let body = "";
  if (req.method === "POST") {
    body = await postDataHandler(req);
  }

  const sendResponse = (data, statusCode = 200) => {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(statusCode);
    res.end(JSON.stringify(data));
  };

  if (req.url === "/register" && req.method === "POST") {
    const { username, password, email } = JSON.parse(body || "{}");

    if (!username || !password || !email) {
      sendResponse(
        { error: "Parameter validation failed. Check your request data." },
        400
      );
      return;
    }

    const result = await registerUser(username, password, email);
    sendResponse(result, result.status);
  } else if (req.url.startsWith("/verifyEmail") && req.method === "GET") {
    const urlParams = new URL(req.url, `http://${req.headers.host}`);
    const token = urlParams.searchParams.get("token");

    const result = await verifyEmail(token);
    sendResponse(result, result.status);
  } else if (req.url === "/login" && req.method === "POST") {
    const { username, password } = JSON.parse(body);
    const result = await loginUser(username, password);
    sendResponse(result, result.status);
  } else if (req.url.startsWith("/profile") && req.method === "GET") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      sendResponse({ error: "Authorization token required" }, 401);
      return;
    }

    try {
      const decoded = jwt.verify(token, secretKey);
      const result = await getUserProfile(decoded.id);
      sendResponse(result, result.status);
    } catch (err) {
      sendResponse({ error: "Invalid or expired token" }, 403);
    }
  } else {
    sendResponse({ message: "Not Found" }, 404);
  }
};

export default routeUsersApis;
