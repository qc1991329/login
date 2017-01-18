/************************************************
 ** Copyright (C) 2000-2015 TIZA Inc..
 ** 类    名：tiza.js
 ** 作    者：super chen
 ** 描    述：通用功能
 ** 生成日期：2015/8/25
 ** 修改日志：
 *************************************************/
(function() {
	window.tiza = window.tiza || {
		//server_Domain: "http://218.3.247.227:6181/",
		server_Domain: "http://58.218.196.207:184/",
		//server_Domain: "http://192.168.1.14:6181/",
		//server_Domain: "http://192.168.1.21:900/",
		//Web平台地址
		web_Domain: "http://58.218.196.207:183/",
		//高德地图url
		mapUrl: "http://webapi.amap.com/maps?v=1.3&key=8118ef60762bff1c499474f781d79594",
		UnitId: 2,//徐工平台ID（1集团 2重型 3道路 4铲运 5塔机）
		ProductManualId:107,//产品手册列表ID(107重型 110铲运，道路261）
		isConnect: function() { //判断是否联网
			if (plus.networkinfo.getCurrentType() != 1)
				return true;
			return false;
		},
		isLogin: function() { //判断是否登录
			var getUserid = localStorage.getItem("userId");
			var getToken = localStorage.getItem("token");
			if ((getUserid != "" && getUserid != null) && (getToken != "" && getToken != null)) {
				return true;
			} else {
				return false;
			}
		},
		ajax: function(url, settings) {
			if (this.isConnect()) {
				var ajaxSettings = {
					data: settings.data || {},
					dataType: settings.dataType || 'json',
					type: settings.type || 'get',
					timeout: settings.timeout || 50000,
					success: function(response, status, xhr) {
						var str = response;
						console.log(JSON.stringify(response));
						if (tiza.responseValidate(response, settings.error) && settings.success)
							settings.success(response);
					},
					error: function(xhr, type, errorThrown) {
						console.warn(xhr.responseText);
						plus.nativeUI.closeWaiting();
//						if(xhr.responseText == ""){
//							return;
//						}
						console.log("ajax错误描述:" + type + ",异常对象：" + errorThrown);
						if (settings.error)
							settings.error(type, errorThrown);
						else
							mui.toast("ajax错误描述:" + type + ",异常对象：" + errorThrown);
					}
				};
				url = url.indexOf("http") >= 0 ? url : (tiza.server_Domain + url);
				//如果参数中存在user:false，则不需要做登录验证，默认需要做登录验证
/*				if (settings.user != false) {
					if (this.isLogin()) {
						url += "?userId=" + localStorage.getItem("userId") + "&token=" + localStorage.getItem("token");
					} else {
						this.responseValidate();
					}
				}*/
				mui.ajax(url, ajaxSettings);
			} else {
				mui.toast("网络连接不可用！");
			}
		},
		//请求结果异常判断
		responseValidate: function(response) {
			if (response != null && response.hasOwnProperty("state")) {
				if (response.state == "102") {
					var stor = localStorage;
					stor.removeItem("userId");
					stor.removeItem("password");
					stor.removeItem("token");
					plus.nativeUI.closeWaiting();
					//plus.webview.getLaunchWebview().evalJS('p.logout();');
					//模板页需要返回
					var current = plus.webview.currentWebview();
					if (current.mType.indexOf("main") > 0) {
						current.hide('auto');
						setTimeout(function() {
							current.children()[0].clear();
							current.children()[0].hide("none");
							var title = document.getElementById("title");
							title.className = 'mui-title mui-fadeout';
							var opration = document.getElementById("opration");
							if (opration) {
								title.parentNode.removeChild(opration);
							}
							if (current.children()[0].children().length > 0) {
								current.children()[0].children()[0].close();
							}
						}, 100);
					} else if (current.mType.indexOf("sub") > 0) {
						current.clear();
						if (current.children().length > 0)
							current.children()[0].close();
						current.parent().evalJS('mui.back();');
					}
					mui.toast("帐号已被别处登录，请重试");
					return false;
				}
			}
			return true;
		},
		//打开新的子页面并且传值
		//预加载子模板页的级别1、2、3、4
		//headTitle:子页面头部的标题
		//url:子页面URL路径（可加参数）
		//param:传递的参数(evalJS实现的参数)
		//headlink:子页面头部其他功能区
		openTemp: function(tempLevel, headTitle, url, param, headlink) {
			var defaultH = plus.webview.getWebviewById("temp" + tempLevel + "-main");

			if (headlink) {
				defaultH.evalJS("tamplateinit('" + headTitle + "','" + JSON.stringify(headlink) + "')");
			} else {
				defaultH.evalJS('tamplateinit("' + headTitle + '")');
			}
			defaultH.show('pop-in', 150, function() {
				contentWebview.show();
			});
			var contentWebview = defaultH.children()[0];
			contentWebview.loadURL(url);
			//			console.log(contentWebview.getURL());
			//			if(contentWebview.getURL()==url){
			//			    contentWebview.show();
			//			}else{
			//			    contentWebview.loadURL(url);
			//			}
			if (param) {
				contentWebview.addEventListener("loaded", function() {
					contentWebview.evalJS(param);
					contentWebview.removeEventListener('loaded');
				});
			}
		},
		//子页面操作完后关闭并执行要显示的页面的自定义事件
		//showWebViews:关闭后要显示的页面ID
		//showListener:执行显示页面的自定义事件
		//colseWebViews:要关闭的相关页面ID，可以是数组或者字符串
		closeView: function(showWebViews, showListener, colseWebViews) {
			plus.nativeUI.closeWaiting();
			if (colseWebViews) {
				if (typeof(colseWebViews) === "string") {
					var q = dthplus.webview.getWebviewById(colseWebViews);
					if (q) {
						plus.webview.hide(colseWebViews);
					}
				} else {
					if (colseWebViews instanceof Array) {
						for (var o = 0, p = colseWebViews.length; o < p; o++) {
							if (colseWebViews[o] != null) {
								plus.webview.hide(colseWebViews[o])
							}
						}
					} else {
						plus.webview.hide(colseWebViews);
					}
				}
			}
			var showWebView = plus.webview.getWebviewById(showWebViews);
			var back = mui.back;
			mui.back = function() {
				console.log(showWebView);
				mui.fire(showWebView, showListener, {});
				back();
			};
			mui.back();
		},
		sendRequest: function(params) { //URL参数的传递
			var isjson = typeof(params) == "object" && Object.prototype.toString.call(params).toLowerCase() == "[object object]" && !params.length;
			if (isjson) {
				return encodeURI(encodeURI(JSON.stringify(params)));
			} else {
				return encodeURI(encodeURI(params));
			}
		},
		getRequest: function() { //URL参数的获取
			var url = location.search;
			var theRequest = new Object();
			if (url.indexOf("?") != -1) {
				var str = url.substr(1);
				strs = str.split("&");
				for (var i = 0; i < strs.length; i++) {
					theRequest[strs[i].split("=")[0]] = decodeURI(decodeURI(strs[i].split("=")[1]));
				}
			}
			return theRequest;
		}
	};
})(window, mui);

//全局配置
mui.initGlobal({
	swipeBack: true
});
var back = mui.back;
mui.back = function() {
	mui.plusReady(function() {
		var current = plus.webview.currentWebview();
		if (current.mType === 'main') //模板主页面
		{
			current.hide('auto');
			setTimeout(function() {
				current.children()[0].clear();
				current.children()[0].hide("none");
				var title = document.getElementById("title");
				title.innerHTML = "";
				title.className = 'mui-title mui-fadeout';
				document.getElementById("btn-right").setAttribute("class", "mui-btn mui-btn-blue mui-btn-link mui-pull-right color_tijiao");
				var btnRight = document.getElementById("btn-right");
				btnRight.innerText = "";
			}, 100);
		} else if (current.mType === 'sub') {
			current.clear();
			if (current.children().length > 0)
				current.children()[0].close();
			current.parent().evalJS('mui.back();');
		} else
			back();
	});

};