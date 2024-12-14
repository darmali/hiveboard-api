import Express, { json, urlencoded } from "express";
import productsRouter from "./routes/products/index.js";
import authRoutes from "./routes/auth/index.js";
import orderRoutes from "./routes/orders/index.js";
import projectsRouter from "./routes/projects/index.js";
import groupsRouter from "./routes/groups/index.js";
import serverless from "serverless-http";
import tasksRouter from "./routes/tasks/index.js";
const app = Express();
const port = 3000;

app.use(urlencoded({ extended: false }));
app.use(json());

app.get("/", (req, res) => {
  res.send("hiVe-Board!!");
});

app.use("/auth", authRoutes);
app.use("/projects", projectsRouter);
app.use("/groups", groupsRouter);
app.use("/tasks", tasksRouter);
if (process.env.NODE_ENV === "dev") {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

export const handler = serverless(app);
