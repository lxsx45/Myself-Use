/*
源码来源自Pysta(https://github.com/mieqq/mieqq)
由lxsx45(https://github.com/lxsx45)修改为英文版

示例↓↓↓ 
----------------------------------------

[Panel]
Config Reload = title=Config Reload,content=Config Reload,style=info,script-name=Config Reload,update-interval=-1

[Script]
Config Reload=script-path=https://raw.githubusercontent.com/lxsx45/Myself-Use/master/Surge/Script/Profile-Reload.js,type=generic

----------------------------------------
*/

$httpAPI("POST", "/v1/profiles/reload", {}, data => {
    $notification.post("Config Reload","Configuration Reload Succeeded","")
    $done({
        title: "Config Reload",
        content: "Configuration Reload Succeeded",
        icon: "terminal",
        "icon-color": "#5AC8FA",
     })
    });
