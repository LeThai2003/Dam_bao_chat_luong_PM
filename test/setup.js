const { Builder, Browser } = require('selenium-webdriver');

let driver;
let baseUrl = 'http://localhost:3000/';

beforeAll(async () => {
    driver = await new Builder()
        .forBrowser(Browser.CHROME)
        .build();
    global.driver = driver;
    console.log('Driver initialized');
});

afterAll(async () => {
    if (driver) {
        await driver.quit();
        console.log('Driver quit');
    }
});

// Export the driver immediately
module.exports = { driver, baseUrl };