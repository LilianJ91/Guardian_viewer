var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var observableModule = require("data/observable")
var ObservableArray = require("data/observable-array").ObservableArray;
var ArticleGuardianDetailsViewModel = require("../../shared/view-models/article-guardian-details-view-model");
var http = require("http");
var page;
var pageData;

var guardianArticleHTML;
var articleGuardian;

function checkInternet() {
	online_pic = page.getViewById("online_pic");
	offline_pic = page.getViewById("offline_pic");
	http.request({ url: "https://content.guardianapis.com/?api-key=324ba851-77b1-458f-a54c-c8f5d619a18c", method: "GET" }).then(function(data) {
		offline_pic.visibility="collapsed";
		online_pic.visibility="visible";
	}, function(error) {
		online_pic.visibility="collapsed";
		offline_pic.visibility="visible";
	});
}

exports.loaded = function(args) {
	page = args.object;
	var contextData = page.navigationContext;
	articleGuardian = page.getViewById("guardianArticleHTML");
	guardianArticleHTML = new ArticleGuardianDetailsViewModel([contextData.api_url,contextData.id_text]);
	pageData = new observableModule.fromObject({
		guardianArticleHTML: guardianArticleHTML,
	});
	page.bindingContext = pageData;
	checkInternet();
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
	checkInternet();

	guardianArticleHTML.download().then(function() {
		pageData.set("isLoading", false);
		articleGuardian.animate({
			opacity: 1,
			duration: 1000
		});
	});
}
