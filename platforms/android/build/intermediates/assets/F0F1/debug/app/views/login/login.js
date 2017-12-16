var frameModule = require("ui/frame");
var UserViewModel = require("../../shared/view-models/user-view-model");
var dialogsModule = require("ui/dialogs");
var http = require("http");

var page;
var user = new UserViewModel();

function checkInternet() {
	http.request({ url: "https://content.guardianapis.com/?api-key=324ba851-77b1-458f-a54c-c8f5d619a18c", method: "GET" }).then(function(data) {
	}, function(error) {
		dialogsModule.alert({
			title: "Accès internet",
            message: "Le serveur est injoignable vous pouvez cependant naviguer en cache. Veuillez activer vos data pour synchroniser l'application.",
            okButtonText: "OK"
        });
	});
}

exports.loaded = function(args) {
    page = args.object;
    page.bindingContext = user;
	checkInternet();
};

exports.signIn = function() {
	user.login().then(function(validate) {
		if(validate){
			frameModule.topmost().navigate("views/list_category/list_category");
		}
		else{
			dialogsModule.alert({
				title: "Erreur connexion",
                message: "Votre identifiant ou votre mot de passe est invalide.",
                okButtonText: "OK"
            });
		}
	});
};

exports.register = function() {
    var topmost = frameModule.topmost();
    topmost.navigate("views/register/register");
};
