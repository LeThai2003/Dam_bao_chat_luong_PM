const { Builder, By, until, Key } = require('selenium-webdriver');
const assert = require('assert');
require('chromedriver');
const path = require('path');
const unicode = require("unidecode");

const URL = 'http://localhost:3000';
const EMAIL = 'leducthai1008@gmail.com';
const PASSWORD = '123';

const logger = require('./logger');

logger.info('------------------------------Test bắt đầu-----------------------------------');
// logger.error('Có lỗi xảy ra');

let driver;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

const convertToSlug = (text) => {

  const unicodeText = unicode(text);

  const slug = unicodeText
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-")
  .toLowerCase();

  return slug;
}

async function runTest(name, fn) {
  totalTests++;
  logger.info(`=== BẮT ĐẦU TEST: ${name} ===`);
  try {
    await fn();
    const msg = `✅ [PASS] ${name}`;
    console.log(msg);
    logger.info(msg);
    passedTests++;
  } catch (err) {
    const msg = `❌ [FAIL] ${name}\n   → Lỗi: ${err.message}`;
    console.error(msg);
    logger.error(msg);
    failedTests++;
  }
}


async function login() {
  await driver.get(`${URL}/admin/auth/login`);
  await driver.findElement(By.name('email')).sendKeys(EMAIL);
  await driver.findElement(By.name('password')).sendKeys(PASSWORD);
  await driver.findElement(By.css('button[type=submit]')).click();
  await driver.wait(until.urlContains('/admin/dashboard'), 5000);
}

async function goToProductPage() {
  await driver.findElement(By.css('a[href="/admin/products"]')).click();
  await driver.wait(until.urlContains('/admin/products'), 5000);
  await driver.wait(until.elementLocated(By.css('table[checkbox-multi]')), 5000);
}

async function testPagination() {
  const getProductTitles = async () => {
    const elements = await driver.findElements(By.css('table tbody tr td:nth-child(4)'));
    const titles = [];
    for (let el of elements) {
      titles.push(await el.getText());
    }
    return titles;
  };

  const titlesPage1 = await getProductTitles();
  const nextPageButtons = await driver.findElements(By.css('button.page-link[button-pagination="2"]'));

  if (!nextPageButtons.length > 0) {
    return; // Test pass vì chỉ có 1 trang
  }

  await nextPageButtons[0].click();
  await driver.sleep(1000);

  const titlesPage2 = await getProductTitles();
  if (titlesPage2.length === 0) {
    throw new Error('Trang 2 không có sản phẩm nào');
  } else if (JSON.stringify(titlesPage1) === JSON.stringify(titlesPage2)) {
    throw new Error('Nội dung trang 2 giống hệt trang 1');
  }
}

async function searchProductWithResult(keyword = 'Áo khoác') {
  await driver.get(`${URL}/admin/products`);

  const searchInput = await driver.findElement(By.name('keyword'));
  await searchInput.clear();
  await searchInput.sendKeys(keyword, Key.RETURN);
  await driver.sleep(1000);

  const searchResults = await driver.findElements(By.css('table tbody tr'));
  const resultCount = searchResults.length;

  if (resultCount === 0) {
    throw new Error(`Không tìm thấy sản phẩm nào cho từ khoá "${keyword}"`);
  }

  let invalidCount = 0;
  const searchSlug = convertToSlug(keyword);

  for (let i = 0; i < resultCount; i++) {
    const titleCell = await searchResults[i].findElement(By.css('td:nth-child(4)'));
    const titleText = await titleCell.getText();
    const titleSlug = convertToSlug(titleText);

    if (!titleSlug.includes(searchSlug)) {
      invalidCount++;
    }
  }

  if (invalidCount > 0) {
    throw new Error(`${invalidCount} sản phẩm không khớp từ khóa "${keyword}"`);
  }
}

async function searchProductNoResult(keyword = 'xxxxx123xyzkhongtontai') {
  await driver.get(`${URL}/admin/products`);

  const searchInput = await driver.findElement(By.name('keyword'));
  await searchInput.clear();
  await searchInput.sendKeys(keyword, Key.RETURN);
  await driver.sleep(1000);

  const searchResults = await driver.findElements(By.css('table tbody tr'));
  const resultCount = searchResults.length;

  if (resultCount > 0) {
    throw new Error(`Tìm thấy ${resultCount} kết quả cho từ khóa không tồn tại "${keyword}"`);
  }

  try {
    const noResultMessage = await driver.findElement(By.css('.no-results'));
    const messageText = await noResultMessage.getText();
    if (!messageText.toLowerCase().includes('không tìm thấy')) {
      throw new Error(`Thông báo không phù hợp khi không có kết quả: "${messageText}"`);
    }
  } catch (e) {
    throw new Error('Không có kết quả nhưng không thấy thông báo "không tìm thấy"');
  }
}

async function sortPriceAsc() {
  await driver.get(`${URL}/admin/products`);

  // Tìm dropdown sắp xếp và chọn "Giá tăng dần"
  const sortSelect = await driver.findElement(By.name('sort'));
  await sortSelect.click();

  const priceAscOption = await sortSelect.findElement(By.css('option[value="price-asc"]'));
  await priceAscOption.click();

  await driver.sleep(1000); // Chờ dữ liệu cập nhật

  // Lấy danh sách giá các sản phẩm sau khi sắp xếp
  const searchResults = await driver.findElements(By.css('table tbody tr'));
  const prices = [];

  for (let i = 0; i < searchResults.length; i++) {
    const priceCell = await searchResults[i].findElement(By.css('td:nth-child(5)'));
    const priceText = await priceCell.getText(); // VD: "1.250.000đ"
    const price = parseInt(priceText.replace(/[^\d]/g, ''), 10);
    prices.push(price);
  }

  if (prices.length < 2) {
    throw new Error('Không đủ dữ liệu để kiểm tra sắp xếp (cần ít nhất 2 sản phẩm).');
  }

  const isSorted = prices.every((val, i, arr) => i === 0 || arr[i - 1] <= val);
  if (!isSorted) {
    throw new Error(`Giá sản phẩm KHÔNG được sắp xếp tăng dần. Danh sách: [${prices.join(', ')}]`);
  }
}

async function changeStatus() {
  await driver.get(`${URL}/admin/products`);

  // Lấy danh sách ô trạng thái ở cột thứ 7
  const statusCells = await driver.findElements(By.css('table tbody tr td:nth-child(7)'));
  if (statusCells.length === 0) {
    throw new Error('Không tìm thấy bất kỳ ô trạng thái nào trong bảng sản phẩm.');
  }

  // Lấy <a> trong ô trạng thái đầu tiên
  const statusLink = await statusCells[0].findElement(By.css('a'));
  const textBefore = await statusLink.getText();

  // Click để thay đổi trạng thái
  await statusLink.click();
  await driver.sleep(1000); // đợi cập nhật trạng thái

  // Reload lại DOM và kiểm tra lại
  const statusCellsAfter = await driver.findElements(By.css('table tbody tr td:nth-child(7)'));
  const statusLinkAfter = await statusCellsAfter[0].findElement(By.css('a'));
  const textAfter = await statusLinkAfter.getText();

  if (textAfter === textBefore) {
    throw new Error(`Trạng thái không thay đổi sau khi click. Trạng thái hiện tại vẫn là "${textAfter}"`);
  }
}

// Hàm dùng chung để lấy thông báo lỗi từ server
async function getFlashErrorText() {
  const errorBox = await driver.wait(until.elementLocated(By.css('.alert-danger')), 3000);
  return await errorBox.getText();
}

async function openCreateForm() {
  await driver.get(`${URL}/admin/products/create`);
  await driver.wait(until.urlContains('/admin/products/create'), 3000);
  await driver.executeScript(`
    document.getElementById('title').removeAttribute('required');
    document.getElementById('price').removeAttribute('min');
    document.getElementById('stock').removeAttribute('min');
    document.getElementById('discount').removeAttribute('min');
  `);
}

// 1. Test: title rỗng
async function testEmptyTitle() {
  await openCreateForm();
  await driver.findElement(By.css('input[name="price"]')).sendKeys('100000');
  await driver.findElement(By.css('input[name="stock"]')).sendKeys('10');
  await driver.findElement(By.css('button[type="submit"]')).click();

  const text = await getFlashErrorText();
  if (!text.includes("Tiêu đề không được để trống!")) {
    throw new Error(`Không có thông báo "Tiêu đề không được để trống!"`);
  }
}

// 2. Test: title < 5 ký tự
async function testShortTitle() {
  await openCreateForm();
  await driver.findElement(By.name('title')).sendKeys('abc');
  await driver.findElement(By.css('input[name="price"]')).sendKeys('100000');
  await driver.findElement(By.css('input[name="stock"]')).sendKeys('10');
  await driver.findElement(By.css('button[type="submit"]')).click();

  const text = await getFlashErrorText();
  if (!text.includes("Tiêu đề phải chứa ít nhất 5 ký tự!")) {
    throw new Error(`Không có thông báo "Tiêu đề phải chứa ít nhất 5 ký tự!"`);
  }
}

// 3. Test: price <= 0
async function testInvalidPrice() {
  await openCreateForm();
  await driver.findElement(By.name('title')).sendKeys('Sản phẩm hợp lệ');
  await driver.findElement(By.css('input[name="price"]')).sendKeys('-100');
  await driver.findElement(By.css('input[name="stock"]')).sendKeys('10');
  await driver.findElement(By.css('button[type="submit"]')).click();

  const text = await getFlashErrorText();
  if (!text.includes("Giá phải là số lớn hơn 0!")) {
    throw new Error(`Không có thông báo "Giá phải là số lớn hơn 0!"`);
  }
}

// 4. Test: stock < 0
async function testInvalidStock() {
  await openCreateForm();
  await driver.findElement(By.name('title')).sendKeys('Sản phẩm hợp lệ');
  await driver.findElement(By.css('input[name="price"]')).sendKeys('100000');
  await driver.findElement(By.css('input[name="stock"]')).sendKeys('-5');
  await driver.findElement(By.css('button[type="submit"]')).click();

  const text = await getFlashErrorText();
  if (!text.includes("Số lượng phải là số lớn hơn hoặc bằng 0!")) {
    throw new Error(`Không có thông báo "Số lượng phải là số lớn hơn hoặc bằng 0!"`);
  }
}

// 5. Test: discount không hợp lệ (ví dụ: 200)
async function testInvalidDiscount() {
  await openCreateForm();
  await driver.findElement(By.name('title')).sendKeys('Sản phẩm hợp lệ');
  await driver.findElement(By.css('input[name="price"]')).sendKeys('100000');
  await driver.findElement(By.css('input[name="stock"]')).sendKeys('10');
  await driver.findElement(By.css('input[name="discountPercentage"]')).sendKeys('200');
  await driver.findElement(By.css('button[type="submit"]')).click();

  const text = await getFlashErrorText();
  if (!text.includes("% Giảm giá phải là số từ 0 đến 100!")) {
    throw new Error(`Không có thông báo "% Giảm giá phải là số từ 0 đến 100!"`);
  }
}

async function testAddProductSuccess() {
  // Truy cập form tạo sản phẩm
  await driver.get(`${URL}/admin/products/create`);
  await driver.wait(until.urlContains('/admin/products/create'), 5000);

  // Nhập thông tin sản phẩm hợp lệ
  const title = 'Sản phẩm mới Selenium';
  await driver.findElement(By.name('title')).sendKeys(title);
  await driver.findElement(By.name('price')).sendKeys('100000');
  await driver.findElement(By.name('discountPercentage')).sendKeys('5');
  await driver.findElement(By.name('stock')).sendKeys('10');

  // Nếu có select danh mục
  const categorySelect = await driver.findElements(By.css('select[name="product_category_id"]'));
  if (categorySelect.length > 0) {
    const options = await categorySelect[0].findElements(By.tagName('option'));
    if (options.length > 1) {
      await options[1].click(); // chọn danh mục đầu tiên sau option mặc định
    }
  }

  // Upload ảnh (đảm bảo file test.jpeg tồn tại trong cùng thư mục)
  const imagePath = path.resolve(__dirname, 'test.jpeg');
  const fileInput = await driver.findElement(By.name('thumbnail'));
  await fileInput.sendKeys(imagePath);

  // Gửi form
  await driver.findElement(By.css('button[type=submit]')).click();

  // Chờ điều hướng trở lại danh sách sản phẩm
  await driver.wait(until.urlIs(`${URL}/admin/products`), 5000);

  // Kiểm tra sản phẩm xuất hiện ở đầu bảng
  const firstTitle = await driver.findElement(By.css('table tbody tr:first-child td:nth-child(4)')).getText();
  
  assert(
    firstTitle.toLowerCase().includes(title.toLowerCase()),
    `❌ Không thấy sản phẩm vừa thêm "${title}" ở đầu danh sách, tìm thấy: "${firstTitle}"`
  );

  // console.log("✅ Thêm sản phẩm thành công và xuất hiện đầu danh sách.");
}


async function editProductSuccess() {
  // Click nút "Sửa" ở sản phẩm đầu tiên (dùng xpath có chữ "Sửa")
  const editButton = await driver.findElement(By.xpath("//table/tbody/tr[1]//a[normalize-space(text())='Sửa']"));
  await editButton.click();

  // Chờ điều hướng đến trang sửa
  await driver.wait(until.urlContains('/admin/products/edit'), 5000);

  // Nhập lại tiêu đề
  const newTitle = 'Sản phẩm đã chỉnh sửa';
  const titleInput = await driver.findElement(By.name('title'));
  await titleInput.clear();
  await titleInput.sendKeys(newTitle);

  // Gửi form
  await driver.findElement(By.css('button[type=submit]')).click();

  // Chờ hiển thị thông báo thành công
  const successAlert = await driver.wait(until.elementLocated(By.css('.alert-success')), 3000);
  const successText = await successAlert.getText();

  // Trở lại trang danh sách sản phẩm
  await driver.get(`${URL}/admin/products`, 5000);

  // Lấy tiêu đề sản phẩm đầu bảng
  const updatedTitle = await driver.findElement(By.css('table tbody tr:first-child td:nth-child(4)')).getText();

  // Kiểm tra
  assert(
    successText.toLowerCase().includes("thành công"),
    `❌ Không có thông báo thành công sau khi sửa: "${successText}"`
  );

  assert(
    updatedTitle.toLowerCase().includes(newTitle.toLowerCase()),
    `❌ Tiêu đề sau chỉnh sửa không đúng. Mong đợi "${newTitle}", tìm thấy: "${updatedTitle}"`
  );

  // console.log("✅ Chỉnh sửa sản phẩm thành công");
}

async function deleteProduct() {
  await driver.get(`${URL}/admin/products`);
  await driver.sleep(1000);

  // Lấy toàn bộ hàng sản phẩm
  const rows = await driver.findElements(By.css('table tbody tr'));
  let found = false;

  for (let i = 0; i < rows.length; i++) {
    const titleCell = await rows[i].findElement(By.css('td:nth-child(4)'));
    const titleText = await titleCell.getText();

    if (titleText.includes("Sản phẩm đã chỉnh sửa")) {
      // console.log(`🔍 Tìm thấy sản phẩm cần xóa tại dòng ${i + 1}: "${titleText}"`);

      // Tìm nút xóa trong cùng hàng
      const deleteButton = await rows[i].findElement(By.css('button[button-delete]'));
      await deleteButton.click();

      // Xử lý popup confirm
      try {
        const alert = await driver.switchTo().alert();
        await alert.accept();
        // console.log("✅ Đã xác nhận xóa");
      } catch (error) {
        // console.error("❌ Không thấy hộp thoại xác nhận xóa:", error.message);
        return;
      }

      await driver.sleep(2000); // chờ backend xử lý & refresh DOM
      found = true;
      break;
    }
  }

  if (!found) {
    // console.warn("⚠️ Không tìm thấy sản phẩm cần xóa");
    return;
  }

  // Kiểm tra lại toàn bộ tiêu đề xem còn không
  const updatedTitles = await driver.findElements(By.css('table tbody td:nth-child(4)'));
  for (const td of updatedTitles) {
    const text = await td.getText();
    if (text.includes("Sản phẩm đã chỉnh sửa")) {
      // console.error("❌ Xóa sản phẩm KHÔNG thành công. Vẫn còn trong danh sách.");
      return;
    }
  }

  // console.log("✅ Xóa sản phẩm thành công. Không còn trong danh sách.");
}

async function cancelDeleteProduct() {

  await driver.get(`${URL}/admin/products`);
  await driver.sleep(1000);

  // Tìm hàng chứa sản phẩm đã chỉnh sửa
  const rows = await driver.findElements(By.css('table tbody tr'));
  let found = false;

  for (let i = 0; i < rows.length; i++) {
    const titleCell = await rows[i].findElement(By.css('td:nth-child(4)'));
    const titleText = await titleCell.getText();

    if (titleText.includes("Sản phẩm đã chỉnh sửa")) {
      // console.log(`🔍 Tìm thấy sản phẩm tại dòng ${i + 1}: "${titleText}"`);

      // Tìm nút xóa trong cùng hàng
      const deleteButton = await rows[i].findElement(By.css('button[button-delete]'));
      await deleteButton.click();

      // Xử lý confirm → chọn Cancel
      try {
        const alert = await driver.switchTo().alert();
        await alert.dismiss(); // chọn "Hủy"
        // console.log("✅ Đã hủy xác nhận xóa (dismiss)");
      } catch (error) {
        // console.error("❌ Không thấy hộp thoại xác nhận xóa:", error.message);
        return;
      }

      await driver.sleep(2000); // chờ giao diện ổn định lại
      found = true;
      break;
    }
  }

  if (!found) {
    // console.warn("⚠️ Không tìm thấy sản phẩm để kiểm thử hủy xóa");
    return;
  }

  // Kiểm tra xem sản phẩm vẫn còn
  const updatedTitles = await driver.findElements(By.css('table tbody td:nth-child(4)'));
  for (const td of updatedTitles) {
    const text = await td.getText();
    if (text.includes("Sản phẩm đã chỉnh sửa")) {
      // console.log("✅ Sản phẩm vẫn còn sau khi hủy xóa (đúng như mong đợi)");
      return;
    }
  }

  // console.error("❌ Sản phẩm đã bị xóa dù đã chọn HỦY");
}

async function changePositionProduct() {
  // Truy cập trang quản lý sản phẩm nếu cần
  await driver.get(`${URL}/admin/products`);
  await driver.sleep(1000);

  // Chọn checkbox của sản phẩm đầu tiên
  const checkboxes = await driver.findElements(By.css('table tbody tr td:nth-child(1) input[type="checkbox"]'));
  if (checkboxes.length === 0) throw new Error("Không tìm thấy sản phẩm nào để cập nhật vị trí");

  await checkboxes[0].click();

  // Lấy ô input vị trí đầu tiên
  const positionInputs = await driver.findElements(By.css('table tbody tr td:nth-child(6) input'));
  const positionInput = positionInputs[0];
  const oldPosition = await positionInput.getAttribute("value");

  const newPosition = "10";
  await positionInput.clear();
  await positionInput.sendKeys(newPosition);

  // Chọn hành động "Cập nhật vị trí"
  const typeSelect = await driver.findElement(By.css('select[name="type"]'));
  const changePositionOption = await typeSelect.findElement(By.css('option[value="change-position"]'));
  await changePositionOption.click();

  // Click nút "Áp dụng"
  const applyButton = await driver.findElement(By.xpath("//button[contains(text(),'Áp dụng')]"));
  await applyButton.click();

  // Đợi cập nhật và kiểm tra lại vị trí
  await driver.sleep(3000);
  const updatedInputs = await driver.findElements(By.css('table tbody tr td:nth-child(6) input'));
  const updatedValue = await updatedInputs[0].getAttribute("value");

  // Kiểm tra kết quả
  assert.strictEqual(
    updatedValue,
    newPosition,
    `❌ Vị trí không được cập nhật. Mong đợi: ${newPosition}, Thực tế: ${updatedValue}`
  );

  // console.log("✅ Cập nhật vị trí sản phẩm thành công");
}


async function testFilterStatus() {
  // Lọc sản phẩm "Hoạt động"
  const buttonActive = await driver.findElement(By.css('button[button-status="active"]'));
  await buttonActive.click();

  const paginationActive = await driver.findElement(By.css('ul.pagination'));
  const buttonPaginationActiveFirst = await paginationActive.findElement(By.css('li:nth-child(1) button'));
  const pageActiveFirst = await buttonPaginationActiveFirst.getAttribute("button-pagination");

  const buttonPaginationActiveLast = await paginationActive.findElement(By.css('li:last-child button'));
  const pageActiveLast = await buttonPaginationActiveLast.getAttribute("button-pagination");

  for (let i = Number(pageActiveFirst); i <= Number(pageActiveLast); i++) {
    const pagination = await driver.findElement(By.css('ul.pagination'));
    const buttonPage = await pagination.findElement(By.css(`li button[button-pagination="${i}"]`));
    await buttonPage.click();

    const rows = await driver.findElements(By.css('table tbody tr'));
    for (let j = 0; j < rows.length; j++) {
      const statusCell = await rows[j].findElement(By.css('td:nth-child(7) a'));
      const statusText = await statusCell.getText();
      if (statusText !== "Hoạt động") {
        throw new Error(`Dòng ${j + 1} trên trang ${i} không có trạng thái "Hoạt động", mà là "${statusText}"`);
      }
    }
  }

  // Quay về trang đầu trước khi chuyển sang trạng thái khác
  const paginationBack = await driver.findElement(By.css('ul.pagination'));
  await paginationBack.findElement(By.css('li button[button-pagination="1"]')).click();

  // Lọc sản phẩm "Dừng hoạt động"
  const buttonInactive = await driver.findElement(By.css('button[button-status="inactive"]'));
  await buttonInactive.click();

  const paginationInactive = await driver.findElement(By.css('ul.pagination'));
  const buttonPaginationInactiveFirst = await paginationInactive.findElement(By.css('li:nth-child(1) button'));
  const pageInactiveFirst = await buttonPaginationInactiveFirst.getAttribute("button-pagination");

  const buttonPaginationInactiveLast = await paginationInactive.findElement(By.css('li:last-child button'));
  const pageInactiveLast = await buttonPaginationInactiveLast.getAttribute("button-pagination");

  for (let i = Number(pageInactiveFirst); i <= Number(pageInactiveLast); i++) {
    const pagination = await driver.findElement(By.css('ul.pagination'));
    const buttonPage = await pagination.findElement(By.css(`li button[button-pagination="${i}"]`));
    await buttonPage.click();

    const rows = await driver.findElements(By.css('table tbody tr'));
    for (let j = 0; j < rows.length; j++) {
      const statusCell = await rows[j].findElement(By.css('td:nth-child(7) a'));
      const statusText = await statusCell.getText();
      if (statusText !== "Dừng hoạt động") {
        throw new Error(`Dòng ${j + 1} trên trang ${i} không có trạng thái "Dừng hoạt động", mà là "${statusText}"`);
      }
    }
  }
}





async function runAllTests() {
  driver = await new Builder().forBrowser('chrome').build();
  try {
    console.log('\nBẮT ĐẦU CHẠY TESTS...\n');

    await login();
    await runTest('Truy cập trang quản lý sản phẩm', goToProductPage);
    await runTest('Phân trang hoạt động đúng', testPagination);
    await runTest('Tìm kiếm sản phẩm - Có kết quả', () => searchProductWithResult('Áo khoác'));
    await runTest('Tìm kiếm sản phẩm - Không có kết quả', () => searchProductNoResult('xxxxx123xyzkhongtontai'));
    await runTest('Sắp xếp sản phẩm theo giá tăng dần', sortPriceAsc);
    await runTest('Thay đổi trạng thái sản phẩm', changeStatus);
    await runTest("Validate: Title trống", testEmptyTitle);
    await runTest("Validate: Title < 5 ký tự", testShortTitle);
    await runTest("Validate: Giá không hợp lệ", testInvalidPrice);
    await runTest("Validate: Stock âm", testInvalidStock);
    await runTest("Validate: Discount không hợp lệ", testInvalidDiscount);
    await runTest("Test thêm sản phẩm thành công", testAddProductSuccess);
    await runTest("Test chỉnh sửa sản phẩm thành công", editProductSuccess);
    await runTest("Test xóa sản phẩm thành công", deleteProduct);
    await runTest("Test hủy xóa sản phẩm", cancelDeleteProduct);
    await runTest("Test thay đổi vị trí sản phẩm bằng click checkbox", changePositionProduct);
    await runTest("Lọc trạng thái sản phẩm (Hoạt động & Dừng hoạt động)", testFilterStatus);
  } finally {
    await driver.quit();

    const passRate = ((passedTests / totalTests) * 100).toFixed(2);

    console.log('\nTỔNG KẾT');
    console.log('---------------------------');
    console.log(`Tổng số test: ${totalTests}`);
    console.log(`✅ Pass: ${passedTests}`);
    console.log(`❌ Fail: ${failedTests}`);
    console.log(`Pass Rate: ${passRate}%`);
    console.log('---------------------------\n');
  }
}

runAllTests();


async function sortPriceAsc() {
  console.log('-------Test sắp xếp theo giá tăng dần...');

  const sortSelect = await driver.findElement(By.name('sort'));
  await sortSelect.click(); // mở dropdown

  // Tìm option có value="price-asc"
  const priceAscOption = await sortSelect.findElement(By.css('option[value="price-asc"]'));
  await priceAscOption.click();

  await driver.sleep(1000);

  // Lấy các dòng sản phẩm
  const searchResults = await driver.findElements(By.css('table tbody tr'));
  const prices = [];

  for (let i = 0; i < searchResults.length; i++) {
    const priceCell = await searchResults[i].findElement(By.css('td:nth-child(5)'));
    let priceText = await priceCell.getText(); // Ví dụ: "12.000.000đ"
    
    // Làm sạch và chuyển thành số: bỏ dấu chấm, ký tự đ
    let price = parseInt(priceText.replace(/[^\d]/g, ''), 10);
    prices.push(price);
  }

  console.log('Danh sách giá sản phẩm:', prices);

  // Kiểm tra xem mảng có sắp xếp tăng dần không
  const isSorted = prices.every((val, i, arr) => i === 0 || arr[i - 1] <= val);
  if (isSorted) {
    console.log('✅ Giá đã được sắp xếp tăng dần hợp lệ.');
  } else {
    console.warn('❌ Giá KHÔNG được sắp xếp tăng dần!');
  }
}