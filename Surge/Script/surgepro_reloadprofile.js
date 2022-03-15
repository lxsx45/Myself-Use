/* 
源码来自于fishingworld(https://raw.githubusercontent.com/fishingworld/something/main/PanelScripts/surgepro_reloadprofile.js)
由lxsx45(https://github.com/lxsx45)修改为英文版

示例↓↓↓ 
----------------------------------------

[Script]
SurgePro_ReloadProfile = type=generic,timeout=10,script-path=https://raw.githubusercontent.com/lxsx45/Myself-Use/master/Surge/Script/surgepro_reloadprofile.js,argument=icon=crown.fill&color=#f6c970

[Panel]
SurgePro_ReloadProfile = script-name=SurgePro_ReloadProfile,title=Startup Time,content=Please refresh,update-interval=1

----------------------------------------
*/

let params = getParams($argument)

!(async () => {
/* 时间获取 */
let traffic = (await httpAPI("/v1/traffic","GET"))
let dateNow = new Date()
let dateTime = Math.floor(traffic.startTime*1000)
let startTime = timeTransform(dateNow,dateTime)

if ($trigger == "button") await httpAPI("/v1/profiles/reload");

  $done({
      title:"Surge Pro",
      content:`Startup Time: ${startTime}`,
		icon: params.icon,
		"icon-color":params.color
    });

})();

function timeTransform(dateNow,dateTime) {
let dateDiff = dateNow - dateTime;
let days = Math.floor(dateDiff / (24 * 3600 * 1000));//计算出相差天数
let leave1=dateDiff%(24*3600*1000)    //计算天数后剩余的毫秒数
let hours=Math.floor(leave1/(3600*1000))//计算出小时数
//计算相差分钟数
let leave2=leave1%(3600*1000)    //计算小时数后剩余的毫秒数
let minutes=Math.floor(leave2/(60*1000))//计算相差分钟数
//计算相差秒数
let leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
let seconds=Math.round(leave3/1000)

if(days==0){

	if(hours==0){
	if(minutes==0)return(`${seconds}Sec`);
	return(`${minutes}Min${seconds}Sec`)
	}
	return(`${hours}H${minutes}Min${seconds}Sec`)
	}else {
	return(`${days}D${hours}H${minutes}Min`)
	}

}


function httpAPI(path = "", method = "POST", body = null) {
    return new Promise((resolve) => {
        $httpAPI(method, path, body, (result) => {
            resolve(result);
        });
    });
}

function getParams(param) {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}
