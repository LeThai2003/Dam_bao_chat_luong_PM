const { By, until } = require('selenium-webdriver');
const { baseUrl } = require('../setup');

// describe('Product Page Tests', () => {
//     test('should load product page', async () => {
//         await global.driver.get(baseUrl + 'products');
//         const title = await global.driver.getTitle();
//         expect(title).toBeDefined();
//     });
// });

// describe('Render Product Page Tests', () => {
//     test('should render product list', async () => {
//         await global.driver.get(baseUrl + 'products');
//         await global.driver.wait(until.elementLocated(By.css('.row.w-100.ml-1.my-3')), 5000);
//         const productList = await global.driver.findElements(By.className('col-12 col-sm-6 col-md-4 col-lg-3 mb-3'));
//         expect(productList.length).toBeGreaterThan(0);
//     });

//     test('should display product title', async () => {
//         await global.driver.get(baseUrl + 'products');
//         await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
//         const productTitle = await global.driver.findElement(By.css('h3.inner-title.product-title'));
//         const titleText = await productTitle.getText();
//         expect(titleText).toBeTruthy();
//     });
// });

// describe('Search Product Tests', () => {
//     test('should search product', async () => {
//         const keyFind = "Ao";
//         await global.driver.get(baseUrl + 'products');
//         debugger; // Breakpoint 1: After page load

//         await global.driver.wait(until.elementLocated(By.css("input[placeholder='Tìm kiếm sản phẩm']")), 5000);
//         const inputSearch = await global.driver.findElement(By.css("input[placeholder='Tìm kiếm sản phẩm']"));
//         await inputSearch.sendKeys(keyFind);
//         debugger; // Breakpoint 2: After entering search text

//         await global.driver.wait(until.elementLocated(By.css("button[type='submit']")), 5000);
//         const buttonSearch = await global.driver.findElement(By.css("button[type='submit']"));
//         await buttonSearch.click();
//         debugger; // Breakpoint 3: After clicking search

//         // Wait for product titles to load
//         await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
//         const productTitles = await global.driver.findElements(By.css('h3.inner-title.product-title'));
//         debugger; // Breakpoint 4: After getting product titles

//         // Check if we have any results
//         expect(productTitles.length).toBeGreaterThan(0);
        
//         // Check if any title contains "Ao"
//         let foundAo = false;
//         for (const title of productTitles) {
//             const text = await title.getText();
//             debugger; // Breakpoint 5: Check each title text
//             if (text.toLowerCase().includes(keyFind.toLowerCase())) {
//                 foundAo = true;
//                 break;
//             }
//         }
//         expect(foundAo).toBe(true);
//     });
// });

describe("Clear Filter Tests", () => {
    test("should clear filter", async () => {
        await global.driver.get(baseUrl + 'products');

        await global.driver.wait(until.elementLocated(By.css('.row.w-100.ml-1.my-3')), 5000);
        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        // danh sach ban dau
        const productList = await global.driver.findElements(By.css('h3.inner-title.product-title'));

        await global.driver.wait(until.elementLocated(By.css("select[name='sort']")), 5000);
        const dropdown = await global.driver.findElement(By.css("select[name='sort']"));
        
        // Select option by value
        await dropdown.sendKeys('title-asc');

        // OR select by visible text
        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        // danh sach ban dau
        const productListNew = await global.driver.findElements(By.css('h3.inner-title.product-title'));
        
        // Get and display all product titles
        for(let i = 0; i < productListNew.length; i++) {
            const title = await productListNew[i].getText();
            console.log(`Product ${i + 1}: ${title}`);
        }

        //await clear button
        await clearButton = await global.driver.
        // Wait for the page to update after selection
        // await global.driver.wait(until.elementLocated(By.css('.row.w-100.ml-1.my-3')), 5000);
        
        // // Get the new sorted list
        // const sortedList = await global.driver.findElements(By.css('h3.inner-title.product-title'));
        
        // Verify the list has changed
        expect(sortedList.length).toBeGreaterThan(0);
    });
})