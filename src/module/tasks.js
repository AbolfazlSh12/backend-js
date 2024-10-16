import { promises as fsPromises } from "fs";
import * as uuid from "uuid";

export const getTasks = async () => {
  try {
    await fsPromises.access("./data/tasks.json");
  } catch (err) {
    await fsPromises.writeFile("./data/tasks.json", "[]");
  }
  return JSON.parse(await fsPromises.readFile("./data/tasks.json"));
};

export const addTask = async (task) => {
  const tasks = await getTasks();
  tasks.push({ ...task, id: uuid.v4() });
  await fsPromises.writeFile("./data/tasks.json", JSON.stringify(tasks));
};

export const deleteTask = async (deleteId) => {
  const tasks = await getTasks();

  const newTasks = tasks.filter((task) => task.id !== deleteId);
  await fsPromises.writeFile("./data/tasks.json", JSON.stringify(newTasks));
};

export const updateTask = async (id, updatedTask) => {
  const tasks = await getTasks();
  const newTasks = tasks.map((task) =>
    task.id === id ? { ...task, ...updatedTask } : task
  );
  await fsPromises.writeFile("./data/tasks.json", JSON.stringify(newTasks));
};

export const assignTask = async (taskId, username) => {
  const tasks = await getTasks();
  const newTasks = tasks.map((task) =>
    task.id === taskId ? { ...task, assignee: username } : task
  );
  await fsPromises.writeFile("./data/tasks.json", JSON.stringify(newTasks));
};

export const unassignTask = async (taskId) => {
  const tasks = await getTasks();
  const newTasks = tasks.map((task) => {
    if (task.id === taskId) {
      delete task.assignee;
    }
    return task;
  });
  await fsPromises.writeFile("./data/tasks.json", JSON.stringify(newTasks));
};

export const getMyTasks = async (username) => {
  const tasks = await getTasks();
  const myTasks = tasks.filter((task) => task.assignee === username);
  return myTasks;
};
