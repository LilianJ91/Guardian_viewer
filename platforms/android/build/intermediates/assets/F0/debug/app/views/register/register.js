var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");

var UserViewModel = require("../../shared/view-models/user-view-model");
var user = new UserViewModel();

exports.loaded = function(args) {
    var page = args.object;
    page.bindingContext = user;
};

function completeRegistration() {
    user.register()
        .then(function() {
            dialogsModule
                .alert("Votre compte a été crée avec succès.")
                .then(function() {
                    frameModule.topmost().navigate("views/login/login");
                });
        }).catch(function(error) {
            console.log(error);
            dialogsModule
                .alert({
                    message: "Malheureusement votre compte n'a pas pu être crée.",
                    okButtonText: "OK"
                });
        });
}

exports.register = function() {
    if (user.isValidEmail()) {
        completeRegistration();
    } else {
        dialogsModule.alert({
            message: "Le format de l'adresse mail saisit est invalides.",
            okButtonText: "OK"
        });
    }
};
