var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var observableModule = require("data/observable")
var ObservableArray = require("data/observable-array").ObservableArray;
var CategoryListViewModel = require("../../shared/view-models/category-list-view-model");
var swipeDelete = require("../../shared/utils/ios-swipe-delete");
var Sqlite = require("nativescript-sqlite");
var globalFunctions = require('../../app');
var page;
var pageData;

var guardianCategoryList;
var myCategoryList;
var listViewGuardian;
var listViewPerso;

exports.loaded = function(args) {
	page = args.object;
	
	guardianCategoryList = new CategoryListViewModel();
	myCategoryList = new CategoryListViewModel();
	
	pageData = new observableModule.fromObject({
		guardianCategoryList: guardianCategoryList,
		myCategoryList: myCategoryList,
		category: "",
	});

	listViewGuardian = page.getViewById("guardianCategoryList");
	listViewPerso = page.getViewById("myCategoryList");

	if (page.ios) {
		swipeDelete.enable(listViewPerso, function(index) {
			myCategoryList.delete(index);
		});
	}

	page.bindingContext = pageData;

	pageData.set("isLoading", true);
	guardianCategoryList.empty();
	myCategoryList.empty();
	globalFunctions.checkInternet(page);

	guardianCategoryList.download().then(function() {
		pageData.set("isLoading", false);
		listViewGuardian.animate({
			opacity: 1,
			duration: 1000
		});
	});
	myCategoryList.load().then(function() {
		listViewPerso.animate({
			opacity: 1,
			duration: 1000
		});
	});
};

exports.guardianCategoryTapped = function(args) {
	var tappedView = args.view;
	var tappedItem = tappedView.bindingContext;
	var pageBindingContext = tappedView.page.bindingContext;
	var fullItemsList = pageBindingContext.guardianCategoryList;
	var itemForTap = fullItemsList[args.index];
	var item = fullItemsList._array[args.index]
	var navigationEntry = {
		moduleName: "views/list_article_guardian/list_article",
		context: {name: item.name, api_url: item.api_url, id_category: item.id_text},
	};
	frameModule.topmost().navigate(navigationEntry);
}

exports.myCategoryTapped = function(args) {
	var tappedView = args.view;
	var tappedItem = tappedView.bindingContext;
	var pageBindingContext = tappedView.page.bindingContext;
	var fullItemsList = pageBindingContext.myCategoryList;
	var itemForTap = fullItemsList[args.index];
	var item = fullItemsList._array[args.index]
	var navigationEntry = {
		moduleName: "views/list_article/list_article",
		context: {name: item.name, id_category: item.id_text},
	};
	frameModule.topmost().navigate(navigationEntry);
}

exports.add = function() {
	if (pageData.get("category").trim() === "") {
		dialogsModule.alert({
			title: "Erreur création",
			message: "Veuillez saisir le nom de la nouvelle catégorie",
			okButtonText: "OK"
		});
		return;
	}

	page.getViewById("newCategory").dismissSoftInput();
	myCategoryList.add(pageData.get("category"))
	.then(function(response) {
		if(response != 1){
			dialogsModule.alert({
				title: "Erreur création",
				message: "Le nom de la catégorie est déjà utilisé.",
				okButtonText: "OK"
			});
		}
	});

	pageData.set("category", "");
};

exports.delete = function(args) {
	dialogsModule.confirm({
		title: "Confirmation de suppression",
		message: "Attention la suppression d'une catégorie entraîne la suppression des articles associés",
		okButtonText: "OK",
		cancelButtonText: "Annuler",
	}).then(function (result) {
		if(result){
			var item = args.view.bindingContext;
			var index = myCategoryList.indexOf(item);
			myCategoryList.delete(index);
		}
	});
};

exports.refreshList = function(args) {
    var pullRefresh = args.object;
	pullRefresh.refreshing = false;
    pageData.set("isLoading", true);
	guardianCategoryList.empty();
	myCategoryList.empty();
	globalFunctions.checkInternet(page);

	guardianCategoryList.download().then(function() {
		pageData.set("isLoading", false);
		listViewGuardian.animate({
			opacity: 1,
			duration: 1000
		});
	});
}
