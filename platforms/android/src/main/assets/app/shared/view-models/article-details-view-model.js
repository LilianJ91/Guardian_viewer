var config = require("../../shared/config");
var fetchModule = require("fetch");
var ObservableArray = require("data/observable-array").ObservableArray;
var Sqlite = require("nativescript-sqlite");
var http = require("http");

function ArticleDetailsViewModel(items) {
	var viewModel = new ObservableArray(items);
	var id_article_text;

	var database;
	(new Sqlite("guardianViewerDB")).then(db => {
		database = db;
	}, error => {
		console.log("OPEN DB ERROR", error);
	});

	viewModel.load = function() {
		id_article_text = items[0];
		console.dir(id_article_text);
		return fix_bug_promise().then(function(data) {
			return database.all("SELECT * FROM article WHERE id_text = \""+id_article_text+"\" and is_read_only = 0").then(rows => {
				var content_html = "";
				if(rows.length == 1){
					content_html = rows[0][6];
					if(content_html == null)
						content_html = "";
					return content_html;
				}
				return content_html;
			}, error => {
				console.log("SELECT ERROR", error);
				return content_html;
			});
		});
	};

	viewModel.save = function(content_html){
		return database.execSQL("UPDATE article set content_html =\""+content_html+"\" WHERE id_text =\""+id_article_text+"\"").then(id => {
		}, error => {
			console.log("UPDATE ERROR", error);
		});
	}

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
