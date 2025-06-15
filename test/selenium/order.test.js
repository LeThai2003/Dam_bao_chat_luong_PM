const { By, until } = require('selenium-webdriver');
const { baseUrl, sleep} = require('../setup');

// describe("Chosse Product Not Payment", () => {
//     test('should login', async () => { 
//         await global.driver.get(baseUrl + "user/login");

//         await global.driver.wait(until.elementLocated(By.css(".text-center.login-title")), 5000);
//         const title = await global.driver.findElement(By.css(".text-center.login-title"));
//         // kiem tra dung trang chua
//         expect(await title.getText()).toEqual("Đăng nhập tài khoản");

//         const usernameInput = await global.driver.wait(until.elementLocated(By.xpath("//input[@id='email']")), 5000);
//         const passwordInput = await global.driver.wait(until.elementLocated(By.xpath("//input[@id='password']")), 5000);
//         const loginButton = await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Đăng nhập')]")), 5000);

//         await usernameInput.sendKeys('leducthaiamity@gmail.com');
//         await passwordInput.sendKeys('123');
//         await loginButton.click();

//         await global.driver.wait(until.urlContains(baseUrl), 5000);
//         const currentUrl = await global.driver.getCurrentUrl();
//         expect(currentUrl).toEqual(baseUrl);
//     })
//     test("should order item stock", async () => {

//         const item = "Áo khoác kaki nam hàn quốc cao cấp M FASHION";

//         // tim search input
//         await global.driver.wait(until.elementLocated(By.css("input[placeholder='Nhập từ khóa...']")), 5000);
//         const searchInput = await global.driver.findElement(By.css("input[placeholder='Nhập từ khóa...']"));

//         await searchInput.sendKeys(item);

//         // tim search button
//         await global.driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Tìm']")), 5000);
//         const searchButton = await global.driver.findElement(By.xpath("//button[normalize-space()='Tìm']"));

//         await searchButton.click();

//         //tim item 
//         await global.driver.wait(until.elementLocated(By.xpath("//div[@class='product-item']")), 5000);
//         const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));

//         if( itemOrder.length == 0 ){
//             console.log("Item not found?");
//         }else{
//             await itemOrder[0].click();
//             // kiem tra con hang khong
//             await global.driver.wait(until.elementLocated(By.xpath("//p[@class='out-of-stock']")), 5000);
//             const outStock = await global.driver.findElements(By.xpath("//p[@class='out-of-stock']"));
//             expect(outStock.length).toBeGreaterThan(0);
//         }
//     })
//     test("should order item", async () => {
//         await global.driver.navigate().back();
//         await global.driver.navigate().back();
//         const item = "Daily Wear trượt nước Coolmate";
    
//         // tim search input
//         await global.driver.wait(until.elementLocated(By.css("input[placeholder='Nhập từ khóa...']")), 5000);
//         const searchInput = await global.driver.findElement(By.css("input[placeholder='Nhập từ khóa...']"));

//         await searchInput.clear();
//         await searchInput.sendKeys(item);

//         // tim search button
//         await global.driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Tìm']")), 5000);
//         const searchButton = await global.driver.findElement(By.xpath("//button[normalize-space()='Tìm']"));
        
//         await searchButton.click();

//         //tim item 
//         await global.driver.wait(until.elementLocated(By.xpath("//div[@class='product-item']")), 5000);
//         const itemOrder = await global.driver.findElements(By.xpath("//div[@class='product-item']"));

//         if( itemOrder.length == 0 ){
//             console.log("Item not found?");
//         }else{
//             await itemOrder[0].click();
//         }
//     })
//     test("should select product quantity greater than stock quantity", async () => {
//         //tim so luong item con lai
//         await global.driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'inner-stock')]//span")), 5000);
//         const stockElement = await global.driver.findElement(By.xpath("//div[contains(@class, 'inner-stock')]//span"));
//         const stockText = await stockElement.getText();
//         const itemSlot = parseInt(stockText);
//         const outStockSlot = itemSlot + 100;
        
//         // tim input stock 
//         await global.driver.wait(until.elementLocated(By.xpath("//input[@name='quantity']")), 5000);
//         const inputSlot = await global.driver.findElement(By.xpath("//input[@name='quantity']"));
//         await inputSlot.clear();
//         await inputSlot.sendKeys(outStockSlot.toString());

//         //click
//         await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]")), 5000);
//         const buttonSlot = await global.driver.findElement(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]"));

//         const urlExpect = await global.driver.getCurrentUrl();

//         await buttonSlot.click();

//         await sleep(1000); // Give some time for the tooltip to appear

//         const urlActual = await global.driver.getCurrentUrl();

//         expect(urlExpect).toEqual(urlActual);
//     })
//     test("should add item in order", async () => {
//         await sleep(1000);
//         // tim input stock 
//         await global.driver.wait(until.elementLocated(By.xpath("//input[@name='quantity']")), 5000);
//         const inputSlot = await global.driver.findElement(By.xpath("//input[@name='quantity']"));
//         await inputSlot.clear();
//         await inputSlot.sendKeys(1);

//         //click
//         await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]")), 5000);
//         const buttonSlot = await global.driver.findElement(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]"));

//         await buttonSlot.click();

//         // kiêm tra toast
//         await global.driver.wait(until.elementLocated(By.css(".alert.alert-success:not(.alert-hidden)")), 5000);
//         const toast = await global.driver.findElements(By.css(".alert.alert-success:not(.alert-hidden)"));

//         expect(toast.length).toBeGreaterThan(0);
//     });
//     test("should navigate to checkout", async () => {
//         //tim navigate
//         await global.driver.wait(until.elementLocated(By.css("a[href='/cart']")), 5000);
//         const checkoutButton = await global.driver.findElement(By.css("a[href='/cart']"));

//         // navigate 
//         await checkoutButton.click();

//         // Wait for the URL to change to the cart/checkout page
//         await global.driver.wait(until.urlContains(baseUrl + 'cart'), 10000); // Increased timeout for URL change

//         // Add a temporary longer sleep to ensure page fully loads
//         await sleep(2000);

//         //tim title
//         await global.driver.wait(until.elementLocated(By.css(".inner-title.title")), 5000);
//         const checkoutTitle = await global.driver.findElement(By.css(".inner-title.title"));
//         const titleExpect = "Giỏ hàng";
//         expect(titleExpect).toEqual(await checkoutTitle.getText());
//     })
//     test("should choose out stock in order", async () => {
//         //tim quantity input
//         await global.driver.wait(until.elementLocated(By.xpath("//input[@name='quantity']")), 5000);
//         const quantityInput = await global.driver.findElement(By.xpath("//input[@name='quantity']"));

//         await quantityInput.sendKeys(100000);
//         await sleep(3000);
//         // thanh toa
//         await global.driver.wait(until.elementLocated(By.xpath("//a[normalize-space()='THANH TOÁN']")), 5000);
//         const paymentButton = await global.driver.findElement(By.xpath("//a[normalize-space()='THANH TOÁN']"));

//         //click button
//         await paymentButton.click();

//         await global.driver.wait(until.elementLocated(By.xpath("//div[@class='alert alert-warning']")), 5000);
//         const errorMessage = await global.driver.findElements(By.xpath("//div[@class='alert alert-warning']"));

//         expect(errorMessage.length).toBeGreaterThan(0);
//     })
//     test("should remove item in order", async () => {
//         //tim quantity input
//         await global.driver.wait(until.elementLocated(By.xpath("//a[normalize-space()='Xóa']")), 5000);
//         const removeButton = await global.driver.findElements(By.xpath("//a[normalize-space()='Xóa']"));

//         expect(removeButton.length).toBeGreaterThan(0);
//         await removeButton[0].click();

//         // kiêm tra toast
//         await global.driver.wait(until.elementLocated(By.css(".alert.alert-success:not(.alert-hidden)")), 5000);
//         const toast = await global.driver.findElements(By.css(".alert.alert-success:not(.alert-hidden)"));

//         expect(toast.length).toBeGreaterThan(0);
//     })
// })

describe("Choose Product And Payment", () => {
    test("should order item", async () => {
        await global.driver.get(baseUrl);

        //check logout 
        // await global.driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Đăng xuất')]")));
        const logoutButton = await global.driver.findElements(By.xpath("//a[contains(text(),'Đăng xuất')]"));

        if( logoutButton.length > 0 ){
            await logoutButton[0].click();
            await global.driver.wait(until.urlContains(baseUrl), 5000);
            await sleep(2000);
        }

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
            await itemOrder[0].click();
        }
    })

    test("should add item in order ( not login)", async () => {
        await sleep(1000);
        // tim input stock 
        await global.driver.wait(until.elementLocated(By.xpath("//input[@name='quantity']")), 5000);
        const inputSlot = await global.driver.findElement(By.xpath("//input[@name='quantity']"));
        await inputSlot.clear();
        await inputSlot.sendKeys(1);

        //click
        await global.driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]")), 5000);
        const buttonSlot = await global.driver.findElement(By.xpath("//button[contains(text(),'Thêm vào giỏ hàng')]"));

        await buttonSlot.click();

        await global.driver.wait(until.urlContains(baseUrl + "user/login"), 5000);
        const currentUrl = await global.driver.getCurrentUrl();
        expect(currentUrl).toEqual(baseUrl + "user/login");
    });
    test('should login', async () => { 

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
        const currentUrl = await global.driver.getCurrentUrl();
        expect(currentUrl).toEqual(baseUrl);
    });
    test("choose order item", async () => {

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
            await itemOrder[0].click();
        }
    })

    test("should add item in order ( not login)", async () => {
        await sleep(1000);
        // tim input stock 
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

    });
    test("should navigate to checkout", async () => {
        //tim navigate
        await global.driver.wait(until.elementLocated(By.css("a[href='/cart']")), 5000);
        const checkoutButton = await global.driver.findElement(By.css("a[href='/cart']"));

        // navigate 
        await checkoutButton.click();

        // Wait for the URL to change to the cart/checkout page
        await global.driver.wait(until.urlContains(baseUrl + 'cart'), 10000); // Increased timeout for URL change

        // Add a temporary longer sleep to ensure page fully loads
        await sleep(2000);

        //tim title
        await global.driver.wait(until.elementLocated(By.css(".inner-title.title")), 5000);
        const checkoutTitle = await global.driver.findElement(By.css(".inner-title.title"));
        const titleExpect = "Giỏ hàng";
        expect(titleExpect).toEqual(await checkoutTitle.getText());
    })
    test("should choose out stock in order", async () => {
        //tim quantity input
        await global.driver.wait(until.elementLocated(By.xpath("//input[@name='quantity']")), 5000);
        let quantityInput = await global.driver.findElement(By.xpath("//input[@name='quantity']"));
        await sleep(5000);
        await quantityInput.clear();

        // await global.driver.wait(until.elementLocated(By.xpath("//input[@name='quantity']")), 5000);
        // quantityInput = await global.driver.findElement(By.xpath("//input[@name='quantity']"));
        // await quantityInput.sendKeys(1);
        // // thanh toa
        // await global.driver.wait(until.elementLocated(By.xpath("//a[normalize-space()='THANH TOÁN']")), 5000);
        // const paymentButton = await global.driver.findElement(By.xpath("//a[normalize-space()='THANH TOÁN']"));

        // //click button
        // await paymentButton.click();

        // await global.driver.wait(until.elementLocated(By.css(".col-12.form-checkout")), 5000);
        // const formInfo = await global.driver.findElements(By.css(".col-12.form-checkout"));

        // expect(formInfo.length).toBeGreaterThan(0);
    })

})