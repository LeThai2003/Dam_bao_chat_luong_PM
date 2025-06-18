const { By, until } = require('selenium-webdriver');
const { baseUrl, sleep } = require('../setup');

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

describe('Product Page Tests', () => {
    test('should load product page', async () => {
        await global.driver.get(baseUrl + 'products');
        const title = await global.driver.getTitle();
        expect(title).toBeDefined();
    });
});

describe('Render Product Page Tests', () => {
    test('should render product list', async () => {
        await global.driver.get(baseUrl + 'products');
        await global.driver.wait(until.elementLocated(By.css('.row.w-100.ml-1.my-3')), 5000);
        const productList = await global.driver.findElements(By.className('col-12 col-sm-6 col-md-4 col-lg-3 mb-3'));
        expect(productList.length).toBeGreaterThan(0);
    });

    test('should display product title', async () => {
        await global.driver.get(baseUrl + 'products');
        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        const productTitle = await global.driver.findElement(By.css('h3.inner-title.product-title'));
        const titleText = await productTitle.getText();
        expect(titleText).toBeTruthy();
    });
});

describe('Search Product Tests', () => {
    test('should search product', async () => {
        const keyFind = "Ao";
        await global.driver.get(baseUrl + 'products');

        await global.driver.wait(until.elementLocated(By.css("input[placeholder='Tìm kiếm sản phẩm']")), 5000);
        const inputSearch = await global.driver.findElement(By.css("input[placeholder='Tìm kiếm sản phẩm']"));
        await inputSearch.sendKeys(keyFind);

        await global.driver.wait(until.elementLocated(By.css("button[type='submit']")), 5000);
        const buttonSearch = await global.driver.findElement(By.css("button[type='submit']"));
        await buttonSearch.click();

        // Wait for product titles to load
        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        const productTitles = await global.driver.findElements(By.css('h3.inner-title.product-title'));

        // Check if we have any results
        expect(productTitles.length).toBeGreaterThan(0);
        
        // Check if any title contains "Ao"
        let foundAo = true;
        for (const title of productTitles) {
            const text = await title.getText();
            if (!removeAccents(text.toLowerCase()).includes(removeAccents(keyFind.toLowerCase()))) {
                foundAo = false;
                break;
            }
        }
        expect(foundAo).toBe(true);
    });
});

describe("Clear Filter Tests", () => {
    test("should clear filter", async () => {

        const dropdownOrigin = "price-desc";
        const dropdownChange = "title-asc";

        await global.driver.get(baseUrl + 'products');

        // Wait for initial product list
        await global.driver.wait(until.elementLocated(By.css('.row.w-100.ml-1.my-3')), 5000);
        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        
        // Get initial product list and store titles
        const initialProductElements = await global.driver.findElements(By.css('h3.inner-title.product-title'));
        const initialTitles = [];
        for (const element of initialProductElements) {
            initialTitles.push(await element.getText());
        }

        // Select sort option
        await global.driver.wait(until.elementLocated(By.css("select[name='sort']")), 5000);
        const dropdown = await global.driver.findElement(By.css("select[name='sort']"));
        await dropdown.sendKeys(dropdownChange);
        
        // Wait for sorted list
        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        
        // Get sorted list and store titles
        const sortedProductElements = await global.driver.findElements(By.css('h3.inner-title.product-title'));
        const sortedTitles = [];
        for (const element of sortedProductElements) {
            sortedTitles.push(await element.getText());
        }

        // Click clear button
        await global.driver.wait(until.elementLocated(By.css('.btn.btn-danger')), 5000);
        const clearButton = await global.driver.findElement(By.css('.btn.btn-danger'));
        await clearButton.click();

        // Wait for cleared list
        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        
        // Get final list and store titles
        const finalProductElements = await global.driver.findElements(By.css('h3.inner-title.product-title'));
        const finalTitles = [];
        for (const element of finalProductElements) {
            finalTitles.push(await element.getText());
        }

        // Verify lengths match
        expect(finalTitles.length).toEqual(initialTitles.length);

        // Compare each title
        let allTitlesMatch = true;
        for (let i = 0; i < initialTitles.length; i++) {
            if (initialTitles[i] !== finalTitles[i]) {
                allTitlesMatch = false;
                break;
            }
        }

        expect(allTitlesMatch).toBe(true);

        // check dropdown
        await global.driver.wait(until.elementLocated(By.css("select[name='sort']")), 5000);
        const dropdownNew = await global.driver.findElement(By.css("select[name='sort']"));
        const value = await dropdownNew.getAttribute('value');
        expect(value).toEqual(dropdownOrigin);
    });
});

describe("Navigate to detail product", () => {
    test("should navigate to detail product", async () => {
        await global.driver.get(baseUrl + 'products');

        await global.driver.wait(until.elementLocated(By.className("product-item")), 5000);
        const productList = await global.driver.findElements(By.className("product-item"));
        expect(productList.length).not.toBe(0);
        
        // Get the product title from the list page
        const productTitleElement = await productList[0].findElement(By.css('h3.inner-title.product-title'));
        const titleActual = await productTitleElement.getText();
        await productList[0].click();

        // Wait for and get the product title on the detail page
        await global.driver.wait(until.elementLocated(By.css('.inner-title.product-title')), 5000);
        const productDetail = await global.driver.findElement(By.css('.inner-title.product-title'));
        const detailTitle = await productDetail.getText();

        expect(titleActual).toEqual(detailTitle);
    });
});

describe("Change to Page", () => {
    test("should check if only one page exists", async () => {
        await global.driver.get(baseUrl + 'products');
        
        // Wait for pagination to load
        await global.driver.wait(until.elementLocated(By.css('.pagination')), 5000);
        
        // Get all page items
        const pageItems = await global.driver.findElements(By.css('.page-item'));
        
        // Check if next button exists
        const nextButtons = await global.driver.findElements(By.css('.page-link.next-page'));
        
        if (pageItems.length === 1) {
            // If only one page, next button should not exist
            expect(nextButtons.length).toBe(0);
        } else {
            // If multiple pages, next button should exist
            expect(nextButtons.length).toBeGreaterThan(0);
        }
    });

    test("should next to page", async () => {
        await global.driver.get(baseUrl + 'products');
        
        // Wait for pagination to load
        await global.driver.wait(until.elementLocated(By.css('.pagination')), 5000);
        
        // Check if next button exists
        const nextButtons = await global.driver.findElements(By.css('.page-link.next-page'));
        
        if (nextButtons.length > 0) {
            // Only proceed if next button exists
            const nextButton = nextButtons[0];
            
            // Get current page number
            const activePage = await global.driver.findElement(By.css("li[class='page-item active'] button[class='page-link']"));
            const pageExpect = Number.parseInt(await activePage.getText()) + 1;
            
            // Click next button
            await nextButton.click();
            
            // Wait for and verify new page number
            await global.driver.wait(until.elementLocated(By.css("li[class='page-item active'] button[class='page-link']")), 5000);
            const activeNewPage = await global.driver.findElement(By.css("li[class='page-item active'] button[class='page-link']"));
            const pageActual = Number.parseInt(await activeNewPage.getText());
            
            expect(pageActual).toBe(pageExpect);
        } else {
            // Skip test if no next button
            console.log("No next page available - skipping test");
        }
    });

    test("should previous to page", async () => {
        
        // Wait for pagination to load
        await global.driver.wait(until.elementLocated(By.css('.pagination')), 5000);
        
        // Check if previous button exists
        const prevButtons = await global.driver.findElements(By.css('.page-link.previous-page'));
        
        if (prevButtons.length > 0) {
            // Only proceed if previous button exists
            const prevButton = prevButtons[0];
            
            // Get current page number
            const activePage = await global.driver.findElement(By.css("li[class='page-item active'] button[class='page-link']"));
            const pageExpect = Number.parseInt(await activePage.getText()) - 1;
            
            // Click previous button
            await prevButton.click();
            
            // Wait for and verify new page number
            await global.driver.wait(until.elementLocated(By.css("li[class='page-item active'] button[class='page-link']")), 5000);
            const activeNewPage = await global.driver.findElement(By.css("li[class='page-item active'] button[class='page-link']"));
            const pageActual = Number.parseInt(await activeNewPage.getText());
            
            expect(pageActual).toBe(pageExpect);
        } else {
            // Skip test if no previous button
            console.log("No previous page available - skipping test");
        }
    });
});


describe("Filter in Product", () => {
    test("should a-z filter click", async () => {
        //option
        const sortFiler = "title-asc";

        await global.driver.get(baseUrl + 'products');
        // Select sort option
        await global.driver.wait(until.elementLocated(By.css("select[name='sort']")), 5000);
        const dropdown = await global.driver.findElement(By.css("select[name='sort']"));
        await global.driver.executeScript(
            "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('change'));",
            dropdown,
            sortFiler
          );

        // Wait for product titles to load and page to update
        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for sorting to complete
        
        // Get all product titles
        const productTitles = await global.driver.findElements(By.css('h3.inner-title.product-title'));
        const listActual = [];
        
        // Get text from each title element
        for (const element of productTitles) {
            const text = await element.getText();
            listActual.push(text);
        }

        // Sort the list for comparison
        const listExpect = [...listActual].sort();

        expect(listActual).toEqual(listExpect);
    });

    test("should z-a filter click", async () => {
        //option
        const sortFiler = "title-desc";

        // Select sort option
        await global.driver.wait(until.elementLocated(By.css("select[name='sort']")), 5000);
        const dropdown = await global.driver.findElement(By.css("select[name='sort']"));
        await global.driver.executeScript(
            "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('change'));",
            dropdown,
            sortFiler
          );
        // Wait for product titles to load and page to update
        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for sorting to complete
        
        // Get all product titles
        const productTitles = await global.driver.findElements(By.css('h3.inner-title.product-title'));
        const listActual = [];
        
        // Get text from each title element
        for (const element of productTitles) {
            const text = await element.getText();
            listActual.push(text);
        }

        // Sort the list for comparison (reverse order)
        const listExpect = [...listActual].sort((a, b) => b.localeCompare(a));

        expect(listActual).toEqual(listExpect);
    });

    test("should z-a filter click", async () => {
        //option
        const sortFiler = "title-desc";

        // Select sort option
        await global.driver.wait(until.elementLocated(By.css("select[name='sort']")), 5000);
        const dropdown = await global.driver.findElement(By.css("select[name='sort']"));
        await global.driver.executeScript(
            "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('change'));",
            dropdown,
            sortFiler
          );

        // Wait for product titles to load and page to update
        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for sorting to complete
        
        // Get all product titles
        const productTitles = await global.driver.findElements(By.css('h3.inner-title.product-title'));
        const listActual = [];
        
        // Get text from each title element
        for (const element of productTitles) {
            const text = await element.getText();
            console.log(text);
            listActual.push(text);
        }

        // Sort the list for comparison (reverse order)
        const listExpect = [...listActual].sort((a, b) => b.localeCompare(a));

        expect(listActual).toEqual(listExpect);
    });

    test("should increase price filter click", async () => {
        //option
        const sortFiler = "price-asc";

        // Select sort option
        await global.driver.wait(until.elementLocated(By.css("select[name='sort']")), 5000);
        const dropdown = await global.driver.findElement(By.css("select[name='sort']"));
        await global.driver.executeScript(
            "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('change'));",
            dropdown,
            sortFiler
          );

        // Wait for product titles to load and page to update
        await global.driver.wait(until.elementLocated(By.css('.inner-price-new')), 5000);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for sorting to complete
        
        // Get all product titles
        const productTitles = await global.driver.findElements(By.css('.inner-price-new'));
        const listActual = [];
        
        // Get text from each title element
        for (const element of productTitles) {
            const text = Number.parseInt(await element.getText());
            listActual.push(text);
        }

        // Sort the list for comparison (reverse order)
        const listExpect = [...listActual].sort((a, b) => a > b);

        expect(listActual).toEqual(listExpect);
    });

    test("should decrease price filter click", async () => {
        //option
        const sortFiler = "price-asc";

        // Select sort option
        await global.driver.wait(until.elementLocated(By.css("select[name='sort']")), 5000);
        const dropdown = await global.driver.findElement(By.css("select[name='sort']"));
        await global.driver.executeScript(
            "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('change'));",
            dropdown,
            sortFiler
          );

        // Wait for product titles to load and page to update
        await global.driver.wait(until.elementLocated(By.css('.inner-price-new')), 5000);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for sorting to complete
        
        // Get all product titles
        const productTitles = await global.driver.findElements(By.css('.inner-price-new'));
        const listActual = [];
        
        // Get text from each title element
        for (const element of productTitles) {
            const text = Number.parseInt(await element.getText());
            listActual.push(text);
        }

        // Sort the list for comparison (reverse order)
        const listExpect = [...listActual].sort((a, b) => a < b);

        expect(listActual).toEqual(listExpect);
    });

    test("should a-z filter click and search", async () => {
        //option
        const sortFiler = "title-asc";
        const keyFind = "Ao";

        await global.driver.get(baseUrl + 'products');

        // First do the search
        await global.driver.wait(until.elementLocated(By.css("input[placeholder='Tìm kiếm sản phẩm']")), 5000);
        const inputSearch = await global.driver.findElement(By.css("input[placeholder='Tìm kiếm sản phẩm']"));
        await inputSearch.sendKeys(keyFind);

        await global.driver.wait(until.elementLocated(By.css("button[type='submit']")), 5000);
        const buttonSearch = await global.driver.findElement(By.css("button[type='submit']"));
        await buttonSearch.click();

        // Wait for search results
        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Then apply the sort
        await global.driver.wait(until.elementLocated(By.css("select[name='sort']")), 5000);
        const dropdown = await global.driver.findElement(By.css("select[name='sort']"));
        await global.driver.executeScript(
            "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('change'));",
            dropdown,
            sortFiler
          );

        // Wait for sorting to complete
        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get all product titles
        const productTitles = await global.driver.findElements(By.css('h3.inner-title.product-title'));
        const listActual = [];
        
        // Get text from each title element
        for (const element of productTitles) {
            const text = await element.getText();
            listActual.push(text);
        }

        // Sort the list for comparison
        const listExpect = [...listActual].sort();

        expect(listActual).toEqual(listExpect);
        
        // Check if we have any results
        expect(productTitles.length).toBeGreaterThan(0);
        
        // Check if any title contains "Ao"
        let foundAo = true;
        for (const title of productTitles) {
            const text = await title.getText();
            if (!removeAccents(text.toLowerCase()).includes(removeAccents(keyFind.toLowerCase()))) {
                foundAo = false;
                break;
            }
        }
        expect(foundAo).toBe(true);
    });


    test("should z-a filter click and search", async () => {
        //option
        const sortFiler = "title-desc";
        const keyFind = "Ao";


        // Select sort option
        await global.driver.wait(until.elementLocated(By.css("select[name='sort']")), 5000);
        const dropdown = await global.driver.findElement(By.css("select[name='sort']"));
        await global.driver.executeScript(
            "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('change'));",
            dropdown,
            sortFiler
          );

        // Wait for product titles to load and page to update
        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for sorting to complete
        
        // Get all product titles
        const productTitles = await global.driver.findElements(By.css('h3.inner-title.product-title'));
        const listActual = [];
        
        // Get text from each title element
        for (const element of productTitles) {
            const text = await element.getText();
            listActual.push(text);
        }

        // Sort the list for comparison (reverse order)
        const listExpect = [...listActual].sort((a, b) => !b.localeCompare(a));
        
        
        expect(listActual).toEqual(listExpect);

        // Check if we have any results
        expect(productTitles.length).toBeGreaterThan(0);

        // Check if any title contains "Ao"
        let foundAo = true;
        for (const title of productTitles) {
            const text = await title.getText();
            if (!removeAccents(text.toLowerCase()).includes(removeAccents(keyFind.toLowerCase()))) {
                foundAo = false;
                break;
            }
        }
        expect(foundAo).toBe(true);
    });

    test("should increase price filter click", async () => {
        //option
        const keyFind = "Ao";
        const sortFiler = "price-asc";

        // Select sort option
        await global.driver.wait(until.elementLocated(By.css("select[name='sort']")), 5000);
        const dropdown = await global.driver.findElement(By.css("select[name='sort']"));
        await global.driver.executeScript(
            "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('change'));",
            dropdown,
            sortFiler
          );

        // Wait for product titles to load and page to update
        await global.driver.wait(until.elementLocated(By.css('.inner-price-new')), 5000);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for sorting to complete
        
        // Get all product titles
        const productPrice = await global.driver.findElements(By.css('.inner-price-new'));
        const listActual = [];
        
        // Get text from each title element
        for (const element of productPrice) {
            const text = Number.parseInt(await element.getText());
            listActual.push(text);
        }

        // Sort the list for comparison (reverse order)
        const listExpect = [...listActual].sort((a, b) => a > b);

        expect(listActual).toEqual(listExpect);

        // Check if we have any results
        expect(productPrice.length).toBeGreaterThan(0);


        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get all product titles
        const productTitles = await global.driver.findElements(By.css('h3.inner-title.product-title'));
        
        // Check if any title contains "Ao"
        let foundAo = true;
        for (const title of productTitles) {
            const text = await title.getText();
            if (!removeAccents(text.toLowerCase()).includes(removeAccents(keyFind.toLowerCase()))) {
                foundAo = false;
                break;
            }
        }
        expect(foundAo).toBe(true);
    });

    test("should decrease price filter click", async () => {
        //option
        const sortFiler = "price-asc";
        const keyFind = "Ao";
       
        // Select sort option
        await global.driver.wait(until.elementLocated(By.css("select[name='sort']")), 5000);
        const dropdown = await global.driver.findElement(By.css("select[name='sort']"));
        await global.driver.executeScript(
            "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('change'));",
            dropdown,
            sortFiler
          );

        // Wait for product titles to load and page to update
        await global.driver.wait(until.elementLocated(By.css('.inner-price-new')), 5000);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for sorting to complete
        
        // Get all product titles
        const productPrice = await global.driver.findElements(By.css('.inner-price-new'));
        const listActual = [];
        
        // Get text from each title element
        for (const element of productPrice) {
            const text = Number.parseInt(await element.getText());
            listActual.push(text);
        }

        // Sort the list for comparison (reverse order)
        const listExpect = [...listActual].sort((a, b) => a < b);

        expect(listActual).toEqual(listExpect);

        // Check if we have any results
        expect(productPrice.length).toBeGreaterThan(0);
        await global.driver.wait(until.elementLocated(By.css('h3.inner-title.product-title')), 5000);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get all product titles
        const productTitles = await global.driver.findElements(By.css('h3.inner-title.product-title'));
        
   
        // Check if any title contains "Ao"
        let foundAo = true;
        for (const title of productTitles) {
            const text = await title.getText();
            if (!removeAccents(text.toLowerCase()).includes(removeAccents(keyFind.toLowerCase()))) {
                foundAo = false;
                break;
            }
        }
        expect(foundAo).toBe(true);
    });
})

