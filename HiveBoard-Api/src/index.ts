import Express from "express";
import { productsRouter } from "./routes/products/index"
const app = Express();
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!!');
})

app.use('/products', productsRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})