const puppeteer = require('puppeteer');
const checkBlancerHelper = require('../helper/bloom/checkBlance');
const utilsHelper = require('../helper/utils');
const Datastore = require('nedb')
const blanceDB = new Datastore({
    filename: 'database/blance.db',
    autoload: true
});


window.onload = () => {

    blanceDB.find({}, {
        "_id": 0
    }, (err, doc) => {
        let listOuputRestore = '#listOuputRestore';
        doc.forEach(element => {
            $(listOuputRestore).append(Object.values(element).join('|') + "\n");
        });
    });

    document.querySelector('#btnStart').addEventListener('click', async () => {
        let buttonElement = '#btnStart';
        let buttonDefaultText = $(buttonElement).text();

        $(buttonElement).html('<i class="fa fa-spinner fa-spin" style="font-size:20px"></i> Proccessing..');
        $(buttonElement).prop("disabled", true);

        let elementOutput = "#listOuput";
        let elementproccessingAll = "#proccessingAll";
        let elementproccessingCurrent = "#proccessingCurrent";


        let cookies = JSON.parse($("#listInputCookie").val());
        let listInput = $("#listInputMain").val().trim().replace(/^\s*\n/gm, "").split('\n');

        $(elementOutput).text('');
        $(elementproccessingCurrent).text(0);
        $(elementproccessingAll).text(listInput.length);

        await utilsHelper.asyncForEach(listInput, async (element) => {

            let extract = element.split("|");
            let loyaltInput = {
                loyaltyNumber: extract[0],
                lastName: extract[1],
                zipCode: extract[2],
            }

            let blanceSaved = await new Promise((resolve, reject) => {
                blanceDB.find({
                    loyaltyNumber: loyaltInput.loyaltyNumber
                }, {
                    "_id": 0
                }, (err, doc) => {
                    resolve(doc)
                });
            });
            if (!blanceSaved[0]) {
                let cookiesRender = cookies;
                let result = await checkBlancerHelper.checkBlanceApi(cookiesRender, loyaltInput);
                console.log(result);
                if (Object.values(result).length) {
                    $(elementOutput).append(Object.values(result).join('|') + "\n");
                    blanceDB.insert(result)
                }
            } else {
                $(elementOutput).append(Object.values(blanceSaved[0]).join('|') + "\n");
            }

            $(proccessingCurrent).text(Number($(elementproccessingCurrent).text()) + 1);
        });



        $(buttonElement).removeAttr('disabled');
        $(buttonElement).hide().text(buttonDefaultText).fadeIn();

    })
};