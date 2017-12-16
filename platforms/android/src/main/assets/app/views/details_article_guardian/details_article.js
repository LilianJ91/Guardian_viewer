var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var observableModule = require("data/observable")
var ObservableArray = require("data/observable-array").ObservableArray;
var ArticleGuardianDetailsViewModel = require("../../shared/view-models/article-guardian-details-view-model");
var globalFunctions = require('../../app');
var page;
var pageData;

var guardianArticleHTML;
var articleGuardian;

exports.loaded = function(args) {
	page = args.object;
	var contextData = page.navigationContext;
	articleGuardian = page.getViewById("guardianArticleHTML");
	guardianArticleHTML = new ArticleGuardianDetailsViewModel([contextData.api_url,contextData.id_text]);
	pageData = new observableModule.fromObject({
		guardianArticleHTML: guardianArticleHTML,
	});
	page.bindingContext = pageData;
	globalFunctions.checkInternet(page);
	guardianArticleHTML.empty();
	pageData.set("isLoading", true);
	guardianArticleHTML.download().then(function() {
		pageData.set("isLoading", false);
		articleGuardian.animate({
			opacity: 1,
			duration: 1000
		});
	});
};

exports.refreshArticle = function(args) {
    var pullRefresh = args.object;
	pullRefresh.refreshing = false;
    pageData.set("isLoading", true);
	guardianArticleHTML.empty();
	globalFunctions.checkInternet(page);

	guardianArticleHTML.download().then(function() {
		pageData.set("isLoading", false);
		articleGuardian.animate({
			opacity: 1,
			duration: 1000
		});
	});
}
