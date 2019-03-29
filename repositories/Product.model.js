// Ta đồng thời phải tạo thư mục utils trong thư mục gốc, bên trong có index.js và db.js, tôi sẽ nhắc đến ở ngay dưới đoạn code này
import {queryBuilder} from "../utils";

/**
 * Hàm tìm kiếm Product, với sự giúp đỡ của Knex
 * @returns {Knex.QueryBuilder}
 */
export const getPage = async (input) => {
  let error = null;
  let total = [{TOTAL: 0}]
  let pIndex = 1; // Trang mặc định là trang 1
  let pSize = 20; // Mặc định lấy 20 kết quả /trang
  let productList = [];
  try {
    let filter = input || {};
    let {pageIndex, pageSize, name, supplier, status, code} = filter
    pIndex = parseInt(pageIndex, 10) || 1;
    pSize = parseInt(pageSize, 10) || 20;
    name = name ? name.trim() : "";
    let ret = queryBuilder("product").select(); // Query này để lấy dữ liệu của trang pIndex
    let counter = queryBuilder("product").count('* as TOTAL'); // Query này để đếm tổng
    let check = 0;
    // Mệnh đề WHERE query lấy dữ liệu và where của query đếm là giống nhau
    if (name) {
      check++;
      ret = ret.where('name', 'like', `%${name}%`);
      counter = counter.where('name', 'like', `%${name}%`);
    }
    if (code) {
      // Thủ thuật cần đến biến CHECK là, khi mà là điều kiện đầu tiên (check == 0)
      // thì ko cần dùng phép AND. Còn là điều kiện thứ N thì phải có AND
      if (check) {
        ret = ret.andWhere('product_code', 'like', `%${code}%`);
        counter = counter.andWhere('product_code', 'like', `%${code}%`);
      } else {
        ret = ret.where('product_code', 'like', `%${code}%`);
        counter = counter.where('product_code', 'like', `%${code}%`);
      }
      check++;
    }
    if (supplier) {
      if (check) {
        ret = ret.andWhere('supplier', 'like', `%${supplier}%`);
        counter = counter.andWhere('supplier', 'like', `%${supplier}%`);
      } else {
        ret = ret.where('supplier', 'like', `%${supplier}%`);
        counter = counter.where('supplier', 'like', `%${supplier}%`);
      }
      check++;
    }
    if (`${status}` === "1" || `${status}` === "0") {
      if (check) {
        ret = ret.andWhere({status: parseInt(status, 10)});
        counter = counter.andWhere({status: parseInt(status, 10)});
      } else {
        ret = ret.where({status: parseInt(status, 10)});
        counter = counter.where({status: parseInt(status, 10)});
      }
    }
    total = await counter; // Sử dụng async/await cho tính bất đồng bộ
    const dataCursor = await ret.limit(pSize).offset(pSize * (pIndex - 1));
    for (let i = 0; i < dataCursor.length; i++) {
      const {...filteredObj} = dataCursor[i];
      productList.push(filteredObj)
    }
  } catch (err) {
    error = err
  }
  return new Promise((resolve, reject) => {
    if (!error) {
      resolve({
        data: productList,
        total: total[0].TOTAL,
        pageIndex: pIndex,
        pageSize: pSize,
      })
    } else {
      reject(error)
    }
  })
}

/**
 * Tìm SP theo ID
 * @param id
 * @returns {Promise<any>}
 */
export function findById(id) {
  return new Promise((resolve, reject) => {
    queryBuilder("product").select().where({id}).then((data) => {
      if (data && data.length === 1) {
        resolve(data[0])
      } else {
        throw Error('no.data')
      }
    }).catch((ex) => {
      reject(ex)
    })
  })
}

/**
 * Tìm theo mã của sản phẩm
 * @param code
 * @returns {Knex.QueryBuilder}
 */
export function findByCode(code) {
  return queryBuilder("product").select().where({product_code: code})
}

/**
 * Xóa sản phẩm
 * @param id
 * @returns {Knex.QueryBuilder}
 */
export const deleteProduct = (id) => {
  return queryBuilder("product").delete().where({id})
}

/**
 * Tạo mới or update sản phẩm
 * @param payload
 */
export const upsertProduct = (payload) => {
  const {id, product_code, product_name, supplier, quantity} = payload;
  if (id) {
    const dataToUpdate = {}; // Chỉ lưu dữ liệu có nghĩa, và ko đc cập nhật product_code
    if (product_name && product_name.trim()) {
      dataToUpdate.product_name = product_name;
    }
    if (supplier && supplier.trim()) {
      dataToUpdate.supplier = supplier;
    }
    if (!isNaN(quantity) && Number(quantity) > 0) {
      dataToUpdate.quantity = Number(quantity);
    }
    return queryBuilder("product").update(dataToUpdate).where({id});
  } else {
    // Sau này add thêm logic check ko duplicate product_code nữa.
    return queryBuilder("product").insert({
      product_code, product_name, supplier, quantity
    });
  }
}
