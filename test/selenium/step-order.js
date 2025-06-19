const { By, until } = require('selenium-webdriver');
const { baseUrl, sleep} = require('../setup');

describe("Kiểm thử giao diện khi chọn sản phẩm hết hàng", () => {
    beforeEach(async () => {
        await global.driver.get(baseUrl);
    })
    test("TC00 - Sản phẩm hết hàng", async () => {
        const item = "Áo khoác nam kaki hàn quốc cao cấp DYNYOUTH";

        // tim search input
        await global.driver.wait(until.elementLocated(By.css("input[placeholder='Nhập từ khóa...']")), 5000);
        const searchInput = await global.driver.findElement(By.css("input[placeholder='Nhập từ khóa...']"));

        await searchInput.sendKeys(item);

        // tim search button
        await global.driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Tìm']")), 5000);
        const searchButton = await global.driver.findElement(By.xpath("//button[normalize-space()='Tìm']"));

        await searchButton.click();

        //tim item 
        await global.driver.wait(until.elementLocated(By.xpath("//div[@class='product-item']")), 5000);
        const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));

        if( itemOrder.length == 0 ){
            console.log("Item not found?");
        }else{
            await itemOrder[0].click();
            // kiem tra con hang khong
            await global.driver.wait(until.elementLocated(By.xpath("//p[@class='out-of-stock']")), 5000);
            const outStock = await global.driver.findElements(By.xpath("//p[@class='out-of-stock']"));
            expect(outStock.length).toBeGreaterThan(0);
        }
    })
    test("TC01 - Sản phẩm còn hàng", async () => {
        const item = "Daily Wear trượt nước Coolmate";

        // tim search input
        await global.driver.wait(until.elementLocated(By.css("input[placeholder='Nhập từ khóa...']")), 5000);
        const searchInput = await global.driver.findElement(By.css("input[placeholder='Nhập từ khóa...']"));

        await searchInput.sendKeys(item);

        // tim search button
        await global.driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Tìm']")), 5000);
        const searchButton = await global.driver.findElement(By.xpath("//button[normalize-space()='Tìm']"));

        await searchButton.click();

        //tim item 
        await global.driver.wait(until.elementLocated(By.xpath("//div[@class='product-item']")), 5000);
        const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));

        if( itemOrder.length == 0 ){
            console.log("Item not found?");
        }else{
            const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));
            await itemOrder[0].click();
            // kiem tra con hang khong
            await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]")), 5000);
            const buttonSlot = await global.driver.findElements(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]"));
            expect(buttonSlot.length).toBeGreaterThan(0);
        }
    })
})

describe("Kiểm thử giao diện khi nhập số lượng lớn hơn số lượng sản phẩm còn lại", () => {
    beforeEach(async () => {
        await global.driver.get(baseUrl + "user/login");

        await global.driver.wait(until.elementLocated(By.css(".text-center.login-title")), 5000);
        const title = await global.driver.findElement(By.css(".text-center.login-title"));
        // kiem tra dung trang chua
        expect(await title.getText()).toEqual("Đăng nhập tài khoản");

        const usernameInput = await global.driver.wait(until.elementLocated(By.xpath("//input[@id='email']")), 5000);
        const passwordInput = await global.driver.wait(until.elementLocated(By.xpath("//input[@id='password']")), 5000);
        const loginButton = await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Đăng nhập')]")), 5000);

        await usernameInput.sendKeys('leducthaiamity@gmail.com');
        await passwordInput.sendKeys('123');
        await loginButton.click();

        await global.driver.wait(until.urlContains(baseUrl), 5000);

        const item = "Daily Wear trượt nước Coolmate";

        // tim search input
        await global.driver.wait(until.elementLocated(By.css("input[placeholder='Nhập từ khóa...']")), 5000);
        const searchInput = await global.driver.findElement(By.css("input[placeholder='Nhập từ khóa...']"));

        await searchInput.sendKeys(item);

        // tim search button
        await global.driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Tìm']")), 5000);
        const searchButton = await global.driver.findElement(By.xpath("//button[normalize-space()='Tìm']"));

        await searchButton.click();

        //tim item 
        await global.driver.wait(until.elementLocated(By.xpath("//div[@class='product-item']")), 5000);
        const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));

        if( itemOrder.length == 0 ){
            console.log("Item not found?");
        }else{
            const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));
            await itemOrder[0].click();
        }
    })
    test("TC04 - Nhập số lượng đặt lớn hơn số lượng sản phẩm", async () => {
         //tim so luong item con lai
         await global.driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'inner-stock')]//span")), 5000);
         const stockElement = await global.driver.findElement(By.xpath("//div[contains(@class, 'inner-stock')]//span"));
         const stockText = await stockElement.getText();
         const itemSlot = parseInt(stockText);
         const outStockSlot = itemSlot + 100;
         
         // tim input stock 
         await global.driver.wait(until.elementLocated(By.xpath("//input[@name='quantity']")), 5000);
         const inputSlot = await global.driver.findElement(By.xpath("//input[@name='quantity']"));
         await inputSlot.clear();
         await inputSlot.sendKeys(outStockSlot.toString());
 
         //click
         await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]")), 5000);
         const buttonSlot = await global.driver.findElement(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]"));
 
         const urlExpect = await global.driver.getCurrentUrl();
 
         await buttonSlot.click();
 
         await sleep(1000); // Give some time for the tooltip to appear
 
         const urlActual = await global.driver.getCurrentUrl();
 
         expect(urlExpect).toEqual(urlActual);
        // kiêm tra toast
        
        const toast = await global.driver.findElements(By.css(".alert.alert-success:not(.alert-hidden)"));

        expect(toast.length).toBe(0);
    })
    test("TC05 -  Nhập số lượng đặt nhỏ hơn số lượng sản phẩm", async () => {
        await global.driver.wait(until.elementLocated(By.xpath("//input[@name='quantity']")), 5000);
        const inputSlot = await global.driver.findElement(By.xpath("//input[@name='quantity']"));
        await inputSlot.clear();
        await inputSlot.sendKeys(1);

        //click
        await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]")), 5000);
        const buttonSlot = await global.driver.findElement(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]"));

        await buttonSlot.click();

        // kiêm tra toast
        await global.driver.wait(until.elementLocated(By.css(".alert.alert-success:not(.alert-hidden)")), 5000);
        const toast = await global.driver.findElements(By.css(".alert.alert-success:not(.alert-hidden)"));

        expect(toast.length).toBeGreaterThan(0);
    })
})

describe("Kiểm thử giao diện khi thêm số lượng sản phẩm nhiều hơn số lượng sản phẩm còn lại trong trang giỏ hàng", () => {
    beforeAll(async () => {
        await global.driver.get(baseUrl + "user/login");

        await global.driver.wait(until.elementLocated(By.css(".text-center.login-title")), 5000);
        const title = await global.driver.findElement(By.css(".text-center.login-title"));

        const usernameInput = await global.driver.wait(until.elementLocated(By.xpath("//input[@id='email']")), 5000);
        const passwordInput = await global.driver.wait(until.elementLocated(By.xpath("//input[@id='password']")), 5000);
        const loginButton = await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Đăng nhập')]")), 5000);

        await usernameInput.sendKeys('leducthaiamity@gmail.com');
        await passwordInput.sendKeys('123');
        await loginButton.click();

        await global.driver.wait(until.urlContains(baseUrl), 5000);

        //tim navigate
        await global.driver.wait(until.elementLocated(By.css("a[href='/cart']")), 5000);
        const checkoutButton = await global.driver.findElement(By.css("a[href='/cart']"));

        // navigate 
        await checkoutButton.click();

        // Wait for the URL to change to the cart/checkout page
        await global.driver.wait(until.urlContains(baseUrl + 'cart'), 5000); // Increased timeout for URL change

        //tim title
        await global.driver.wait(until.elementLocated(By.css(".inner-title.title")), 5000);
        const checkoutTitle = await global.driver.findElement(By.css(".inner-title.title"));
        const titleExpect = "Giỏ hàng";
        expect(titleExpect).toEqual(await checkoutTitle.getText());

        //kiem tra san pham
        const product = await global.driver.findElement(By.xpath("(//tbody//tr)"));
        if( product.length == 0 ) {
            const item = "Daily Wear trượt nước Coolmate";
            await global.driver.get(baseUrl);

            // tim search input
            await global.driver.wait(until.elementLocated(By.css("input[placeholder='Nhập từ khóa...']")), 5000);
            const searchInput = await global.driver.findElement(By.css("input[placeholder='Nhập từ khóa...']"));
        
            await searchInput.sendKeys(item);
        
            // tim search button
            await global.driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Tìm']")), 5000);
            const searchButton = await global.driver.findElement(By.xpath("//button[normalize-space()='Tìm']"));
        
            await searchButton.click();
        
            //tim item 
            await global.driver.wait(until.elementLocated(By.xpath("//div[@class='product-item']")), 5000);
            const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));
        
            if( itemOrder.length == 0 ){
                console.log("Item not found?");
            }else{
                const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));
                await itemOrder[0].click();
                
            }
        }

    })
    test("TC06 - Nhập số lượng đặt lớn hơn số lượng sản phẩm", async () => {
          //tim quantity input
          await global.driver.wait(until.elementLocated(By.xpath("//input[@name='quantity']")), 5000);
          const quantityInput = await global.driver.findElement(By.xpath("//input[@name='quantity']"));
  
          await quantityInput.sendKeys(100000);
          await sleep(3000);
          // thanh toa
          await global.driver.wait(until.elementLocated(By.xpath("//a[normalize-space()='THANH TOÁN']")), 5000);
          const paymentButton = await global.driver.findElement(By.xpath("//a[normalize-space()='THANH TOÁN']"));
  
          //click button
          await paymentButton.click();
  
          await global.driver.wait(until.elementLocated(By.xpath("//div[@class='alert alert-warning']")), 5000);
          const errorMessage = await global.driver.findElements(By.xpath("//div[@class='alert alert-warning']"));
  
          expect(errorMessage.length).toBeGreaterThan(0);
    })
    test("TC07 -  Nhập số lượng đặt nhỏ hơn số lượng sản phẩm", async () => {
        //tim quantity input
        await global.driver.wait(until.elementLocated(By.xpath("//input[@name='quantity']")), 5000);
        let quantityInput = await global.driver.findElement(By.xpath("//input[@name='quantity']"));
        await sleep(2000);
        await quantityInput.clear();

        await global.driver.wait(until.elementLocated(By.xpath("//input[@name='quantity']")), 5000);
        quantityInput = await global.driver.findElement(By.xpath("//input[@name='quantity']"));
        await quantityInput.sendKeys(1);
        // thanh toa
        await global.driver.wait(until.elementLocated(By.xpath("//a[normalize-space()='THANH TOÁN']")), 5000);
        const paymentButton = await global.driver.findElement(By.xpath("//a[normalize-space()='THANH TOÁN']"));

        //click button
        await paymentButton.click();

        await global.driver.wait(until.elementLocated(By.css(".col-12.form-checkout")), 5000);
        const formInfo = await global.driver.findElements(By.css(".col-12.form-checkout"));

        expect(formInfo.length).toBeGreaterThan(0);
    })
})

describe("Kiểm thử giao diện thêm sản phẩm vào giỏ hàng khi chưa đăng nhập", () => {
    beforeAll(async () => {
        await global.driver.get(baseUrl);

        await global.driver.wait(until.urlContains(baseUrl), 5000);

        //tim navigate
        const checkoutButton = await global.driver.findElements(By.css("a[href='/cart']"));

        if( checkoutButton.length > 0 ){
             //tim navigate
            await global.driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Đăng xuất')]")), 5000);
            const logoutButton = await global.driver.findElements(By.xpath("//a[contains(text(),'Đăng xuất')]"));

            logoutButton[0].click();
        }
        await global.driver.get(baseUrl);

        // tim search input
        await global.driver.wait(until.elementLocated(By.css("input[placeholder='Nhập từ khóa...']")), 5000);
        const searchInput = await global.driver.findElement(By.css("input[placeholder='Nhập từ khóa...']"));
        let item = "Daily Wear trượt nước Coolmate";
        await searchInput.sendKeys(item);
    
        // tim search button
        await global.driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Tìm']")), 5000);
        const searchButton = await global.driver.findElement(By.xpath("//button[normalize-space()='Tìm']"));
    
        await searchButton.click();
    
        //tim item 
        await global.driver.wait(until.elementLocated(By.xpath("//div[@class='product-item']")), 5000);
        const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));
    
        if( itemOrder.length == 0 ){
            console.log("Item not found?");
        }else{
            const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));
            await itemOrder[0].click();
        }
    })

    test("TC10 - Thêm giỏ hàng chưa đăng nhập", async () => {
        //click
        await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]")), 5000);
        const buttonSlot = await global.driver.findElement(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]"));

        await buttonSlot.click();

        // kiêm tra toast
        const toast = await global.driver.findElements(By.css(".alert.alert-success:not(.alert-hidden)"));

        expect(toast.length).toEqual(0);

        await global.driver.wait(until.urlContains(baseUrl + "user/login"), 5000);
        const currentUrl = await global.driver.getCurrentUrl();
        expect(currentUrl).toEqual(baseUrl + "user/login");
        
    })
    test("TC11 -  Thêm vào giỏ hàng khi đã đăng nhập", async () => {
        await global.driver.get(baseUrl + "user/login");

        const usernameInput = await global.driver.wait(until.elementLocated(By.xpath("//input[@id='email']")), 5000);
        const passwordInput = await global.driver.wait(until.elementLocated(By.xpath("//input[@id='password']")), 5000);
        const loginButton = await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Đăng nhập')]")), 5000);

        await usernameInput.sendKeys('leducthaiamity@gmail.com');
        await passwordInput.sendKeys('123');
        await loginButton.click();

            // tim search input
        await global.driver.wait(until.elementLocated(By.css("input[placeholder='Nhập từ khóa...']")), 5000);
        const searchInput = await global.driver.findElement(By.css("input[placeholder='Nhập từ khóa...']"));
        let item = "Daily Wear trượt nước Coolmate";
        await searchInput.sendKeys(item);
    
        // tim search button
        await global.driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Tìm']")), 5000);
        const searchButton = await global.driver.findElement(By.xpath("//button[normalize-space()='Tìm']"));
    
        await searchButton.click();
    
        //tim item 
        await global.driver.wait(until.elementLocated(By.xpath("//div[@class='product-item']")), 5000);
        const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));
    
        if( itemOrder.length == 0 ){
            console.log("Item not found?");
        }else{
            const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));
            await itemOrder[0].click();
        }
        
        //click
        await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]")), 5000);
        const buttonSlot = await global.driver.findElement(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]"));

        await buttonSlot.click();

        // kiêm tra toast
        await global.driver.wait(until.elementLocated(By.css(".alert.alert-success:not(.alert-hidden)")), 5000);
        const toast = await global.driver.findElements(By.css(".alert.alert-success:not(.alert-hidden)"));

        expect(toast.length).toBeGreaterThan(0);
    })
})

describe("Kiểm thử giao diện form thông tin người dùng", () => {
    beforeAll(async () => {
        await global.driver.get(baseUrl + "user/login");



        const usernameInput = await global.driver.wait(until.elementLocated(By.xpath("//input[@id='email']")), 5000);
        const passwordInput = await global.driver.wait(until.elementLocated(By.xpath("//input[@id='password']")), 5000);
        const loginButton = await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Đăng nhập')]")), 5000);

        await usernameInput.sendKeys('leducthaiamity@gmail.com');
        await passwordInput.sendKeys('123');
        await loginButton.click();

        await global.driver.wait(until.urlContains(baseUrl), 5000);

        let item = "Daily Wear trượt nước Coolmate";
        await addItemInCart(item);
        //tim navigate
        await global.driver.wait(until.elementLocated(By.css("a[href='/cart']")), 5000);
        const checkoutButton = await global.driver.findElement(By.css("a[href='/cart']"));

        // navigate 
        await checkoutButton.click();

        await global.driver.wait(until.elementLocated(By.xpath("//input[@name='quantity']")), 5000);
        let quantityInput = await global.driver.findElement(By.xpath("//input[@name='quantity']"));
        await sleep(2000);
        await quantityInput.clear();

        await global.driver.wait(until.elementLocated(By.xpath("//input[@name='quantity']")), 5000);
        quantityInput = await global.driver.findElement(By.xpath("//input[@name='quantity']"));
        await quantityInput.sendKeys(1);

        // thanh toa
        await global.driver.wait(until.elementLocated(By.xpath("//a[normalize-space()='THANH TOÁN']")), 5000);
        const paymentButton = await global.driver.findElement(By.xpath("//a[normalize-space()='THANH TOÁN']"));

        //click button
        await paymentButton.click();

        await global.driver.wait(until.elementLocated(By.css(".col-12.form-checkout")), 5000);
        const formInfo = await global.driver.findElements(By.css(".col-12.form-checkout"));

    })

    test("TC12 - Họ và tên rỗng", async () => {
         await validateForm("","","");

        await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]")), 5000);
        const bookButton = await global.driver.findElements(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]"));

        expect(bookButton.length).toBeGreaterThan(0);
        await bookButton[0].click();


        await global.driver.wait(until.elementLocated(By.css(".alert.alert-danger:not(.alert-hidden)")), 5000);
        const toast = await global.driver.findElements(By.css(".alert.alert-danger:not(.alert-hidden)"));

        expect(toast.length).toBeGreaterThan(0);

        const toastExpect = "Họ tên không được để trống! x"

        expect(await toast[0].getText()).toEqual(toastExpect);
    })
    test("TC13 -  Họ và tên chứa số", async () => {
        await validateForm("D12","","");

        await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]")), 5000);
        const bookButton = await global.driver.findElements(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]"));

        expect(bookButton.length).toBeGreaterThan(0);
        await bookButton[0].click();


        await global.driver.wait(until.elementLocated(By.css(".alert.alert-danger:not(.alert-hidden)")), 5000);
        const toast = await global.driver.findElements(By.css(".alert.alert-danger:not(.alert-hidden)"));

        expect(toast.length).toBeGreaterThan(0);

        const toastExpect = "Họ tên không hợp lệ! x"

        expect(await toast[0].getText()).toEqual(toastExpect);
    })
    test("TC14 -  Số điện thoại rỗng", async () => {
        await validateForm("Dao Phan Quoc Hoai","","address");

        await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]")), 5000);
        const bookButton = await global.driver.findElements(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]"));

        expect(bookButton.length).toBeGreaterThan(0);
        await bookButton[0].click();


        await global.driver.wait(until.elementLocated(By.css(".alert.alert-danger:not(.alert-hidden)")), 5000);
        const toast = await global.driver.findElements(By.css(".alert.alert-danger:not(.alert-hidden)"));

        expect(toast.length).toBeGreaterThan(0);

        const toastExpect = "Số điện thoại không được để trống! x"

        expect(await toast[0].getText()).toEqual(toastExpect);
    })
    test("TC15 -  Số điện thoại chứa chữ", async () => {
        await validateForm("Dao Phan Quoc Hoai","Dao Phan Quoc Hoai","address");

        await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]")), 5000);
        const bookButton = await global.driver.findElements(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]"));

        expect(bookButton.length).toBeGreaterThan(0);
        await bookButton[0].click();
        
 
        await global.driver.wait(until.elementLocated(By.css(".alert.alert-danger:not(.alert-hidden)")), 5000);
        const toast = await global.driver.findElements(By.css(".alert.alert-danger:not(.alert-hidden)"));

        expect(toast.length).toBeGreaterThan(0);

        const toastExpect = "Số điện thoại không hợp lệ! x"

        expect(await toast[0].getText()).toEqual(toastExpect);
    })
    test("TC16 -  Địa chỉ trống", async () => {
        await validateForm("Dao Phan Quoc Hoai","0779127667","");

        await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]")), 5000);
        const bookButton = await global.driver.findElements(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]"));

        expect(bookButton.length).toBeGreaterThan(0);
        await bookButton[0].click();


        await global.driver.wait(until.elementLocated(By.css(".alert.alert-danger:not(.alert-hidden)")), 5000);
        const toast = await global.driver.findElements(By.css(".alert.alert-danger:not(.alert-hidden)"));

        expect(toast.length).toBeGreaterThan(0);

        const toastExpect = "Địa chỉ không được để trống! x"

        expect(await toast[0].getText()).toEqual(toastExpect);
    })
    test("-  Họ và tên, địa chỉ rỗng, số điện thoại hợp lệ", async () => {
        await validateForm("","0779127667","");

        await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]")), 5000);
        const bookButton = await global.driver.findElements(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]"));

        expect(bookButton.length).toBeGreaterThan(0);
        await bookButton[0].click();


        await global.driver.wait(until.elementLocated(By.css(".alert.alert-danger:not(.alert-hidden)")), 5000);
        const toast = await global.driver.findElements(By.css(".alert.alert-danger:not(.alert-hidden)"));

        expect(toast.length).toBeGreaterThan(0);

        const toastExpect = "Họ tên không được để trống! x"

        expect(await toast[0].getText()).toEqual(toastExpect);
    })
    test("-  Họ và tên, số điện thoại rỗng, địa chỉ hợp lệ", async () => {
        await validateForm("","","hoai@gmail.com");

        await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]")), 5000);
        const bookButton = await global.driver.findElements(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]"));

        expect(bookButton.length).toBeGreaterThan(0);
        await bookButton[0].click();


        await global.driver.wait(until.elementLocated(By.css(".alert.alert-danger:not(.alert-hidden)")), 5000);
        const toast = await global.driver.findElements(By.css(".alert.alert-danger:not(.alert-hidden)"));

        expect(toast.length).toBeGreaterThan(0);

        const toastExpect = "Họ tên không được để trống! x"

        expect(await toast[0].getText()).toEqual(toastExpect);
    })
    test("-  Họ và tên, địa chỉ hợp lệ, số điện thoại rỗng", async () => {
        await validateForm("Dao Phan Quoc Hoai","","address");

        await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]")), 5000);
        const bookButton = await global.driver.findElements(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]"));

        expect(bookButton.length).toBeGreaterThan(0);
        await bookButton[0].click();


        await global.driver.wait(until.elementLocated(By.css(".alert.alert-danger:not(.alert-hidden)")), 5000);
        const toast = await global.driver.findElements(By.css(".alert.alert-danger:not(.alert-hidden)"));

        expect(toast.length).toBeGreaterThan(0);

        const toastExpect = "Số điện thoại không được để trống! x"

        expect(await toast[0].getText()).toEqual(toastExpect);
    })
    test("TC14, TC17, TC19 -  Họ và tên chứa số", async () => {
        await validateForm("Dao Phan Quoc Hoai","0779127667","address");

        await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]")), 5000);
        const bookButton = await global.driver.findElements(By.xpath("//button[contains(text(),'ĐẶT HÀNG')]"));

        expect(bookButton.length).toBeGreaterThan(0);
        await bookButton[0].click();
        
        await sleep(2000);

        await global.driver.wait(until.elementLocated(By.css(".alert.alert-success:not(.alert-hidden)")), 5000);
        const toast = await global.driver.findElements(By.css(".alert.alert-success:not(.alert-hidden)"));

        expect(toast.length).toBeGreaterThan(0);

        const toastExpect = "Chúc mừng bạn đã đặt hàng thành công! Chúng tôi sẽ xử lý đơn hàng trong thời gian sớm nhất."

        expect(await toast[0].getText()).toEqual(toastExpect);
    })
})

describe("Kiểm thử giao diện khi xóa sản phẩm khỏi giỏ hàng", () => {
    beforeAll(async () => {
        await global.driver.get(baseUrl + "user/login");



        const usernameInput = await global.driver.wait(until.elementLocated(By.xpath("//input[@id='email']")), 5000);
        const passwordInput = await global.driver.wait(until.elementLocated(By.xpath("//input[@id='password']")), 5000);
        const loginButton = await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Đăng nhập')]")), 5000);

        await usernameInput.sendKeys('leducthaiamity@gmail.com');
        await passwordInput.sendKeys('123');
        await loginButton.click();

        await global.driver.wait(until.urlContains(baseUrl), 5000);

        let item = "Daily Wear trượt nước Coolmate";
        await addItemInCart(item);
        item = "cánh dơi nữ che nắng umi nữ ngắn dày trống nắng";
        await addItemInCart(item);
        //tim navigate
        await global.driver.wait(until.elementLocated(By.css("a[href='/cart']")), 5000);
        const checkoutButton = await global.driver.findElement(By.css("a[href='/cart']"));

        // navigate 
        await checkoutButton.click();

    })

    test("TC08 - Giỏ hàng hơn 1 sản phẩm", async () => {
             //tim quantity input
        await global.driver.wait(until.elementLocated(By.xpath("//a[normalize-space()='Xóa']")), 5000);
        const removeButton = await global.driver.findElements(By.xpath("//a[normalize-space()='Xóa']"));

        expect(removeButton.length).toBeGreaterThan(0);
        await removeButton[removeButton.length -1 ].click();

        // kiêm tra toast
        await global.driver.wait(until.elementLocated(By.css(".alert.alert-success:not(.alert-hidden)")), 5000);
        const toast = await global.driver.findElements(By.css(".alert.alert-success:not(.alert-hidden)"));

        expect(toast.length).toBeGreaterThan(0);

        await(1000);
        const product = await global.driver.findElements(By.xpath("(//tbody//tr)"));
        expect(product.length).toEqual(1);
    })
    test("TC09 -  Giỏ hàng còn 1 sản phẩm", async () => {
        //tim quantity input
        await global.driver.wait(until.elementLocated(By.xpath("//a[normalize-space()='Xóa']")), 5000);
        const removeButton = await global.driver.findElements(By.xpath("//a[normalize-space()='Xóa']"));

        expect(removeButton.length).toBeGreaterThan(0);
        await removeButton[removeButton.length -1 ].click();

        // kiêm tra toast
        await global.driver.wait(until.elementLocated(By.css(".alert.alert-success:not(.alert-hidden)")), 5000);
        const toast = await global.driver.findElements(By.css(".alert.alert-success:not(.alert-hidden)"));

        expect(toast.length).toBeGreaterThan(0);

        await(1000);
        const product = await global.driver.findElements(By.xpath("//td[contains(text(),'Chưa có sản phẩm nào!')]"));
        expect(product.length).toBe(1);
    })
})

const validateForm = async (userNameText , sdtText, addressText) => {
    await sleep(2000);
    await global.driver.wait(until.elementLocated(By.xpath("//input[@id='fullName']")), 5000);
    const userName = await global.driver.findElements(By.xpath("//input[@id='fullName']"));

    expect(userName.length).toBeGreaterThan(0);

    userName[0].clear();
    await sleep(500);
    userName[0].sendKeys(userNameText);
    
    await global.driver.wait(until.elementLocated(By.xpath("//input[@id='phone']")), 5000);
    const sdt = await global.driver.findElements(By.xpath("//input[@id='phone']"));

    expect(sdt.length).toBeGreaterThan(0);

    sdt[0].clear();
    await sleep(500);
    sdt[0].sendKeys(sdtText);

    await global.driver.wait(until.elementLocated(By.xpath("//input[@id='address']")), 5000);
    const address = await global.driver.findElements(By.xpath("//input[@id='address']"));

    expect(address.length).toBeGreaterThan(0);

    address[0].clear();
    await sleep(500);
    address[0].sendKeys(addressText);
    
}

const addItemInCart = async (item) => {
    await global.driver.get(baseUrl);

    // tim search input
    await global.driver.wait(until.elementLocated(By.css("input[placeholder='Nhập từ khóa...']")), 5000);
    const searchInput = await global.driver.findElement(By.css("input[placeholder='Nhập từ khóa...']"));

    await searchInput.sendKeys(item);

    // tim search button
    await global.driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Tìm']")), 5000);
    const searchButton = await global.driver.findElement(By.xpath("//button[normalize-space()='Tìm']"));

    await searchButton.click();

    //tim item 
    await global.driver.wait(until.elementLocated(By.xpath("//div[@class='product-item']")), 5000);
    const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));

    if( itemOrder.length == 0 ){
        console.log("Item not found?");
    }else{
        const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));
        await itemOrder[0].click();
        //click
        await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]")), 5000);
        const buttonSlot = await global.driver.findElement(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]"));

        await buttonSlot.click();
        
    }
}