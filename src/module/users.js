import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import * as uuid from "uuid";

const JWT_SECRET = "secret_task_manager";

const getUsers = () => {
  try {
    const data = fs.readFileSync("/data/users.json", "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveUsers = (users) => {
  fs.writeFileSync("/data/users.json", JSON.stringify(users, null, 2));
};

export const registerUser = async (username, password) => {
  const users = getUsers();

  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return { status: 400, error: "Username already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: uuid.v4(),
    username,
    password: hashedPassword,
  };

  users.push(newUser);
  saveUsers(users);

  return {
    status: 201,
    message: "User registered successfully",
    user: newUser,
  };
};

export const loginUser = async (username, password) => {
  const users = getUsers();

  const user = users.find((user) => user.username === username);
  if (!user) {
    return { status: 400, error: "Invalid username or password" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
};

export const getUserProfile = (id) => {
  const users = getUsers();

  const user = users.find((user) => user.id === id);
  if (!user) {
    return { status: 404, error: "User not found" };
  }

  const { password, ...userProfile } = user;

  return { status: 200, message: "User successfully found", user: userProfile };
};

/* export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}; */
