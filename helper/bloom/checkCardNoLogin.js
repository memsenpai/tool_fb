var unirest = require('unirest');
var bloomHelper = require('./bloomHelper');
var utils = require('../utils');

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
                await page.waitFor(5000);
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

                result = await page.evaluate(cardNumber => {

                    let result = {
                        success: false,
                        checked: false,
                        cardNumber: cardNumber,
                        loyaltyNumber: '',
                        lastName: '',
                        zipCode: '',
                    }

                    return new Promise((resolve, reject) => {

                        if (document.querySelector("#creditCard\\2e cardNumber") !== null) {
                            document.querySelector("#creditCard\\2e cardNumber").value = cardNumber;
                            document.querySelector("#rc-ccdetails-save").click();
                            setTimeout(() => {

                                result.checked = true

                                if (document.querySelector("#creditCard\\2e cardNumber-error") == null) {
                                    result.success = true

                                    if (document.querySelector("#rc-loyallist-info-summary > div > div") !== null) {
                                        document.querySelector("#rc-loyallist-info-summary > div > div").click()
                                    }

                                    if (document.querySelector("#rc-loyallist-change") !== null) {
                                        document.querySelector("#rc-loyallist-change").click()
                                    }

                                    setTimeout(() => {
                                        if (document.querySelector("#loyaltyAccountInfo\\2e loyaltyNumber") !== null) {
                                            result.loyaltyNumber = document.querySelector("#loyaltyAccountInfo\\2e loyaltyNumber").value
                                            result.lastName = document.querySelector("#loyaltyAccountInfo\\2e lastName").value
                                            result.zipCode = document.querySelector("#loyaltyAccountInfo\\2e zipCode").value
                                        }
                                        resolve(result);
                                    }, 3000);

                                } else {
                                    resolve(result);
                                }

                            }, 3000)
                        } else {
                            resolve(result);
                        }

                    })
                }, cardNumber);
            }

        } catch (msg) {
            console.log(msg);

        } finally {
            return result;
        }

    }
}
module.exports = checkCardNumber;