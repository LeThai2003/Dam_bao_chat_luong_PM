const { Builder, By, until, Key } = require('selenium-webdriver');
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


async function addProduct() {
  await driver.findElement(By.css('a[href="/admin/products/create"]')).click();
  await driver.wait(until.urlContains('/admin/products/create'), 5000);

  await driver.findElement(By.name('title')).sendKeys('Sản phẩm mới');
  await driver.findElement(By.name('price')).sendKeys('100000');
  await driver.findElement(By.name('description')).sendKeys('Mô tả sản phẩm');
  // Thêm các trường cần thiết khác nếu có

  await driver.findElement(By.css('button[type=submit]')).click();
  await driver.wait(until.urlIs(`${URL}/admin/products`), 5000);
  console.log('✅ Thêm sản phẩm thành công');
}

async function editProduct() {
  // Giả sử có nút "Sửa" là một icon hoặc button với class cụ thể
  await driver.findElement(By.css('a.btn-edit')).click();
  await driver.wait(until.urlContains('/admin/products/edit'), 5000);

  const titleInput = await driver.findElement(By.name('title'));
  await titleInput.clear();
  await titleInput.sendKeys('Sản phẩm đã chỉnh sửa');

  await driver.findElement(By.css('button[type=submit]')).click();
  await driver.wait(until.urlIs(`${URL}/admin/products`), 5000);
  console.log('✅ Chỉnh sửa sản phẩm thành công');
}

async function deleteProduct() {
  // Giả sử có nút "Xóa" là một icon hoặc button với class cụ thể
  await driver.findElement(By.css('button.btn-delete')).click();

  // Nếu có popup xác nhận
  await driver.switchTo().alert().accept();

  await driver.sleep(1000); // Đợi thao tác xóa hoàn tất
  console.log('✅ Xóa sản phẩm thành công');
}



async function runAllTests() {
  driver = await new Builder().forBrowser('chrome').build();
  try {
    await login();
    await goToProductPage();
    // await testPagination();
    // await searchProduct();
    // await sortPriceAsc();
    await changeStatus();
    // await addProduct();
    // await editProduct();
    // await deleteProduct();
  } catch (err) {
    console.error('❌ Có lỗi xảy ra:', err);
  } finally {
    await driver.quit();
  }
}

runAllTests();