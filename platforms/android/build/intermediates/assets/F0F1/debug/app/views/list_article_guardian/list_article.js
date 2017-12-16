var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var observableModule = require("data/observable")
var ObservableArray = require("data/observable-array").ObservableArray;
var ArticleGuardianListViewModel = require("../../shared/view-models/article-guardian-list-view-model");
var http = require("http");
var page;
var pageData;

var guardianArticleList;
var listViewGuardian;

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
	var categoryName = contextData.name;
	listViewGuardian = page.getViewById("guardianArticleList");
	guardianArticleList = new ArticleGuardianListViewModel([contextData.api_url,contextData.id_category]);
	pageData = new observableModule.fromObject({
		guardianArticleList: guardianArticleList,
		categoryName: categoryName
	});
	page.bindingContext = pageData;
	checkInternet();
	guardianArticleList.empty();
	pageData.set("isLoading", true);
	guardianArticleList.download().then(function() {
		pageData.set("isLoading", false);
		listViewGuardian.animate({
			opacity: 1,
			duration: 1000
		});
	});
};

exports.guardianArticleTapped = function(args) {
	var tappedView = args.view;
	var tappedItem = tappedView.bindingContext;
	var pageBindingContext = tappedView.page.bindingContext;
	var fullItemsList = pageBindingContext.guardianArticleList;
	var itemForTap = fullItemsList[args.index];
	var item = fullItemsList._array[args.index]
	var navigationEntry = {
		moduleName: "views/details_article_guardian/details_article",
		context: { api_url: item.api_url, id_text: item.id_text},
	};
	frameModule.topmost().navigate(navigationEntry);
}

exports.refreshList = function(args) {
    var pullRefresh = args.object;
	pullRefresh.refreshing = false;
    pageData.set("isLoading", true);
	guardianArticleList.empty();
	checkInternet();

	guardianArticleList.download().then(function() {
		pageData.set("isLoading", false);
		listViewGuardian.animate({
			opacity: 1,
			duration: 1000
		});
	});
}

