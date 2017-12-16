var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var Sqlite = require("nativescript-sqlite");
var http = require("http");

function ArticleGuardianDetailsViewModel(items) {
	var viewModel = new ObservableArray(items);

	var database;
	(new Sqlite("guardianViewerDB")).then(db => {
		database = db;
	}, error => {
		console.log("OPEN DB ERROR", error);
	});

	viewModel.download = function() {
		api_url = items[0];
		id_article_text = items[1];

		return http.getJSON(api_url+"?show-fields=all&api-key=324ba851-77b1-458f-a54c-c8f5d619a18c").then(function(data) {
			article_html = data.response.content.fields.body;
			database.execSQL("UPDATE article set is_visited = 1, content_html = \""+escapeHtml(article_html)+"\" WHERE id_text =\""+id_article_text+"\"").then(id => {
			}, error => {
				console.log("UPDATE ERROR", error);
			});
			viewModel.push({
				article_html: article_html,
			});
		}, function(error) {
			//Offline ou problème de requête on utilise le back-up
			database.all("SELECT * FROM article WHERE id_text =\""+id_article_text+"\"").then(rows => {
				if(rows.length == 1) {
					viewModel.push({
						article_html: decodeHtml(rows[0][6])
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

function escapeHtml(text) {
  var map = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function decodeHtml(str)
{
    var map =
    {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#039;': "'"
    };
    return str.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function(m) {return map[m];});
}

module.exports = ArticleGuardianDetailsViewModel;
