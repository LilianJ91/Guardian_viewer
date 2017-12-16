var applicationModule = require("application");
applicationModule.start({ moduleName: "views/login/login" });
var http = require("http");

exports.checkInternet = function(page) {
	online_pic = page.getViewById("online_pic");
	offline_pic = page.getViewById("offline_pic");
	http.request({ url: "https://content.guardianapis.com/?api-key=324ba851-77b1-458f-a54c-c8f5d619a18c", method: "GET" }).then(function(data) {
		offline_pic.visibility="collapsed";
		online_pic.visibility="visible";
	}, function(error) {
		online_pic.visibility="collapsed";
		offline_pic.visibility="visible";
	});
}

Date.prototype.toLongFrenchFormat = function ()
{
	var months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
	var days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
	var date = this.getDate();
	if (date < 10)
	{
		date = "0" + date;	
	}
	var output = days[this.getDay()] + " " + date + " " + months[this.getMonth()] + " " + this.getFullYear();
	return output;
}
