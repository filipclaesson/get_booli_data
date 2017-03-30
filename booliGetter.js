var http = require('http');
var querystring = require('querystring');
var fs = require('fs');


function getApartments(minDate, maxDate, callback){
	url = getQueryString("1,13,35,76,95",500,0,minDate, maxDate);
	http.get(url, function (res) {
		var body = "";
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			var aptList = [];
			var apts = JSON.parse(body); 
			//console.log(apts)
			// ---- Add every apt in list to bigList ---- // 
			for (var i = 0; i < apts.count; i++) {
				apt = setupAptObject(apts.sold[i]);
				aptList.push(apt);
			};
			callback(aptList);
		});
	});
}

function getQueryString(areaCode, limit, offset, minDate, maxDate){
  var crypto = require('crypto');
  var shasum = crypto.createHash('sha1');
  var auth2 = {};
  auth2.callerId = "kopbostad";
  auth2.time = Math.round(Date.now() / 1000);
  auth2.unique = crypto.randomBytes(Math.ceil(16/2)).toString("hex").slice(0, 16);
  auth2.hash = shasum.update(auth2.callerId + auth2.time + "PhdlcpnsSbNId0qHmWIyYNivCB6JfgTRwq0vQqU1" + auth2.unique).digest("hex");
  var limitString = "limit=" + limit + "&";
  var areaString = areaCode + "&";
  var offsetString = "offset=" + offset + "&";
  var minDateString = "minSoldDate=" + minDate + "&";
  var maxDateString = "maxSoldDate=" + maxDate + "&";
  var url = "http://api.booli.se/sold?q="+ areaString + minDateString + maxDateString +  limitString + offsetString + querystring.stringify(auth2);
  console.log(url)
  return url;
  //http://api.booli.se/sold?q=1&minSoldDate=20170101&maxSoldDate=20170101&limit=500&offset=0&callerId=kopbostad&time=1489012408&unique=46d1e6076f6221c8&hash=0d25974f52c915acad2396bc40fad49df63a40f6

  // Center med kvadrat ?? center=59.34674,18.0603&dim=500,500

}

function setupAptObject(aptIn){
	
	var apt = {
		booliId: aptIn.booliId,
		soldDate: aptIn.soldDate,
		address: removeComma(aptIn.location.address['streetAddress']),
		
		// distanceToOcean: aptIn.location.distance['ocean'],
		areas: (aptIn.location.namedAreas).toString(),
		lon: aptIn.location.position.longitude,
		lat: aptIn.location.position.latitude,  	
	    room: checkNumber(aptIn.rooms),
	    floor: checkNumber(aptIn.floor),
	    sqm: checkNumber(aptIn.livingArea),
	    listPrice: checkNumber(aptIn.listPrice),
	    priceUp: checkNumber(aptIn.soldPrice - aptIn.listPrice),
	    soldPrice: checkNumber(aptIn.soldPrice),
	    rent: checkNumber(aptIn.rent),
	    distanceToOcean: distanceToOcean(aptIn.location.distance),
	    constructionYear: checkNumber(aptIn.constructionYear),
	    objectType: aptIn.objectType,
	    broker: aptIn.source.name,
	    brokerId: aptIn.source.id,
		brokerType: aptIn.source.type,
		distanceVariables: []
	}

	return apt;
}

function removeComma(text){
  return text.replace(/,/g , "newchar");
}

function checkNumber(data){
  if (typeof data != "number"){ 
    return undefined
  }else{
    return data
  }
}

function distanceToOcean(distance){
	if (distance == undefined){
		return undefined;
	}else{
		return distance['ocean']
	}
}


module.exports = {
  getApartments: getApartments
}

