var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var Sqlite = require("nativescript-sqlite");
var globalFunctions = require('../../app');
var http = require("http");

function ArticleGuardianListViewModel(items) {
	var viewModel = new ObservableArray(items);

	var database;
	(new Sqlite("guardianViewerDB")).then(db => {
		database = db;
		database.execSQL("CREATE TABLE IF NOT EXISTS article (id INTEGER PRIMARY KEY AUTOINCREMENT, id_category_text TEXT, id_text TEXT NOT NULL UNIQUE, web_title TEXT NOT NULL, api_url TEXT NOT NULL, publication_date TEXT NOT NULL, content_html TEXT, is_visited INTEGER NOT NULL, is_read_only INTEGER NOT NULL, FOREIGN KEY(id_category_text) REFERENCES category(id_text))").then(id => {
		}, error => {
			console.log("CREATE TABLE ERROR", error);
		});
	}, error => {
		console.log("OPEN DB ERROR", error);
	});

	viewModel.download = function() {
		api_url = items[0];
		id_category_text = items[1];
		return http.getJSON(api_url+"?api-key=324ba851-77b1-458f-a54c-c8f5d619a18c").then(function(data) {
			//Lorsque le serveur est bien joignable on synchronise les données (insert if not exist)
			data.response.results.forEach(function(article) {
				database.execSQL("INSERT OR IGNORE INTO article (id_category_text, id_text, web_title, api_url, publication_date, is_visited, is_read_only) VALUES (?, ?, ?, ?, ?, ?, ?)", [id_category_text,article.id, article.webTitle, article.apiUrl, article.webPublicationDate, 0, 1]).then(id => {
				}, error => {
					console.log("INSERT ERROR", error);
				});
				database.execSQL("UPDATE category set is_visited = 1 WHERE id_text =\""+id_category_text+"\"").then(id => {
				}, error => {
					console.log("UPDATE ERROR", error);
				});
				viewModel.push({
					id_text: article.id,
					name: article.webTitle,
					publication_date: new Date(article.webPublicationDate).toLongFrenchFormat(),		
					api_url: article.apiUrl,
					cache_or_online : 1
				});
			});
		}, function(error) {
			//Offline ou problème de requête on utilise le back-up
			database.all("SELECT * FROM article WHERE id_category_text = \""+id_category_text+"\" and is_read_only = 1").then(rows => {
				for(var row in rows) {
					article = rows[row];
					viewModel.push({
						id_text: article[2],
						name: article[3],	  
						api_url: article[4],
						publication_date: new Date(article[5]).toLongFrenchFormat(),
						cache_or_online: article[7]
					});
				}
			}, error => {
				console.log("SELECT ERROR", error);
			});
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

module.exports = ArticleGuardianListViewModel;
