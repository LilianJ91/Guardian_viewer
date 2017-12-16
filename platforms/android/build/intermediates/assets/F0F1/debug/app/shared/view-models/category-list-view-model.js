var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var Sqlite = require("nativescript-sqlite");
var http = require("http");

function CategoryListViewModel(items) {
	var viewModel = new ObservableArray(items);
	var database;
	(new Sqlite("guardianViewerDB")).then(db => {
		database = db;
		database.execSQL("CREATE TABLE IF NOT EXISTS category (id INTEGER PRIMARY KEY AUTOINCREMENT, id_text TEXT NOT NULL UNIQUE, web_title TEXT NOT NULL, api_url TEXT NOT NULL, is_visited INTEGER NOT NULL, is_read_only INTEGER NOT NULL)").then(id => {
		}, error => {
			console.log("CREATE TABLE ERROR", error);
		});
	}, error => {
		console.log("OPEN DB ERROR", error);
	});

	//Récupération des catégories du Guardian sur internet et en cas d'erreur les données en base de données
	viewModel.download = function() {
		return http.getJSON("https://content.guardianapis.com/sections?api-key=324ba851-77b1-458f-a54c-c8f5d619a18c").then(function(data) {
			//Lorsque le serveur est bien joignable on synchronise les données (insert if not exist)
			data.response.results.forEach(function(category) {
				database.execSQL("INSERT OR IGNORE INTO category (id_text, web_title, api_url, is_visited, is_read_only) VALUES (?, ?, ?, ?, ?)", [category.id,category.webTitle,category.apiUrl,0,1]).then(id => {
				}, error => {
					console.log("INSERT ERROR", error);
				});
				viewModel.push({
					id_text: category.id,
					name: category.webTitle,			
					api_url : category.apiUrl,
					cache_or_online : 1
				});
			});
		}, function(error) {
			//Offline ou problème de requête on utilise le back-up
			database.all("SELECT * FROM category WHERE is_read_only = 1").then(rows => {
				for(var row in rows) {
					category = rows[row];
					viewModel.push({
						id_text: category[1],
						name: category[2],			
						api_url : category[3],
						cache_or_online : category[4]
					});
				}
			}, error => {
				console.log("SELECT ERROR", error);
			});
		});
	};

	//Récupération des catégories de l'utilisateur en base de données
	viewModel.load = function() {
		return fix_bug_promise().then(function() {
			//Offline ou problème de requête on utilise le back-up
			database.all("SELECT * FROM category WHERE is_read_only = 0").then(rows => {
				for(var row in rows) {
					category = rows[row];
					viewModel.push({
						id_text: category[1],
						name: category[2],
					});
				}
			}, error => {
				console.log("SELECT ERROR", error);
			});
		});
	};

	viewModel.add = function(category) {
		id_text = category.toLowerCase().replace(new RegExp(' ', 'g'), '-');
		return database.execSQL("INSERT INTO category (id_text, web_title, api_url, is_visited, is_read_only) VALUES (?, ?, ?, ?, ?)", [id_text,category,"",0,0]).then(id => {
			viewModel.push({
				id_text: id_text,
				name: category,
			});
			return 1;
		}, error => {
			console.log("INSERT ERROR", error);
			return 0;
		});
	};

	viewModel.delete = function(index) {
		return database.execSQL("DELETE FROM article WHERE id_category_text = \""+viewModel.getItem(index).id_text+"\"").then(id => {
			database.execSQL("DELETE FROM category WHERE id_text = \""+viewModel.getItem(index).id_text+"\"").then(id => {
				viewModel.splice(index, 1);
			}, error => {
				console.log("DELETE ERROR", error);
			});
		}, error => {
			console.log("DELETE ERROR", error);
		});
	};

	viewModel.empty = function() {
		while (viewModel.length) {
			viewModel.pop();
		}
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


async function fix_bug_promise() {
}

module.exports = CategoryListViewModel;
