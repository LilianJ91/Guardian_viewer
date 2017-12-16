var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var observableModule = require("data/observable")
var ObservableArray = require("data/observable-array").ObservableArray;
var ArticleDetailsViewModel = require("../../shared/view-models/article-details-view-model");
var globalFunctions = require('../../app');
var page;
var pageData;

var articleHTML;
var article;
var back_up = "";
var webView;

exports.loaded = function(args) {
	page = args.object;
	var contextData = page.navigationContext;
	article = page.getViewById("articleContent");
	articleHTML = new ArticleDetailsViewModel([contextData.id_text]);
	pageData = new observableModule.fromObject({
		article_html: back_up,
	});
	page.bindingContext = pageData;
	globalFunctions.checkInternet(page);
	articleHTML.empty();
	pageData.set("isLoading", true);

	articleHTML.load().then(function(response) {
		back_up = response;
		pageData.set("article_html",back_up);
		pageData.set("isLoading", false);
		article.animate({
			opacity: 1,
			duration: 1000
		});
	});
};

exports.save = function(args) {
	back_up = pageData.get("article_html");
	articleHTML.save(back_up);
}

exports.cancel = function(args) {
	pageData.set("article_html",back_up)
}
