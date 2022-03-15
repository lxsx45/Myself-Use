/*
源代码来源自congcong0806(https://raw.githubusercontent.com/congcong0806/surge-list/master/Script/ipcheck.js)
由lxsx45(https://github.com/lxsx45)修改为英文版

示例↓↓↓ 
----------------------------------------

[Panel]
Network Information = script-name=Network Information, title="Network Information", content="Please refresh", style=info, update-interval=60

[Script]
Network Information = type=generic,timeout=3,script-path=https://raw.githubusercontent.com/lxsx45/Myself-Use/master/Surge/Script/ipcheck.js

----------------------------------------

*/

let url = "http://ip-api.com/json/?lang=en-US"

$httpClient.get(url, function(error, response, data){
    let jsonData = JSON.parse(data)
    let ip = jsonData.query
    let country = jsonData.country
    let emoji = getFlagEmoji(jsonData.countryCode)
    let city = jsonData.city
    let isp = jsonData.isp
    
  body = {
    title: "Network Information",
    content: `IP Address: ${ip}\nOperator: ${isp}\nIP location: ${emoji}${country} - ${city}`,
    icon: "link.icloud",
    'icon-color': "#5AC8FA"
  }
  $done(body);
});


function getFlagEmoji(countryCode) {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char =>  127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}
