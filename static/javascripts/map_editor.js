function Arrow(opt,text,latlng,deg){
	this.setValues(opt);
	this.div_ = document.createElement('div');
	this.div_.style.position = 'absolute';
	this.div_.innerHTML = text;
	this.pos_ = latlng;
	this.deg_ = deg;
	this.text_ = text;
}
Arrow.prototype = new google.maps.OverlayView;
Arrow.prototype.onAdd = function(){
	this.getPanes().overlayLayer.appendChild(this.div_);
}
Arrow.prototype.onRemove = function(){
	this.div_.parentNode.removeChild(this.div_);
}
Arrow.prototype.draw = function(){
	var position = this.getProjection().fromLatLngToDivPixel(this.pos_);
	this.div_.style.left = position.x-8 + 'px';
	this.div_.style.top = position.y-8 + 'px';
	this.div_.style.setProperty('-moz-transform','rotate('+this.deg_+'deg)',null);
	this.div_.style.setProperty('-webkit-transform','rotate('+this.deg_+'deg)',null);
	this.div_.style.setProperty('-ms-transform','rotate('+this.deg_+'deg)',null);
	this.div_.style.setProperty('-o-transform','rotate('+this.deg_+'deg)',null);
	this.div_.style.setProperty('transform','rotate('+this.deg_+'deg)',null);
	this.div_.style.setProperty('z-index','100',null);
	this.div_.innerHTML = this.text_;
}
Arrow.prototype.rotate = function(deg){
	this.deg_ = deg;
	this.draw();
}
Arrow.prototype.setText = function(text){
	this.text_ = text;
	this.draw();
}
Arrow.prototype.setPos = function(latlng){
	this.pos_ = latlng;
	this.draw();
}

var types = {0:{text:'Stop',ico:'/static/images/points/stop.png'},1:{text:'Roller',ico:'/static/images/points/slalom.png'}}
var markers = [];
var arrows = [];
var infos = {};
var map;
var path;
var dist;
var statusDiv;

var __drag = false; // IE9 Fix
function getInternetExplorerVersion(){
	var rv = -1;
	if (navigator.appName == 'Microsoft Internet Explorer'){
		var ua = navigator.userAgent;
		var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(ua) != null)
		rv = parseFloat( RegExp.$1 );
	}
	return rv;
}

var createPolyline = function(){
	return new google.maps.Polyline({
		strokeColor: '#FF0000',
		strokeOpacity: 0.5,
		strokeWeight: 5
	})
}

function HomeControl(label, map, func) {
	var controlDiv = document.createElement('DIV');
	var controlUI = document.createElement('DIV');
	controlUI.style.backgroundColor = 'white';
	controlUI.style.borderStyle = 'solid';
	controlUI.style.borderWidth = '1px';
	controlUI.style.cursor = 'pointer';
	controlUI.style.textAlign = 'center';
	controlDiv.style.padding = '5px';
	controlDiv.appendChild(controlUI);

	var controlText = document.createElement('DIV');
	controlText.style.fontFamily = 'Arial,sans-serif';
	controlText.style.fontSize = '12px';
	controlText.style.paddingLeft = '4px';
	controlText.style.paddingRight = '4px';
	controlText.innerHTML = label;
	controlUI.appendChild(controlText);

	google.maps.event.addDomListener(controlUI, 'click', func);
	
	return {ui:controlText,div:controlDiv};
}

function createMap(){
	if ((getInternetExplorerVersion()<9)&&(getInternetExplorerVersion()>-1)){
		alert('Ваш браузер (InternetExplorer '+getInternetExplorerVersion()+') не поддерживается');
		return;
	}
	var myOptions = {
		center: new google.maps.LatLng(55.158691761980386,61.36197890472408),
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map"),myOptions);
	map.controls[google.maps.ControlPosition.RIGHT_TOP].push(new HomeControl('Очистить',map,function(){
			$.each(markers,function(key,value){
				value.setMap(null);
			})
			markers.splice(0,markers.length);
			repaintPath();
	}).div);
	var status = HomeControl('STATUS',map,null);
	statusDiv = status.ui;
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(status.div);
	path = createPolyline();
	path.setMap(map);
	google.maps.event.addListener(map, 'click', function(event) {
		addPoint(event)
	})
	textStatus();
}

function addPoint(event){
	if (ro)return;
	if (__drag){
		__drag = false;
		return;
	}
	var marker = new google.maps.Marker({
		position: event.latLng,
		draggable:true,
		icon:types[0].ico,
		animation: google.maps.Animation.DROP,
		map: map
	})
	marker.text_ = types[0].text;
	marker.type_ = 0;
	google.maps.event.addListener(marker, 'dragend', function(event) {
		movePoint(event,marker);
	})
	google.maps.event.addListener(marker, 'rightclick', function(event) {
		remPoint(event,marker)
	})
	google.maps.event.addListener(marker, 'click', function(event) {
		showPoint(event,marker)
	})
	markers.push(marker);
	repaintPath();
}
function remPoint(event,marker){
	if (ro)return;
	markers.splice(markers.indexOf(marker),1);
	marker.setMap(null);
	repaintPath();
}
function movePoint(event,marker){
	if (ro)return;
	repaintPath();
	if ((getInternetExplorerVersion()>-1)&&(getInternetExplorerVersion()<=9)){
		__drag=true;
	}
}
function showPoint(event,marker){
	var rand = Math.random();
	var typelinks = '';
	$.each(types,function(key,value){
		typelinks+='<a href="#" onclick="setPoint('+markers.indexOf(marker)+','+rand+','+key+')">Change to "'+value.text+'"</a><br>';
	})
	var info = new google.maps.InfoWindow({
		content: 'Point Type: '+marker.text_+'<br>'+typelinks+
		'<a href="http://maps.yandex.ru/?ll='+marker.position.lng()+'%2C'+marker.position.lat()+'&z=16&l=map%2Cstv%2Csta&ol=stv&oll='+marker.position.lng()+'%2C'+marker.position.lat()+'" target="_blank">Yandex Maps Pano</a>'
	});
	infos[rand] = info;
	info.open(map,marker);
}
function setPoint(markerid,infoid,type){
	if (ro)return;
	markers[markerid].text_=types[type].text;
	markers[markerid].type_=type;
	markers[markerid].setIcon(types[type].ico);
	__drag = true; // WTF Fix
	infos[infoid].close();
}

function repaintPath(){
	dist = 0;
	path.setMap(null);
	$.each(arrows,function(key,value){
		value.setMap(null);
	})
	arrows.splice(0,arrows.length);
	path.getPath().clear();
	for (var i=0;i<markers.length;i++){
		if (i>0){
			var clat = (markers[i-1].position.lat()+markers[i].position.lat())/2;
			var clng = (markers[i-1].position.lng()+markers[i].position.lng())/2;
			if ((getInternetExplorerVersion()<0)||(getInternetExplorerVersion()>8)){
				var deg = (((Math.atan((markers[i-1].position.lat()-markers[i].position.lat())/(markers[i-1].position.lng()-markers[i].position.lng()))*180)/Math.PI)+(((markers[i-1].position.lng()-markers[i].position.lng())<0)?0:180))*(-1);
				arrows.push(new Arrow({map:map},'<img src="/static/images/arrow.png">',new google.maps.LatLng(clat,clng),deg));
			}
			dist+=google.maps.geometry.spherical.computeDistanceBetween(markers[i-1].position,markers[i].position);
		}
		path.getPath().push(markers[i].position);
	}
	path.setMap(map);
	textStatus();
}

function textStatus(){
	statusDiv.innerHTML=''+
		'Длина пути: '+Math.round(dist)+' м.<br>'+
		'Точек: '+markers.length;
}

function createStaticMapURL(){
	return 'http://maps.google.com/maps/api/staticmap?size=240x240&sensor=false'+
		'&markers=label:S|'+markers[0].position.lat()+','+markers[0].position.lng()+
		'&markers=label:F|'+markers[markers.length-1].position.lat()+','+markers[markers.length-1].position.lng()+
		'&path=enc:'+google.maps.geometry.encoding.encodePath(path.getPath());
}

function putPreview(){
	$('#preview')[0].innerHTML = '<img src="'+createStaticMapURL()+'" >';
}

function makePath(){
	var ret = [];
	for (var i=0;i<markers.length;i++){
		ret.push({lat:markers[i].position.lat(),lng:markers[i].position.lng(),type:markers[i].type_,text:markers[i].text_});
	}
	return ret;
}	