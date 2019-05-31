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
    blanceDB.find({}, {username: 1}, function(err, docs) {
      docs.forEach(function(value) {
        $('#listOuput').val($('#listOuput').val() + value.username + '\n');
      })
    });
    document.querySelector('#btnStart').addEventListener('click', async () => {
        let buttonElement = '#btnStart';

        $(buttonElement).html('<i class="fa fa-spinner fa-spin" style="font-size:20px"></i> Proccessing..');
        $(buttonElement).prop("disabled", true);
        const data = $('#listInputData').val();
        const dataProcessed = data.match(/([^\|\n]+)/g);
        $('#proccessingAll').text(dataProcessed.length/2);
        let modePuppeteer = {
          headless: !$('#checkboxShowBrowser').is(":checked"),
          ignoreHTTPSErrors: true,
          args: ['--start-maximized', '--no-sandbox', '--hide-scrollbars', '--mute-audio', '--disable-setuid-sandbox', '--disable-sync', '--disable-background-networking', '--disable-infobars', '--disable-setuid-sandbox', '--ignore-certifcate-errors']
        };
        for(var i = 0; i < dataProcessed.length-1; i+=2){
          const dataSign = {
            username: dataProcessed[i],
            password: dataProcessed[i+1],
          };
          let browser = await puppeteerCreate.launch(modePuppeteer);
          let page = (await browser.pages())[0];

          let userAgent = randomUserAgent('mobile');

          await page.setUserAgent(userAgent);
          await page.goto("https://m.facebook.com/").catch(() => {
            });
          await page.waitForSelector("input#m_login_email");
          await page.evaluate((dataSign) => {
              document.querySelector("input#m_login_email").value = dataSign.username;
              document.querySelector("input#m_login_password").value = dataSign.password;
              document.querySelector('button[name="login"]').click()
          }, dataSign);
          await page._frameManager._mainFrame.waitForNavigation();
          const cookies = await page.cookies()
          blanceDB.remove({username: dataSign.username}, { multi: true });
          blanceDB.insert({
            username: dataSign.username,
            password: dataSign.password,
            cookies: cookies,
          })
          await page.close();
          await browser.close();
          $('#listOuput').val($('#listOuput').val() + dataSign.username + '\n');
          $('#proccessingCurrent').text(parseInt($('#proccessingCurrent').text()) + 1);
        }
        console.log("done");
        $(buttonElement).html('Start');
        $(buttonElement).prop("disabled", false);
    })
};
