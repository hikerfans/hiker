if(!fileExist("hiker://files/cache/GlobalVar.dex")){
	writeHexFile("hiker://files/cache/GlobalVar.dex", "6465780A303335k6050597F101D0B5BD4E7E39137A39B6921k6E8D7938715B9k2K07Z078563412ZZK0FCy0AZ7Zk5Z98Z01ZACZ02ZB8Z04ZC8Z01ZE8Z88y08y08y12y1Ay2Fy43y58y69y76y79y84y02Z03Z04Z05Z07Z07Z04z03K8ZKk3K9zZZ01Z01Z01Z02Z01ZZK1Z01ZZK6ZZkE801ZZ083C636C696E69743EK63C696E69743Ek134C636F6D2F676C6F62616C2F4D616E6167653Bk124C6A6176612F6C616E672F4F626A6563743Bk134C6A6176612F7574696C2F486173684D61703BKF4C6A6176612F7574696C2F4D61703BKB4D616E6167652E6A61766Y156K9676C6F62616C566172KB6D79476C6F62616C566172Zk12K70E78k1Y70EKk1Z01Z94y0FZ22K2k701k3Z69Z22K2k701k3Z69KYEZ0YY1Z9Ay04Z701k2Z0EK2K2Kk90109k888k4Ak301818k4Dk30CZZK1ZZK1Z0AZ7Zk2Z05Z98Z03Z01ZACZ04Z02ZB8Z05Z04ZC8Z06Z01ZE8Z022ZAZ08y032Z2Z94y012Z2ZAk1Z2Z1ZE801Z1Z1ZFCy".replace(/k/g, "00").replace(/y/g, "0Y0").replace(/z/g, "ZZZ").replace(/K/g, "000").replace(/Y/g, "1000").replace(/Z/g, "000000"));
}
let Manage = loadJavaClass('hiker://files/cache/GlobalVar.dex', 'com.global.Manage');
let GlobalMap = Manage.globalVar;
let MyGlobalMap = Manage.myGlobalVar;
let ruleTitle = typeof MY_RULE !== "undefined" ? MY_RULE.title : ($.importParam||"");
let MyRuleGlobalMap;
//初始化规则内全局变量的Map
if (MyGlobalMap.containsKey(ruleTitle)) {
	MyRuleGlobalMap = MyGlobalMap.get(ruleTitle);
} else {
	MyRuleGlobalMap = new java.util.HashMap();
	MyGlobalMap.put(ruleTitle, MyRuleGlobalMap);
}

function getTypeName(obj) {
	return Object.prototype.toString.call(obj);
}

let protoDic = new Map([
	["[object Array]", Array.prototype],
	["[object Date]", Date.prototype],
	["[object Object]", Object.prototype],
	["[object Promise]", Promise.prototype],
	["[object Map]", Map.prototype],
	["[object Symbol]", Symbol.prototype],
	["[object Array]", Array.prototype],
	["[object Function]", Function.prototype],
	["[object Array]", Array.prototype],
]);

function get(hashMap, key, def) {
	if (!hashMap.containsKey(key)) return def;
	let val = hashMap.get(key);
	let typeName = getTypeName(val);
	if (val instanceof java.lang.String) {
		return String(val);
	} else if (val instanceof java.lang.Double) {
		return Number(val);
	} else if (val instanceof java.lang.Boolean) {
		return !!val;
	} else if (typeName !== "[object javaObject]" && protoDic.has(typeName) && val.__proto__) {
		//JS环境不同让对象的原型地址不同,修复原生JS instanceof,自定义的类型修不了
		//直接把新的原型地址赋值给变量原型，如果用户扩展了原型可能会丢失，用Object.assign应该可以避免
		Object.assign(val.__proto__, protoDic.get(typeName));
		return val;
	}
	return val;
}
//设置变量
function put(hashMap, key, val) {
	//如果是undefined 就不存储 因为会被转成java字符串的undefined，在get方法直接返回undefined
	//或者统一存为[type, val]; get方法在根据type处理
	if (val === void 0) return;
	hashMap.put(key, val);
	return val;
}
//创建变量 如果有设置好的，直接返回，没有就设置一个
function create(hashMap, key, val) {
	if (hashMap.containsKey(key)) {
		return get(hashMap, key);
	}
	return put(hashMap, key, val);
}
//创建变量的默认值懒初始化
function createLazy(hashMap, key, lazy) {
	if (hashMap.containsKey(key)) {
		return get(hashMap, key);
	}
	return put(hashMap, key, lazy());
}
//创建全局模块，可以保证全局只创建一个该模块
function module(hashMap, key, path, isNew) {
	if (isNew) return put(hashMap, key,$.require(path, key));
	return createLazy(hashMap, key, () => $.require(path, key));
}
//清除所有变量
function clearAll(hashMap) {
	hashMap.clear();
}
//清除指定变量
function clear(hashMap, key, call) {
	if (hashMap.containsKey(key)) {
		if (typeof call === "function") {
			call(get(hashMap, key));
		}
		hashMap.remove(key);
	}
}

function has(hashMap, key, call) {
	let res = !!hashMap.containsKey(key);
	if (res && typeof call === "function") {
		call(get(hashMap, key));
	}
	return res;
}
$.exports = {
	getAppVar: get.bind(null, GlobalMap),
	putAppVar: put.bind(null, GlobalMap),
	createAppVar: create.bind(null, GlobalMap),
	lazyAppVar: createLazy.bind(null, GlobalMap),
	hasAppVar: has.bind(null, GlobalMap),
	clearAllAppVar: clearAll.bind(null, GlobalMap),
	clearAppVar: clear.bind(null, GlobalMap),
	moduleAppVar: module.bind(null, GlobalMap),
	getMyVar: get.bind(null, MyRuleGlobalMap),
	putMyVar: put.bind(null, MyRuleGlobalMap),
	createMyVar: create.bind(null, MyRuleGlobalMap),
	clearAllMyVar: clearAll.bind(null, MyRuleGlobalMap),
	clearMyVar: clear.bind(null, MyRuleGlobalMap),
	lazyMyVar: createLazy.bind(null, MyRuleGlobalMap),
	moduleMyVar: module.bind(null, MyRuleGlobalMap),
	hasMyVar: has.bind(null, MyRuleGlobalMap)
}