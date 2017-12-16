var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");

var UserViewModel = require("../../shared/view-models/user-view-model");
var user = new UserViewModel();

exports.loaded = function(args) {
	var page = args.object;
	page.bindingContext = user;
};

function completeRegistration() {
	user.register().then(function(validate) {
		if(validate){
			dialogsModule.alert({
				title: "Succès inscription",
				message: "Votre compte a été crée avec succès.",
				okButtonText: "OK"
			)
			.then(function() {
				frameModule.topmost().navigate("views/login/login");
			});
		}
		else{
			dialogsModule.alert({
				title: "Erreur inscription",
				message: "Cet identifiant existe déjà.",
				okButtonText: "OK"
			});
		}
	});
}

exports.register = function() {
	if (user.isValidEmail()) {
		completeRegistration();
	} else {
		dialogsModule.alert({
			message: "Le format de l'adresse mail saisie est invalide.",
			okButtonText: "OK"
		});
	}
};
