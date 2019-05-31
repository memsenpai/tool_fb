var unirest = require('unirest');
var bloomHelper = require('./bloomHelper');
var utils = require('../utils');
var randomUserAgent = require('random-user-agent');
var faker = require('faker');
var puppeteerCreate = require('puppeteer');

var checkBlanceHelper = {
    createNewAccount: async function (showBrowser = true) {
        let dataReg = {
            firstname: faker.name.findName(),
            lastname: faker.name.lastName(),
            email: faker.internet.email(),
            password: faker.internet.password().replace(/[^a-zA-Z ]/g, ""),
            birthMonth: '01',
            birthDay: '15',
            birthYear: '1990'
        }


        let modePuppeteer = {
            headless: showBrowser,
            ignoreHTTPSErrors: true,
            args: ['--start-maximized', '--no-sandbox', '--hide-scrollbars', '--mute-audio', '--disable-setuid-sandbox', '--disable-sync', '--disable-background-networking', '--disable-infobars', '--disable-setuid-sandbox', '--ignore-certifcate-errors']
        };

        let browser = await puppeteerCreate.launch(modePuppeteer);
        let page = (await browser.pages())[0];

        let userAgent = randomUserAgent('mobile');

        await page.setUserAgent(userAgent);

        await page.setViewport({
            width: 1368,
            height: 720
        });

        await page.goto("https://www.bloomingdales.com/account/createaccount").catch(() => {});
        await page.waitFor(2000);
        await page.evaluate((dataReg) => {
            document.querySelector("#ca-profile-firstname").value = dataReg.firstname
            document.querySelector("#ca-profile-lastname").value = dataReg.lastname
            document.querySelector("#ca-profile-email").value = dataReg.email
            document.querySelector("#ca-profile-password").value = dataReg.password
            document.querySelector("#ca-profile-birth-month").value = dataReg.birthMonth
            document.querySelector("#ca-profile-birth-day").value = dataReg.birthDay
            document.querySelector("#ca-profile-birth-year").value = dataReg.birthYear
            document.querySelector("#ca-profile-submit").click()
        }, dataReg);

        await page.waitFor(10000);

        let cookie = await page.cookies();
        await page.close();
        await browser.close();

        return cookie
    },
    checkBlance: async function (cookies, loyaltInput) {
        let result = {};

        try {

            let dataAdd = {
                ...loyaltInput,
                action: "associateByLastName",
                attemptsCount: 0,
            }


            let requestBloom = bloomHelper.buildRequest(cookies, JSON.stringify(dataAdd).length);

            let headers = {
                "x-requested-with": "XMLHttpRequest",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36",
                "referer": "https://www.bloomingdales.com/loyallist/accountsummary",
                "cookie": bloomHelper.cookiesParseString(cookies),
                "cache-control": "no-cache,no-cache",
                "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
                "accept-encoding": "gzip, deflate, br",
                "accept": "application/json, text/javascript, */*; q=0.01"
            };

            let req = unirest("GET", "https://m.bloomingdales.com/api/v1/wallet/rewardcards");

            req.headers(headers);

            let resultBlance = await new Promise((resolve, reject) => {
                req.end(function (res) {
                    resolve((res.body));
                });
            });

            let blance = "No Blance"

            if (resultBlance.rewardcards && resultBlance.rewardcards.rewardcard && resultBlance.rewardcards.rewardcard[0]) {

                let countBlance = resultBlance.rewardcards.rewardcard.length;
                let totalBlance = resultBlance.rewardcards.rewardcard.reduce( (accumulator, currentValue)  => { return accumulator + Number (currentValue.amount) ; }, 0);

                blance = resultBlance.rewardcards.rewardcard.map(rewardcardData => [
                    rewardcardData.cardNumber,
                    rewardcardData.cid,
                    "$"+rewardcardData.amount,
                    rewardcardData.cardType,
                    rewardcardData.expireDate,
                    rewardcardData.status,
                ].join(' | '));


                blance = ` Total (${countBlance}) \$${totalBlance} : / [${blance.join('] - [')}]`
            }

            result = {
                ...loyaltInput,
                blance
            };

            let loyaltyNumberCurrent = loyaltInput.loyaltyNumber;


            await requestBloom.delete(`https://www.bloomingdales.com/loyallist/accountassociation/${loyaltyNumberCurrent}`);

        } catch (msg) {
            console.log(msg);
        } finally {
            return result;
        }

    },
    checkBlanceApi: async function (cookies, loyaltInput) {
        let result = {};

        try {

            let dataAdd = {
                ...loyaltInput,
                action: "associateByLastName",
                attemptsCount: 0,
            }

            let requestBloom = bloomHelper.buildRequest(cookies, JSON.stringify(dataAdd).length);

            let resultAdd = await requestBloom.post({
                uri: "https://www.bloomingdales.com/loyallist/accountassociation/",
                body: dataAdd,
                json: true
            });

            let req = unirest("GET", "https://www.bloomingdales.com/account/ocwalletservice/getRewardCards");

            req.headers({
                "x-requested-with": "XMLHttpRequest",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36",
                "referer": "https://www.bloomingdales.com/loyallist/accountsummary",
                "cookie": bloomHelper.cookiesParseString(cookies),
                "cache-control": "no-cache,no-cache",
                "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
                "accept-encoding": "gzip, deflate, br",
                "accept": "application/json, text/javascript, */*; q=0.01"
            });


            let resultBlance = await new Promise((resolve, reject) => {
                req.end(function (res) {
                    resolve(JSON.parse(res.body));
                });
            });

            result = {
                lastName: resultAdd.accountAssociationVB.loyaltyAccountInfo.lastName,
                loyaltyNumber: resultAdd.accountAssociationVB.loyaltyAccountInfo.loyaltyNumber,
                zipCode: resultAdd.accountAssociationVB.loyaltyAccountInfo.zipCode,
                blance: resultBlance.loyallistRCBalance || "$0.00",
            };

            let loyaltyNumberCurrent = resultAdd.accountAssociationVB.loyaltyAccountInfo.loyaltyNumber;


            let resultDelete = await requestBloom.delete(`https://www.bloomingdales.com/loyallist/accountassociation/${loyaltyNumberCurrent}`);


        } catch (msg) {
            console.log(msg);
        } finally {
            return result;
        }

    }
}
module.exports = checkBlanceHelper;
