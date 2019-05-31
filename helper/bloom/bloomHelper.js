var requestSync = require('request-promise-native');
var cheerio = require('cheerio');

var helperBloom = {
    IsJsonString: function (str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    },
    cookiesParseString: function (cookies = []) {
        let cookieStr = "";
        cookies.forEach(function (eachCookie) {
            cookieStr += `${eachCookie.name}=${eachCookie.value};`
        });
        return cookieStr;
    },
    parseTokenFromCookie: function (cookies = []) {
        let token = "";
        cookies.forEach((element, index) => {
            if (element.name == 'root_csrftoken')
                token = element.value;
        })
        return token;
    },
    parseTokenFromCookieString: function (cookieString) {
        let token = "";
        let tokenReg = cookieString.match(/csrftoken=(.*?);/)

        if (tokenReg)
            token = tokenReg[1]

        return token;
    },
    buildRequest: function (cookies = [],length = 0) {
        let cookieJar = requestSync.jar();
        let strCookies = this.cookiesParseString(cookies);
        let headers = {
        'Content-Type': 'application/json',
        'x-requested-with': 'XMLHttpRequest',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36',
        'referer': 'https://www.bloomingdales.com/loyallist/accountassociation?from=remove',
        'processassociation': 'true',
        'pragma': 'no-cache',
        'origin': 'https://www.bloomingdales.com',
        'cookie': strCookies,
        'content-length': length,
        'cache-control': 'no-cache,no-cache',
        'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
        'accept-encoding': 'gzip, deflate, br',
        'accept': 'application/json, text/javascript, */*; q=0.01' };

        let requestBuilder = requestSync.defaults({
            jar: cookieJar,
            headers: headers,
            transform: (body, response) => {
                if (this.IsJsonString(body))
                    return JSON.parse(body)
                else
                    return body;
            }
        })
        return requestBuilder;
    },
}

module.exports = helperBloom;