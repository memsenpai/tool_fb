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

            if (await page.$("#rc-payment-change") !== null) {
                await page.click("#rc-payment-change");
                await page.waitFor(1000);
            }

            if (await page.$("#rc-payments-list-form > fieldset > ul > li > div > div.editable-cell > button") !== null) {
                await page.click("#rc-payments-list-form > fieldset > ul > li > div > div.editable-cell > button");
                await page.waitFor(1000);
            }

            await page.waitForSelector("#editCreditCard\\2e cardNumber", {
                timeout: 5000
            }).catch(() => {});

            if (await page.$("#editCreditCard\\2e cardNumber") == null) {
                await page.reload();
                await page.waitFor(5000);
                await page.waitForSelector("#editCreditCard\\2e cardNumber", {
                    timeout: 10000
                }).catch(() => {});
            }
            
            if (await page.$("#editCreditCard\\2e cardNumber") !== null) {

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

                        if (document.querySelector("#editCreditCard\\2e cardNumber") !== null) {
                            document.querySelector("#editCreditCard\\2e cardNumber").value = cardNumber;
                            document.querySelector("#rc-ccdetails-save").click();
                            setTimeout(() => {

                                result.checked = true

                                if (document.querySelector("#blmDefaultSuccessMsg") !== null) {
                                    result.success = true

                                    if (document.querySelector("#rcLoyallistHeader > div > div > div.small-4.columns.text-right > span") !== null) {
                                        document.querySelector("#rcLoyallistHeader > div > div > div.small-4.columns.text-right > span").click()
                                    }
                                    if (document.querySelector("#rc-loyallist-change") !== null) {
                                        document.querySelector("#rc-loyallist-change").click()
                                    }

                                    setTimeout(() => {
                                        if (document.querySelector("#loyaltyNumber") !== null) {
                                            result.loyaltyNumber = document.querySelector("#loyaltyNumber").value
                                            result.lastName = document.querySelector("#lastName").value
                                            result.zipCode = document.querySelector("#zipCode").value
                                        }
                                        resolve(result);
                                    }, 7000);

                                } else {
                                    resolve(result);
                                }

                            }, 5000)
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