var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var observableModule = require("data/observable")
var ObservableArray = require("data/observable-array").ObservableArray;
var ArticleGuardianListViewModel = require("../../shared/view-models/article-guardian-list-view-model");
var globalFunctions = require('../../app');
var page;
var pageData;

var guardianArticleList;
var listViewGuardian;

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
	globalFunctions.checkInternet(page);
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
	globalFunctions.checkInternet(page);

	guardianArticleList.download().then(function() {
		pageData.set("isLoading", false);
		listViewGuardian.animate({
			opacity: 1,
			duration: 1000
		});
	});
}

