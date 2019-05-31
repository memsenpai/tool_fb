const puppeteer = require('puppeteer');
const checkBlancerHelper = require('../helper/bloom/checkBlance');
const utilsHelper = require('../helper/utils');
const Datastore = require('nedb')
const blanceDB = new Datastore({
    filename: 'database/blance.db',
    autoload: true
});
const puppeteerCreate = require('puppeteer');
const randomUserAgent = require('random-user-agent');


window.onload = () => {

    // blanceDB.find({}, {
    //     "_id": 0
    // }, (err, doc) => {
    //     let listOuputRestore = '#listOuputRestore';
    //     doc.forEach(element => {
    //         $(listOuputRestore).append(Object.values(element).join('|') + "\n");
    //     });
    // });
    let cookies = null;
    blanceDB.find({username: 'yts.1996'}, function(err, docs){
      if(docs.length === 0) return false;
      cookies = docs[0].cookies;
      console.log(docs[0].cookies)
    })
    document.querySelector('#btnStart').addEventListener('click', async () => {
        let buttonElement = '#btnStart';
        let buttonDefaultText = $(buttonElement).text();

        $(buttonElement).html('<i class="fa fa-spinner fa-spin" style="font-size:20px"></i> Proccessing..');
        // $(buttonElement).prop("disabled", true);
        let modePuppeteer = {
          headless: false,
          ignoreHTTPSErrors: true,
          args: ['--start-maximized', '--no-sandbox', '--hide-scrollbars', '--mute-audio', '--disable-setuid-sandbox', '--disable-sync', '--disable-background-networking', '--disable-infobars', '--disable-setuid-sandbox', '--ignore-certifcate-errors']
        };

        let browser = await puppeteerCreate.launch(modePuppeteer);
        let page = (await browser.pages())[0];

        let userAgent = randomUserAgent('mobile');

        await page.setUserAgent(userAgent);
        // const cookies = await page.cookies()
        await page.setCookie(...cookies);
        await page.goto($('#url').val()).catch(() => {
          });
        await page.waitFor(3000);
        await page.evaluate(() => {
            document.querySelector("#composerInput").value = "spam";
            document.querySelector('[name="comment_text"]').value = "spam"
            const submit = document.querySelector("#composerInput").closest('form').submit;
            submit.removeAttribute('disabled');
            submit.click();
            // document.querySelector("input#email.inputtext").value = "yts.1996"
            // document.querySelector("input#pass.inputtext").value = "Sayuto18tt.."
            // document.querySelector("#loginbutton").click()
        });
        // await page.waitFor(3000);
        // const cookies = await page.cookies()
        // blanceDB.remove({username: 'yts.1996'}, { multi: true });
        // blanceDB.insert({
        //   username: 'yts.1996',
        //   password: 'Sayuto18tt..',
        //   cookies: cookies,
        // })
        // await page.evaluate((dataReg) => {
        //     document.querySelector("#ca-profile-firstname").value = dataReg.firstname
        //     document.querySelector("#ca-profile-lastname").value = dataReg.lastname
        //     document.querySelector("#ca-profile-email").value = dataReg.email
        //     document.querySelector("#ca-profile-password").value = dataReg.password
        //     document.querySelector("#ca-profile-birth-month").value = dataReg.birthMonth
        //     document.querySelector("#ca-profile-birth-day").value = dataReg.birthDay
        //     document.querySelector("#ca-profile-birth-year").value = dataReg.birthYear
        //     document.querySelector("#ca-profile-submit").click()
        // }, dataReg);
        // let elementOutput = "#listOuput";
        // let elementproccessingAll = "#proccessingAll";
        // let elementproccessingCurrent = "#proccessingCurrent";


        // let cookies = JSON.parse($("#listInputCookie").val());
        // let listInput = $("#listInputMain").val().trim().replace(/^\s*\n/gm, "").split('\n');

        // $(elementOutput).text('');
        // $(elementproccessingCurrent).text(0);
        // $(elementproccessingAll).text(listInput.length);

        // await utilsHelper.asyncForEach(listInput, async (element) => {

        //     let extract = element.split("|");
        //     let loyaltInput = {
        //         loyaltyNumber: extract[0],
        //         lastName: extract[1],
        //         zipCode: extract[2],
        //     }

        //     let blanceSaved = await new Promise((resolve, reject) => {
        //         blanceDB.find({
        //             loyaltyNumber: loyaltInput.loyaltyNumber
        //         }, {
        //             "_id": 0
        //         }, (err, doc) => {
        //             resolve(doc)
        //         });
        //     });
        //     if (!blanceSaved[0]) {
        //         let cookiesRender = cookies;
        //         let result = await checkBlancerHelper.checkBlanceApi(cookiesRender, loyaltInput);
        //         console.log(result);
        //         if (Object.values(result).length) {
        //             $(elementOutput).append(Object.values(result).join('|') + "\n");
        //             blanceDB.insert(result)
        //         }
        //     } else {
        //         $(elementOutput).append(Object.values(blanceSaved[0]).join('|') + "\n");
        //     }

        //     $(proccessingCurrent).text(Number($(elementproccessingCurrent).text()) + 1);
        // });



        // $(buttonElement).removeAttr('disabled');
        // $(buttonElement).hide().text(buttonDefaultText).fadeIn();

    })
};
