const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cd) {
      cd(null, "uploads/");
    },
    filename: function (req, file, cd) {
      cd(null, file.originalname);
    },
  }),
});
const port = 8080;

app.use(express.json());
app.use(cors());

app.get("/products", (req, res) => {
  models.Products.findAll({
    order: [["createdAt", "DESC"]],
    attributes: ["id", "name", "price", "createdAt", "seller", "imageUrl"],
  })
    .then((result) => {
      console.log("겟 요청 결과값 : ", result);
      res.send({
        products: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.send("상품 조회에 에러가 발생했습니다.");
    });
});

app.post("/products", (req, res) => {
  const body = req.body;
  const { name, description, price, seller } = body;
  if (!name || !description || !price || !seller) {
    res.send("모든 값을 입력해주세요.");
  }
  models.Products.create({
    name,
    description,
    price,
    seller,
  })
    .then((result) => {
      console.log("상품 생성 결과 : ", result);
      res.send({
        result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.send("상품 업로드에 문제가 발생하였습니다.");
    });
});

app.get("/products/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  models.Products.findOne({
    where: {
      id: id,
    },
  })
    .then((result) => {
      console.log("PRODUCT : ", result);
      res.send({
        product: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.send("상품 조회에 에러가 발생했습니다.");
    });
});

app.post("/image", upload.single("image"), (req, res) => {
  const file = req.file;
  console.log(file);
  res.send({ imageUrl: file.path });
});

app.listen(port, () => {
  console.log("쇼핑몰 서버가 돌아가고 있습니다.");
  models.sequelize
    .sync()
    .then(() => {
      console.log("db 연결 성공");
    })
    .catch((error) => {
      console.error(error);
      console.log("db 연결 에러");
      process.exit();
    });
});