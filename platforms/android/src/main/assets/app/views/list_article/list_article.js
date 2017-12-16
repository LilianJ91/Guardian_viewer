var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var observableModule = require("data/observable")
var ObservableArray = require("data/observable-array").ObservableArray;
var ArticleListViewModel = require("../../shared/view-models/article-list-view-model");
var swipeDelete = require("../../shared/utils/ios-swipe-delete");
var globalFunctions = require('../../app');
var page;
var pageData;

var myArticleList;
var listView;

exports.loaded = function(args) {
	page = args.object;
	var contextData = page.navigationContext;
	var categoryName = contextData.name;
	myArticleList = new ArticleListViewModel([contextData.id_category]);

	pageData = new observableModule.fromObject({
		myArticleList: myArticleList,
		categoryName: categoryName
	});

	listView = page.getViewById("myArticleList");

	if (page.ios) {
		swipeDelete.enable(listView, function(index) {
			myArticleList.delete(index);
		});
	}

	page.bindingContext = pageData;
	globalFunctions.checkInternet(page);
	myArticleList.empty();
	pageData.set("isLoading", true);
	myArticleList.load().then(function() {
		pageData.set("isLoading", false);
		listView.animate({
			opacity: 1,
			duration: 1000
		});
	});
};

exports.add = function() {
	if (pageData.get("article").trim() === "") {
		dialogsModule.alert({
			title: "Erreur création",
			message: "Veuillez saisir le nom du nouvel article",
			okButtonText: "OK"
		});
		return;
	}

	page.getViewById("newArticle").dismissSoftInput();
	myArticleList.add(pageData.get("article"))
	.catch(function() {
		dialogsModule.alert({
			title: "Erreur création",
			message: "Une erreur est survenue lors de la création de l'article.",
			okButtonText: "OK"
		});
	});

	pageData.set("article", "");
};

exports.delete = function(args) {

	dialogsModule.confirm({
		title: "Confirmation de suppression",
		message: "Vous êtes sur le point de supprimer un article",
		okButtonText: "OK",
		cancelButtonText: "Annuler",
	}).then(function (result) {
		if(result){
			var item = args.view.bindingContext;
			var index = myArticleList.indexOf(item);
			myArticleList.delete(index);
		}
	});
};

exports.articleTapped = function(args) {
	var tappedView = args.view;
	var tappedItem = tappedView.bindingContext;
	var pageBindingContext = tappedView.page.bindingContext;
	var fullItemsList = pageBindingContext.myArticleList;
	var itemForTap = fullItemsList[args.index];
	var item = fullItemsList._array[args.index]
	var navigationEntry = {
		moduleName: "views/details_article/details_article",
		context: { id_text: item.id_text},
	};
	frameModule.topmost().navigate(navigationEntry);
}
