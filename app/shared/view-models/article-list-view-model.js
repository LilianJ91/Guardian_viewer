var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var Sqlite = require("nativescript-sqlite");
var globalFunctions = require('../../app');
var http = require("http");

function ArticleListViewModel(items) {
	var viewModel = new ObservableArray(items);
	id_category_text = items[0];
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

	viewModel.load = function() {
		return fix_bug_promise().then(function(data) {
			database.all("SELECT * FROM article WHERE id_category_text = \""+id_category_text+"\" and is_read_only = 0").then(rows => {
				for(var row in rows) {
					article = rows[row];
					viewModel.push({
						id_text: article[2],
						name: article[3],
						publication_date: new Date(article[5]).toLongFrenchFormat(),
					});
				}
			}, error => {
				console.log("SELECT ERROR", error);
			});
		});
	};

	viewModel.add = function(article) {
		id_text = article.toLowerCase().replace(new RegExp(' ', 'g'), '-');
		return database.execSQL("INSERT OR IGNORE INTO article (id_text, id_category_text, web_title, api_url, publication_date, is_visited, is_read_only) VALUES (?, ?, ?, ?, ?, ?, ?)", [id_text,id_category_text,article,"",new Date(),0,0]).then(id => {
			viewModel.push({
				id_text: id_text,
				name: article,
				publication_date: new Date().toLongFrenchFormat(),
			});
		}, error => {
			console.log("INSERT ERROR", error);
		});
	};

	viewModel.delete = function(index) {
		return database.execSQL("DELETE FROM article WHERE id_text = \""+viewModel.getItem(index).id_text+"\"").then(id => {
			viewModel.splice(index, 1);
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

module.exports = ArticleListViewModel;
