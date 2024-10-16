import path from "path";
import * as uuid from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { sendEmail } from "./sendEmail.js";
import { promises as fsPromises } from "fs";

const secretKey = process.env.SECRET_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, "../../data/users.json");

export const getUsers = async () => {
  try {
    await fsPromises.access(usersFilePath);
  } catch (err) {
    await fsPromises.writeFile(usersFilePath, "[]");
  }

  try {
    const data = await fsPromises.readFile(usersFilePath, "utf8");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error parsing JSON:", err);
    return [];
  }
};

const saveUsers = async (users) => {
  await fsPromises.writeFile(usersFilePath, JSON.stringify(users, null, 2));
};

export const registerUser = async (username, email, password) => {
  const users = await getUsers();

  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return { status: 400, error: "Username already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const registerCode = Math.floor(100000 + Math.random() * 900000);

  const newUser = {
    id: uuid.v4(),
    username,
    password: hashedPassword,
    registerCode,
    active: false,
  };

  users.push(newUser);
  await saveUsers(users);

  await sendEmail({
    to: email,
    subject: "Register To My App !",
    text: registerCode,
  });

  return {
    status: 201,
    message:
      "User registered successfully. Please check your email to verify your account.",
  };
};

export const verifyEmail = async (token) => {
  const users = await getUsers();

  const user = users.find((user) => user.verificationToken === token);
  if (!user) {
    return { status: 400, error: "Invalid or expired token" };
  }

  user.verified = true;
  user.verificationToken = null; // Remove the token once verified
  saveUsers(users);

  return { status: 200, message: "Email successfully verified" };
};

export const loginUser = async (username, password) => {
  const users = await getUsers();

  const user = users.find((user) => user.username === username);
  if (!user) {
    return { status: 400, error: "Invalid username or password" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, secretKey, {
    expiresIn: "1h",
  });

  res.json({ token });
};

export const getUserProfile = async (id) => {
  const users = await getUsers();

  const user = users.find((user) => user.id === id);
  if (!user) {
    return { status: 404, error: "User not found" };
  }

  const { password, ...userProfile } = user;

  return { status: 200, message: "User successfully found", user: userProfile };
};
