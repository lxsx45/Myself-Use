function API(name = "untitled", debug = false) {
    return new class {
        constructor(name, debug) {
            this.name = name;
            this.debug = debug;

            this.isRequest = typeof $request != "undefined"
            this.isQX = typeof $task != "undefined";
            this.isLoon = typeof $loon != "undefined";
            this.isSurge = typeof $httpClient != "undefined" && !this.isLoon;
            this.isNode = typeof require == "function";
            this.isJSBox = this.isNode && typeof $jsbox != "undefined";

            this.node = (() => {
                if (this.isNode) {
                    const request =
                        typeof $request != "undefined" ? undefined : require("request");
                    const fs = require("fs");

                    return {
                        request,
                        fs,
                    };
                } else {
                    return null;
                }
            })();
            this.initCache();


            const delay = (t, v) =>
                new Promise(function (resolve) {
                    setTimeout(resolve.bind(null, v), t);
                });

            Promise.prototype.delay = function (t) {
                return this.then(function (v) {
                    return delay(t, v);
                });
            };
        }

        // http methods
        get(options) {
            if (this.isQX) {
                if (typeof options == "string")
                    options = { url: options, method: "GET" };
                return $task.fetch(options);
            } else {
                return new Promise((resolve, reject) => {
                    if (this.isLoon || this.isSurge)
                        $httpClient.get(options, (err, response, body) => {
                            if (err) reject(err);
                            else resolve({ statusCode: response.status, headers: response.headers, body });
                        });
                    else
                        this.node.request(options, (err, response, body) => {
                            if (err) reject(err);
                            else resolve({ ...response, statusCode: response.statusCode, body });
                        });
                });
            }
        }

        post(options) {
            if (options.body && options.headers && !options.headers['Content-Type']) {
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
            }
            if (this.isQX) {
                if (typeof options == "string") options = { url: options };
                options["method"] = "POST";
                return $task.fetch(options);
            } else {
                return new Promise((resolve, reject) => {
                    if (this.isLoon || this.isSurge) {
                        $httpClient.post(options, (err, response, body) => {
                            if (err) reject(err);
                            else resolve({ statusCode: response.status, headers: response.headers, body });
                        });
                    } else {
                        this.node.request.post(options, (err, response, body) => {
                            if (err) reject(err);
                            else resolve({ ...response, statusCode: response.statusCode, body });
                        });
                    }
                });
            }
        }

        // persistance

        // initialize cache
        initCache() {
            if (this.isQX) this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}");
            if (this.isLoon || this.isSurge)
                this.cache = JSON.parse($persistentStore.read(this.name) || "{}");
 
            if (this.isNode) {
                // create a json for root cache
                let fpath = "root.json";
                if (!this.node.fs.existsSync(fpath)) {
                    this.node.fs.writeFileSync(
                        fpath,
                        JSON.stringify({}),
                        { flag: "wx" },
                        (err) => console.log(err)
                    );
                }
                this.root = {};

                // create a json file with the given name if not exists
                fpath = `${this.name}.json`;
                if (!this.node.fs.existsSync(fpath)) {
                    this.node.fs.writeFileSync(
                        fpath,
                        JSON.stringify({}),
                        { flag: "wx" },
                        (err) => console.log(err)
                    );
                    this.cache = {};
                } else {
                    this.cache = JSON.parse(this.node.fs.readFileSync(`${this.name}.json`));
                }
            }
        }

        // store cache
        persistCache() {
            const data = JSON.stringify(this.cache);
            
            if (this.isQX) $prefs.setValueForKey(data, this.name);
            if (this.isLoon || this.isSurge) $persistentStore.write(data, this.name);
            if (this.isNode) {
                this.node.fs.writeFileSync(
                    `${this.name}.json`,
                    data,
                    { flag: "w" },
                    (err) => console.log(err)
                );
                this.node.fs.writeFileSync(
                    "root.json",
                    JSON.stringify(this.root),
                    { flag: "w" },
                    (err) => console.log(err)
                )
            }
        }

        write(data, key) {
            this.log(`SET ${key}`);
            if (key.indexOf('#') !== -1) {
                key = key.substr(1)
                if (this.isSurge || this.isLoon) {
                    $persistentStore.write(data, key);
                }
                if (this.isQX) {
                    $prefs.setValueForKey(data, key);
                }
                if (this.isNode) {
                    this.root[key] = data;
                }
            } else {
                this.cache[key] = data;
            }
            this.persistCache();
        }

        read(key) {
            this.log(`READ ${key}`);
            if (key.indexOf('#') !== -1) {
                key = key.substr(1)
                if (this.isSurge || this.isLoon) {
                    return $persistentStore.read(key);
                }
                if (this.isQX) {
                    return $prefs.valueForKey(key);
                }
                if (this.isNode) {
                    return this.root[key];
                }
            } else {
                return this.cache[key];
            }
        }

        delete(key) {
            this.log(`DELETE ${key}`);
            if (key.indexOf('#') !== -1) {
                key = key.substr(1)
                if (this.isSurge || this.isLoon) {
                    $persistentStore.write(null, key);
                }
                if (this.isQX) {
                    $prefs.removeValueForKey(key);
                }
                if (this.isNode) {
                    delete this.root[key];
                }
            } else {
                delete this.cache[key];
            }
            this.persistCache();
        }

        // notification
        notify(title = name, subtitle = '', content = '', open_url, media_url) {
            if (this.isSurge) {
                let content_Surge = content + (media_url == undefined ? "" : `\n\n??????????????????${media_url}`);
                let opts = {};
                if (open_url) opts["url"] = open_url;
                if(JSON.stringify(opts) == "{}") {
                    $notification.post(title, subtitle, content_Surge);
                } else {
                    $notification.post(title, subtitle, content_Surge, opts);
                }
            }
            if (this.isQX) {
                let opts = {};
                if (open_url) opts["open-url"] = open_url;
                if (media_url) opts["media-url"] = media_url;
                if(JSON.stringify(opts) == "{}") {
                    $notify(title, subtitle, content);
                } else {
                    $notify(title, subtitle, content, opts);
                }
            } 
            if (this.isLoon) {
                let opts = {};
                if (open_url) opts["openUrl"] = open_url;
                if (media_url) opts["mediaUrl"] = media_url;
                if(JSON.stringify(opts) == "{}") {
                    $notification.post(title, subtitle, content);
                } else {
                    $notification.post(title, subtitle, content, opts);
                }
            }
            if (this.isNode) {
                let content_Node = content + (open_url == undefined ? "" : `\n\n???????????????${open_url}`) + (media_url == undefined ? "" : `\n\n??????????????????${media_url}`);
                if (this.isJSBox) {
                    const push = require("push");
                    push.schedule({
                        title: title,
                        body: subtitle ? subtitle + "\n" + content_Node : content_Node,
                    });
                } else {
                    console.log(`${title}\n${subtitle}\n${content_Node}\n\n`);
                }
            }
        }

        // other helper functions
        log(msg) {
            if (this.debug) console.log(msg);
        }

        info(msg) {
            console.log(msg);
        }

        error(msg) {
            console.log("ERROR: " + msg);
        }

        wait(millisec) {
            return new Promise((resolve) => setTimeout(resolve, millisec));
        }

        done(value = {}) {
            if (this.isQX || this.isLoon || this.isSurge) {
                this.isRequest ? $done(value) : $done();
            } else if (this.isNode && !this.isJSBox) {
                if (typeof $context !== 'undefined') {
                    $context.headers = value.headers;
                    $context.statusCode = value.statusCode;
                    $context.body = value.body;
                }
            }
        }
    }(name, debug);
    
}