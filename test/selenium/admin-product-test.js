const { Builder, By, until, Key } = require('selenium-webdriver');
const path = require('path');
const assert = require('assert');
require('chromedriver');

const URL = 'http://localhost:3000';
const EMAIL = 'leducthai1008@gmail.com';
const PASSWORD = '123';

let driver;

async function login() {
  await driver.get(`${URL}/admin/auth/login`);
  await driver.findElement(By.name('email')).sendKeys(EMAIL);
  await driver.findElement(By.name('password')).sendKeys(PASSWORD);
  await driver.findElement(By.css('button[type=submit]')).click();
  await driver.wait(until.urlContains('/admin/dashboard'), 5000);
  console.log('✅ Đăng nhập thành công');
}

async function goToProductPage() {
  try {
    // Click vào menu sản phẩm
    await driver.findElement(By.css('a[href="/admin/products"]')).click();

    // Đợi URL chuyển sang đúng trang
    await driver.wait(until.urlContains('/admin/products'), 5000);

    // Sau khi chuyển trang xong → kiểm tra có bảng chứa checkbox-multi không
    await driver.wait(
      until.elementLocated(By.css('table[checkbox-multi]')),
      5000
    );

    console.log('✅ Đã vào trang quản lý sản phẩm và bảng hiển thị đúng');
  } catch (err) {
    if (err.name === 'TimeoutError') {
      const currentUrl = await driver.getCurrentUrl();
      if (!currentUrl.includes('/admin/products')) {
        console.error('❌ Lỗi: Không thể chuyển đến trang quản lý sản phẩm trong 5s');
      } else {
        console.error('❌ Lỗi: Trang quản lý sản phẩm không hiển thị bảng dữ liệu (table[checkbox-multi])');
      }
    } else {
      console.error('❌ Lỗi không xác định:', err.message);
    }
  }
}

// -----------------------------
// Kiểm tra phân trang: đếm số hàng sản phẩm, chuyển trang nếu có
// -----------------------------
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

  // Tìm nút phân trang "Kế tiếp" (tức là trang 2)
  const nextPageButtons = await driver.findElements(By.css('button.page-link[button-pagination="2"]'));

  // Trường hợp chỉ có 1 trang
  if (!nextPageButtons.length > 0) {
    console.log('✅ Chỉ có 1 trang → Phân trang đúng');
    return;
  }

  // Có trang 2 → thử click
  try {
    await nextPageButtons[0].click();
    await driver.sleep(1000); // chờ dữ liệu tải

    const titlesPage2 = await getProductTitles();

    // Kiểm tra nội dung
    if (titlesPage2.length === 0) {
      console.log('❌ Trang 2 không có sản phẩm nào → Phân trang lỗi');
    } else if (JSON.stringify(titlesPage1) === JSON.stringify(titlesPage2)) {
      console.log('❌ Trang 2 giống hệt trang 1 → Có thể phân trang bị lỗi');
    } else {
      console.log('✅ Phân trang hoạt động đúng, nội dung trang 2 khác trang 1');
    }
  } catch (err) {
    console.error('❌ Không thể click sang trang 2:', err.message);
  }
}

async function searchProduct() {
  const keyword = 'Nữ'; // hoặc thử 'xxxxx' để test không có kết quả

  const searchInput = await driver.findElement(By.name('keyword'));
  await searchInput.clear();
  await searchInput.sendKeys(keyword, Key.RETURN);
  await driver.sleep(1000);

  const searchResults = await driver.findElements(By.css('table tbody tr'));
  const resultCount = searchResults.length;
  console.log(`🔎 Sau tìm kiếm "${keyword}": ${resultCount} sản phẩm`);

  if (resultCount === 0) {
    // ✅ Kiểm tra có thông báo "Không tìm thấy..." hay không (nếu có)
    try {
      const noResultMessage = await driver.findElement(By.css('.no-results'));
      const messageText = await noResultMessage.getText();
      console.log(`✅ Thông báo hệ thống: "${messageText}"`);
    } catch (e) {
      console.warn('⚠️ Không tìm thấy thông báo khi không có kết quả!');
    }
  } else {

    for (let i = 0; i < resultCount; i++) {
      const titleCell = await searchResults[i].findElement(By.css('td:nth-child(4)'));
      const titleText = await titleCell.getText();

      if (!titleText.toLowerCase().includes(keyword.toLowerCase())) {
        console.warn(`❌ SAI: Hàng ${i + 1}: title không chứa "${keyword}": "${titleText}"`);
      } else {
        console.log(`✅ Hàng ${i + 1} hợp lệ: "${titleText}"`);
      }
    }
  }
}

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

async function changeStatus() {
  // Lấy danh sách các ô trạng thái trong cột 7
  const statusCells = await driver.findElements(By.css('table tbody tr td:nth-child(7)'));

  if (statusCells.length === 0) {
    console.error("❌ Không tìm thấy ô trạng thái trong bảng!");
    return;
  }

  const statusCell = statusCells[0];

  // Lấy thẻ <a> bên trong ô trạng thái
  const statusLink = await statusCell.findElement(By.css('a'));
  const textBefore = await statusLink.getText();
  console.log(`🔄 Trạng thái ban đầu: ${textBefore}`);

  // Click để thay đổi trạng thái
  await statusLink.click();
  await driver.sleep(1000); // đợi backend xử lý & giao diện cập nhật

  // Lấy lại thẻ <a> sau khi reload lại DOM (không dùng biến cũ nữa)
  const statusCellsAfter = await driver.findElements(By.css('table tbody tr td:nth-child(7)'));
  const statusLinkAfter = await statusCellsAfter[0].findElement(By.css('a'));
  const textAfter = await statusLinkAfter.getText();
  console.log(`🔁 Trạng thái sau khi click: ${textAfter}`);

  if (textAfter !== textBefore) {
    console.log("✅ Trạng thái đã thay đổi thành công");
  } else {
    console.log("❌ Trạng thái KHÔNG thay đổi");
  }
}

async function testInvalidProductSubmission() {
  await driver.findElement(By.css('a[href="/admin/products/create"]')).click();
  await driver.wait(until.urlContains('/admin/products/create'), 5000);

  // Gỡ thuộc tính required và min của input bằng JavaScript
  await driver.executeScript(`
    document.getElementById('title').removeAttribute('required');
    document.getElementById('price').removeAttribute('min');
    document.getElementById('stock').removeAttribute('min');
    document.getElementById('discount').removeAttribute('min');
  `);

  await driver.findElement(By.name('title')).sendKeys('abc'); // quá ngắn
  await driver.findElement(By.name('price')).sendKeys('-1000'); // sai
  await driver.findElement(By.name('stock')).sendKeys('-5'); // sai
  await driver.findElement(By.name('discountPercentage')).sendKeys('200'); // sai

  await driver.findElement(By.css('button[type=submit]')).click();

  const errorBox = await driver.wait(until.elementLocated(By.css('.alert-danger')), 3000);
  const errorText = await errorBox.getText();

  console.log("Lỗi phản hồi từ server:", errorText);
  if (
    errorText.includes("Tiêu đề") ||
    errorText.includes("Giá") ||
    errorText.includes("Số lượng") ||
    errorText.includes("% Giảm giá")
  ) {
    console.log("✅ Kiểm thử validate server thành công");
  } else {
    console.error("❌ Lỗi server validate không được hiển thị đúng");
  }
}


async function testAddProductSuccess() {
  await driver.findElement(By.css('a[href="/admin/products/create"]')).click();
  await driver.wait(until.urlContains('/admin/products/create'), 5000);

  await driver.findElement(By.name('title')).sendKeys('Sản phẩm mới Selenium');
  await driver.findElement(By.name('price')).sendKeys('100000');
  // await driver.findElement(By.name('description')).sendKeys('Mô tả sản phẩm Selenium');
  await driver.findElement(By.name('discountPercentage')).sendKeys('5');
  await driver.findElement(By.name('stock')).sendKeys('10');

  // Chọn danh mục nếu có
  const options = await driver.findElements(By.css('select[name="product_category_id"] option'));
  if (options.length > 1) {
    await options[1].click(); // (khác "-- Chọn danh mục --")
  }

  // Upload file (đảm bảo bạn có ảnh test.jpeg trong cùng thư mục)
  const fileInput = await driver.findElement(By.name('thumbnail'));
  await fileInput.sendKeys(path.resolve(__dirname, 'test.jpeg'));

  await driver.findElement(By.css('button[type=submit]')).click();

  // Chờ về lại trang danh sách
  await driver.wait(until.urlIs(`${URL}/admin/products`), 5000);
  

  // Xác minh sản phẩm nằm đầu bảng
  const firstTitle = await driver.findElement(By.css('table tbody tr:first-child td:nth-child(4)')).getText();
  assert(firstTitle.includes('Sản phẩm mới Selenium'), "❌ Không thấy sản phẩm vừa thêm ở đầu danh sách");
  console.log("✅ Thêm sản phẩm thành công");
}

async function editProductSuccess() {
  // Giả sử có nút "Sửa" là một icon hoặc button với class cụ thể
  await driver.findElement(By.xpath("//table/tbody/tr[1]//a[normalize-space(text())='Sửa']")).click();
  await driver.wait(until.urlContains('/admin/products/edit'), 5000);

  const titleInput = await driver.findElement(By.name('title'));
  await titleInput.clear();
  await titleInput.sendKeys('Sản phẩm đã chỉnh sửa');

  await driver.findElement(By.css('button[type=submit]')).click();
  
  const successAlert = await driver.wait(until.elementLocated(By.css('.alert-success')), 1000);
  const successText = await successAlert.getText();
  const titleInputAfter = await driver.findElement(By.name('title'));

  const titleInputValue = await titleInputAfter.getAttribute('value');

  if(successText.includes("thành công") && titleInputValue == "Sản phẩm đã chỉnh sửa")
    console.log('✅ Chỉnh sửa sản phẩm thành công');
  else
    console.log('❌ Chỉnh sửa sản phẩm không thành công');
}

async function deleteProduct() {
  await driver.get(`${URL}/admin/products`);
  // Tìm nút đầu tiên có text "Xóa" hoặc có attribute button-delete
  const deleteButton = await driver.findElement(By.css('button[button-delete]'));
  await deleteButton.click();

  // Xử lý confirm popup (chọn "OK")
  try {
    const alert = await driver.switchTo().alert();
    await alert.accept(); // đồng ý xóa
    console.log('✅ Đã xác nhận xóa');
  } catch (error) {
    console.log('❌ Không có popup confirm', error);
  }

  await driver.sleep(3000);

  // Kiểm tra sản phẩm không còn trong bảng
  const titles = await driver.findElements(By.css('td:nth-child(4)'));
  for (const td of titles) {
    const text = await td.getText();
    if (text.includes("Sản phẩm đã chỉnh sửa")) {
      console.log('❌ Xóa sản phẩm không thành công');
      return;
    }
  }
  console.log('✅ Xóa sản phẩm thành công');
}


async function changePositonProduct() {
  try {
    // checkbox sản phẩm đầu tiên
    const checkboxCells = await driver.findElements(By.css('table tbody tr td:nth-child(1)'));
    await checkboxCells[0].click();
    
    // lấy giá trị vị trí đầu
    const inputPositionCells = await driver.findElements(By.css('table tbody tr td:nth-child(6) input'));
    const inputPostionFirst = inputPositionCells[0];

    // in ra vị trí đầu
    const inputPostionFirstText = await inputPostionFirst.getAttribute("value");
    console.log("Vị trí ban đầu: ", inputPostionFirstText);

    // cập nhật vị trí
    const vitri = "5";

    await inputPostionFirst.clear();
    await inputPostionFirst.sendKeys(vitri);

    // chọn option cập nhật vị trí
    const typeSelect = await driver.findElement(By.css('select[name="type"]'));
    await typeSelect.click();

    // Tìm option 
    const changePositionOption = await typeSelect.findElement(By.css('option[value="change-position"]'));
    await changePositionOption.click();

    await driver.findElement(By.xpath("//button[contains(text(),'Áp dụng')]")).click();

    // lấy lại giá trị vị trí sau khi thay đổi của sản phẩm đầu tiên 
    const inputPositionCellsAfter = await driver.findElements(By.css('table tbody tr td:nth-child(6) input'));
    const inputPostionAfter = inputPositionCellsAfter[0];

    // in ra vị trí sau và so sánh với vitri
    const inputPostionAfterText = await inputPostionAfter.getAttribute("value");
    console.log("Vị trí sau thay đổi: ", inputPostionAfterText);

    if(inputPostionAfterText == vitri) console.log("✅ Cập nhật vị trí thành công")
    else console.log("❌ Cập nhật vị trí không thành công")
  } catch (error) {
    console.log("❌ Lỗi thay đổi vị trí: ", error);
  }
}

async function testFilterStatus() {
  // Tìm Button Status: Hoạt động - Dừng hoạt động
  const buttonActive = await driver.findElement(By.css('button[button-status="active"]'));
  // Click button Hoạt động, Tìm ul pagination: Lấy li(1) và li(2), sau đó lấy giá trị thuộc tính button-pagination
  await buttonActive.click();

  const paginationActive = await driver.findElement(By.css('ul.pagination'));
  const buttonPaginationActiveFirst = await paginationActive.findElement(By.css('li:nth-child(1) button'));
  const pageActiveFirst = await buttonPaginationActiveFirst.getAttribute("button-pagination");

  const buttonPaginationActiveLast = await paginationActive.findElement(By.css('li:last-child button'));
  const pageActiveLast = await buttonPaginationActiveLast.getAttribute("button-pagination");

  console.log("Hoạt động: ", pageActiveFirst, "-", pageActiveLast)
  // For loop từ trang đầu tới cuối, mỗi trang sẽ lấy danh sách sản phẩm --> lấy giá trị hoạt động: Hoạt động mà có "dừng hoạt động" --> Lỗi
  for(let i = Number(pageActiveFirst); i <= Number(pageActiveLast); i++){
    // Phải tìm lại pagination mỗi vòng vì DOM thay đổi sau mỗi click
    const paginationActive = await driver.findElement(By.css('ul.pagination'));

    const buttonPage = await paginationActive.findElement(By.css(`li button[button-pagination="${i}"]`));
    await buttonPage.click();
    
    const searchResults = await driver.findElements(By.css('table tbody tr'));

    for (let i = 0; i < searchResults.length; i++) {
      const statusLink = await searchResults[i].findElement(By.css('td:nth-child(7) a'));
      const statusText = await statusLink.getText();
      if(statusText !== "Hoạt động"){
        console.log("❌ Lọc trạng thái 'hoạt động' sai");
        return;
      }
    }
  }

  console.log("✅ Lọc trạng thái 'hoạt động' thành công");

  const pagination = await driver.findElement(By.css('ul.pagination'));
  await pagination.findElement(By.css(`li button[button-pagination="1"]`)).click();

  // ---------------------------------------------
  // Tìm Button Status: Hoạt động - Dừng hoạt động
  const buttonInactive = await driver.findElement(By.css('button[button-status="inactive"]'));
  // Click button Hoạt động, Tìm ul pagination: Lấy li(1) và li(2), sau đó lấy giá trị thuộc tính button-pagination
  await buttonInactive.click();

  const paginationInactive = await driver.findElement(By.css('ul.pagination'));
  const buttonPaginationInactiveFirst = await paginationInactive.findElement(By.css('li:nth-child(1) button'));
  const pageInactiveFirst = await buttonPaginationInactiveFirst.getAttribute("button-pagination");

  const buttonPaginationInactiveLast = await paginationInactive.findElement(By.css('li:last-child button'));
  const pageInactiveLast = await buttonPaginationInactiveLast.getAttribute("button-pagination");

  console.log("Dừng hoạt động: ", pageInactiveFirst, "-", pageInactiveLast)

  // For loop từ trang đầu tới cuối, mỗi trang sẽ lấy danh sách sản phẩm --> lấy giá trị hoạt động: Hoạt động mà có "dừng hoạt động" --> Lỗi
  for(let i = Number(pageInactiveFirst); i <= Number(pageInactiveLast); i++){
    // Phải tìm lại pagination mỗi vòng vì DOM thay đổi sau mỗi click
    const paginationInactive = await driver.findElement(By.css('ul.pagination'));

    const buttonPage = await paginationInactive.findElement(By.css(`li button[button-pagination="${i}"]`));
    await buttonPage.click();
    
    const searchResults = await driver.findElements(By.css('table tbody tr'));

    for (let i = 0; i < searchResults.length; i++) {
      const statusLink = await searchResults[i].findElement(By.css('td:nth-child(7) a'));
      const statusText = await statusLink.getText();
      if(statusText !== "Dừng hoạt động"){
        console.log("❌ Lọc trạng thái 'dừng hoạt động' sai");
        return;
      }
    }
  }

  console.log("✅ Lọc trạng thái 'dừng hoạt động' thành công");

  // ---------------------------------------------
   
}


async function runAllTests() {
  driver = await new Builder().forBrowser('chrome').build();
  try {
    await login();
    await goToProductPage();

    await testPagination();
    await searchProduct();
    await sortPriceAsc();
    await changeStatus();
    await testInvalidProductSubmission();
    await testAddProductSuccess();
    await editProductSuccess();
    await deleteProduct();
    await changePositonProduct();
    await testFilterStatus();


  } catch (err) {
    console.error('❌ Có lỗi xảy ra:', err);
  } finally {
    await driver.quit();
  }
}

runAllTests();