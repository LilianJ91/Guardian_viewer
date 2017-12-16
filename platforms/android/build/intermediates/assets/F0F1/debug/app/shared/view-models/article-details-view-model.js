var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var Sqlite = require("nativescript-sqlite");
var http = require("http");

function ArticleDetailsViewModel(items) {
	var viewModel = new ObservableArray(items);

	var database;
	(new Sqlite("guardianViewerDB")).then(db => {
		database = db;
	}, error => {
		console.log("OPEN DB ERROR", error);
	});

	viewModel.load = function(is_filled) {
		id_article_text = items[0];
		return fix_bug_promise().then(function(data) {
			return database.all("SELECT * FROM article WHERE id_category_text = \""+id_category_text+"\" and is_read_only = 0").then(rows => {
				if(rows.length == 1){
					article = rows[0];
					viewModel.push({
						article_html: article[6],
					});
					console.dir(article);
					if(article[6] != null){
						console.log("is filled");
						return 1;
					}
				}
				console.log("is not filled");
				// Set to 0 to test html
				return 1;
			}, error => {
				console.log("SELECT ERROR", error);
				return 1;
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

async function fix_bug_promise() {
}

module.exports = ArticleDetailsViewModel;
