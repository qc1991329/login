//需要先引入zepto.js、高德webapi
function mapFactory() {
	this.defaultOptions = {
		view: new AMap.View2D({
			center: new AMap.LngLat(105, 36),
			zoom: 3
		})
	};
}
mapFactory.prototype.newMap = function(mapContainer, option) {
	var opt = $.extend(true, this.defaultOptions, option);
	return new AMap.Map(mapContainer, opt);
};
mapFactory.prototype.newMarker = function(option) {
	var defaultOption = {

	};
	var opt = $.extend(true, defaultOption, option);
	return new AMap.Marker(opt);
};
mapFactory.prototype.newInfoWindow = function(option) {
		var defaultOption = {
			isCustom: true
		};
		var opt = $.extend(true, defaultOption, option);
		return new AMap.InfoWindow(opt);
	}
	//创建信息窗体div
mapFactory.prototype.createInfoWindow = function(title, content) {
	var doc = document;
	var info = doc.createElement("div");
	info.className = "info";
	//头部
	var top = doc.createElement("div");
	top.className = "info-top";
	var titleD = doc.createElement("div");
	titleD.innerHTML = title;
	//	var closeX = doc.createElement("img");
	//	closeX.src = "../img/close.gif";
	//	$("#infoclose").bind("tap",function(){
	//		mapObj.clearInfoWindow();
	//	});
	top.appendChild(titleD);
	//	top.appendChild(closeX);
	info.appendChild(top);
	// 中部
	var middle = doc.createElement("div");
	middle.className = "info-middle";
	middle.innerHTML = content;
	info.appendChild(middle);
	// 底部
	var bottom = doc.createElement("div");
	bottom.className = "info-bottom";
	var sharp = doc.createElement("img");
	sharp.src = "../img/sharp.png";
	bottom.appendChild(sharp);
	info.appendChild(bottom);
	return info;
};
mapFactory.prototype.newLngLat = function(lng, lat) {
	return new AMap.LngLat(lng, lat);
};
mapFactory.prototype.newPixel = function(x, y) {
	return new AMap.Pixel(x, y);
};
//添加地图插件
mapFactory.prototype.plugin = function(mapObj, plugins, mapType) {
	mapObj.plugin(plugins, function() {
		for (var i in plugins) {
			switch (plugins[i]) {
				case "AMap.ToolBar":
					mapObj.addControl(new AMap.ToolBar());
					break;
				case "AMap.OverView":
					mapObj.addControl(new AMap.OverView());
					break;
				case "AMap.Scale":
					mapObj.addControl(new AMap.Scale());
					break;
				case "AMap.RangingTool":
					return new AMap.RangingTool(mapObj);
					break;
				case "AMap.MapType":
					var type = new AMap.MapType({
						defaultType: mapType
					});
					mapObj.addControl(type);
					break;
				default:
					break;
			}
		}
	});
};
//添加圆覆盖物
mapFactory.prototype.addCircle = function(option) {
	var defaultOption = {
		center: new AMap.LngLat(105, 36),
		radius: 100,
		strokeColor: "#F33",
		strokeOpacity: 1,
		strokeWeight: 3,
		fillColor: "#ee2200",
		fillOpacity: 0.35
	};
	var opt = $.extend(defaultOption, option);
	return new AMap.Circle(opt);
};
//圆编辑插件
mapFactory.prototype.addCircleEditor = function(mapObj, circle) {
	var circleEditor;
	mapObj.plugin(["AMap.CircleEditor"], function() {
		circleEditor = new AMap.CircleEditor(mapObj, circle);
		circleEditor.open();
	});
	return circleEditor;
};
//绘制轨迹
mapFactory.prototype.Polyline = function(option) {
	var defaultOption = {
		strokeColor: "#00A",
		strokeOpacity: 1,
		strokeWeight: 3,
		strokeStyle: "solid"
	};
	var opt = $.extend(defaultOption, option);
	return new AMap.Polyline(opt);
};

//扩展
/*
 * @对地图对象扩展语言设置方法
 * @参数枚举值见文档
 */
/*AMap.Map.prototype.setLang = function(langtype) {
	var self = this;
	self.setLang(langtype);
};*/
/*
 * @设置地图copyright文本
 */
/*AMap.Map.prototype.setCopyRight = function(text) {
	$(".amap-copyright").text(text);
};*/

/*
 * 逆地址编码
 */
mapFactory.prototype.Geocoder = function(lng, lat, callback) {
	var MGeocoder;
	AMap.service(["AMap.Geocoder"], function() {
		MGeocoder = new AMap.Geocoder({
			city: "010", //城市，默认：“全国”
		});
		//返回地理编码结果
		//地理编码
		var lnglatXY= [lng,lat];
		var address="";
		MGeocoder.getAddress(lnglatXY,function(status, result) {
			if (status === 'complete' && result.info === 'OK') {
				address = result.regeocode.formattedAddress;
			}
			if (callback)
				callback(address);
		});
	});
}

/*
 * @移动端地图中操作事件处理
 */
;
(function($) {
	/*
	 * 地图层的tap事件
	 */
	$.gdmap = function(mapobj, fun) {
		(function($, map) {
			var touch = {},
				tapTimeout;
			var now, delta;
			AMap.event.addListener(map, "touchstart", function(e) {
				now = Date.now()
				touch.last = now
			});
			AMap.event.addListener(map, "touchmove", function(e) {
				if (tapTimeout) clearTimeout(tapTimeout)
				tapTimeout = null
				touch = {}
			});
			AMap.event.addListener(map, "touchend", function(e) {
				var _this = this;
				now = Date.now();
				delta = now - touch.last;
				if (delta > 0 && delta <= 250 && 'last' in touch) {
					tapTimeout = setTimeout(function() {
						if (tapTimeout) clearTimeout(tapTimeout)
						tapTimeout = null
						touch = {}
						$.isFunction(fun) && fun(_this);
					}, 0)
				} else {
					if (tapTimeout) clearTimeout(tapTimeout)
					tapTimeout = null
					touch = {}
				}
			});
		})(Zepto, mapobj)
	};
	/*
	 * 地图上覆盖物的tap事件
	 */
	$.marker = function(markerobj, fun) {
		(function($, marker) {
			var touch = {},
				tapTimeout;
			var now, delta;
			AMap.event.addListener(marker, "touchstart", function(e) {
				now = Date.now()
				touch.last = now
			});
			AMap.event.addListener(marker, "touchmove", function(e) {
				if (tapTimeout) clearTimeout(tapTimeout)
				tapTimeout = null
				touch = {}
			});
			AMap.event.addListener(marker, "touchend", function(e) {
				var _this = this;
				now = Date.now();
				delta = now - touch.last;
				if (delta > 0 && delta <= 250 && 'last' in touch) {
					tapTimeout = setTimeout(function() {
						if (tapTimeout) clearTimeout(tapTimeout)
						tapTimeout = null
						touch = {}
						$.isFunction(fun) && fun(_this);
					}, 0)
				} else {
					if (tapTimeout) clearTimeout(tapTimeout)
					tapTimeout = null
					touch = {}
				}
			});
		})(Zepto, markerobj)
	};
	/*
	 * 地图中信息窗的tap事件
	 */
	$.infoWin = function(tipdom, fun) {
		(function($, dom) {
			var touch = {},
				tapTimeout;
			var now, delta;
			dom.addEventListener("touchstart", function(e) {
				now = Date.now()
				touch.last = now
			});
			dom.addEventListener("touchend", function(e) {
				var _this = this;
				now = Date.now();
				delta = now - touch.last;
				if (delta > 0 && delta <= 250 && 'last' in touch) {
					tapTimeout = setTimeout(function() {
						if (tapTimeout) clearTimeout(tapTimeout)
						tapTimeout = null
						touch = {}
						$.isFunction(fun) && fun(_this);
					}, 0)
				} else {
					if (tapTimeout) clearTimeout(tapTimeout)
					tapTimeout = null
					touch = {}
				}
			});
			dom.addEventListener("touchcancel", function(e) {
				if (tapTimeout) clearTimeout(tapTimeout)
				tapTimeout = null
				touch = {}
			});
			dom.addEventListener("touchmove", function(e) {
				if (tapTimeout) clearTimeout(tapTimeout)
				tapTimeout = null
				touch = {}
			});
		})(Zepto, tipdom);
	}
})(Zepto);