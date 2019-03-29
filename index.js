import express from "express";

// Thêm code:
import cors from "cors";
const bodyParser = require('body-parser');
import { ProductService } from "./services"

const APP = express();
APP.use(cors()); // Để gọi từ POSTMAN đc
APP.use([
  bodyParser.json(),
  bodyParser.urlencoded({
    extended: true,
  })
]); // BODY PARSER giúp ta nhận được dữ liệu kiểu POST,PUT thông qua payload.

APP.get('/', (req, res) => {
  console.log('REQUEST AT ROOT...');
  res.json({ status: true });
});
// THÊM: ProductService sẽ handle những request truy cập vào URL: /api/product
APP.use("/api/product", ProductService);

APP.listen(8082, () => {
  console.log('SERVER IS LISTENING AT PORT 8082');
});
