import Express, { json, urlencoded } from "express";
import productsRouter from "./routes/products/index.js";
import authRoutes from "./routes/auth/index.js";
import orderRoutes from "./routes/orders/index.js";
import projectsRouter from "./routes/projects/index.js";
import serverless from "serverless-http";

const app = Express();
const port = 3000;

app.use(urlencoded({ extended: false }));
app.use(json());

app.get("/", (req, res) => {
  res.send("hiVe-Board!!");
});

app.use("/auth", authRoutes);
app.use("/projects", projectsRouter);

if (process.env.NODE_ENV === "dev") {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

export const handler = serverless(app);
