var config = require("../../shared/config");
var fetchModule = require("fetch");
var observableModule = require("data/observable");
var validator = require("email-validator");
var Sqlite = require("nativescript-sqlite");
var hash = require('hash.js');

function User(info) {
	info = info || {};
	var database;
	(new Sqlite("guardianViewerDB")).then(db => {
		database = db;	
		database.execSQL("CREATE TABLE IF NOT EXISTS users  (id INTEGER PRIMARY KEY AUTOINCREMENT, mail TEXT NOT NULL UNIQUE, password TEXT NOT NULL)").then(id => {
		}, error => {
			console.log("CREATE TABLE ERROR", error);
		});
	}, error => {
		console.log("OPEN DB ERROR", error);
	});

	// You can add properties to observables on creation
	var viewModel = new observableModule.fromObject({
		email: "",
		password: ""
	});

	viewModel.register = function() {
		return database.execSQL("INSERT INTO users (mail, password) VALUES (?, ?)", [viewModel.get("email"),hash.sha256().update(viewModel.get("password")).digest('hex')]).then(id => {
			return 1;
		}, error => {
			//Si l'adresse mail est déjà utilisée
			return 0;
		});
	};

	viewModel.login = function() {
		return database.all("SELECT * FROM users WHERE mail = \""+viewModel.get("email")+"\" and password = \""+hash.sha256().update(viewModel.get("password")).digest('hex')+"\"").then(rows => {
			if(rows.length == 1) {
				//Authentifié
				return 1;
			}
			//Erreur d'authentification
			return 0;
		}, error => {
			return 0;
		});
	};

	viewModel.isValidEmail = function() {
		var email = this.get("email");
		return validator.validate(email);
	};

	return viewModel;
}

function handleErrors(response) {
	if (!response.ok) {
		console.log(JSON.stringify(response));
		throw Error(response.statusText);
	}
	return response;
}

function ExceptionAuthentification(message) {
   this.message = message;
   this.name = "ExceptionAuthentification";
}

function ExceptionInscription(message) {
   this.message = message;
   this.name = "ExceptionInscription";
}

module.exports = User;
