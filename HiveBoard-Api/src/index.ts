import Express, { json, urlencoded } from "express";
import productsRouter from "./routes/products/index.js";
import authRoutes from "./routes/auth/index.js";
const app = Express();
const port = 3000;

app.use(urlencoded({ extended: false }));
app.use(json());

app.get("/", (req, res) => {
  res.send("Hello World!!");
});

app.use("/products", productsRouter);
app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
