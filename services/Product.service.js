import {Router} from "express";
import {deleteProduct, getPage, upsertProduct, findById} from "../repositories/Product.model";
const router = Router();

/**
 * Tìm kiếm products theo tiêu chí tìm kiếm, hiện support tìm theo code, tên, trạng thái, nhà cung cấp
 * @searchby code, name, supplier, status
 */
router.get('/search', (req, res) => {
  const {code, name, status, supplier, pageIndex, pageSize} = req.query;
  getPage({pageIndex, pageSize, code, name, status, supplier}).then((data) => {
    res.send(data);
  }).catch((ex) => {
    console.log("Error happened", ex);
    res.send({ status: false, message: "Có lỗi khi tìm kiếm sản phẩm" });
  })
});

router.post('/create', (req, res) => {
  const payload = req.body;
  const {product_code, product_name, supplier, quantity} = payload;
  upsertProduct({product_code, product_name, supplier, quantity}).then(() => {
    res.send({ status: true, message: 'INSERT THANH CONG'});
  }).catch((ex) => {
    console.log("Error happened when create SP", ex);
    res.send({ status: false, message: "Có lỗi khi tạo sản phẩm" });
  })
})

router.put('/update/:id', (req, res) => {
  const payload = req.body;
  const {id} = req.params;
  if (!id) {
    res.send({
      status: false,
      message: "Bạn chưa điền vào ID để update",
    });
    return;
  }
  const {product_code, product_name, supplier, quantity} = payload;
  upsertProduct({product_code, product_name, supplier, quantity, id}).then(() => {
    res.send({ status: true, message: 'UPDATE THANH CONG'});
  }).catch((ex) => {
    console.log("Error happened when update SP", ex);
    res.send({ status: false, message: "Có lỗi khi update sản phẩm" });
  })
})

router.delete('/delete/:id', (req, res) => {
  const {id} = req.params; // params là đối tượng lấy tham số từ URL
  if (!id) {
    res.send({
      status: false,
      message: "Bạn chưa điền vào ID để xóa",
    });
    return;
  }
  deleteProduct(id).then(() => {
    res.send({
      status: true,
      message: "Xóa thành công",
    })
  }).catch((e) => {
    console.log("DELETEPRODUCT: ", e);
    res.send({
      status: true,
      message: "Xóa lỗi",
    });
  })
})

router.get('/detail/:id', (req, res) => {
  const {id} = req.params;
  if (!id) {
    res.send({
      status: false,
      message: "Bạn chưa điền vào ID để xóa",
    });
    return;
  }
  findById(id).then(data => {
    res.send({
      status: true,
      data,
    })
  }).catch((ex) => {
    console.log("VIEW PRODUCT: ", ex);
    res.send({
      status: true,
      message: "Lỗi khi lấy dữ liệu của sản phẩm",
    });
  })
})
export default router;
