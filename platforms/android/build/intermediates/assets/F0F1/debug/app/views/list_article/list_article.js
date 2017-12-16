var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var observableModule = require("data/observable")
var ObservableArray = require("data/observable-array").ObservableArray;
var ArticleListViewModel = require("../../shared/view-models/article-list-view-model");
var http = require("http");
var page;
var pageData;

var myArticleList;
var listView;

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
	listView = page.getViewById("myArticleList");
	myArticleList = new ArticleListViewModel([contextData.id_category]);
	pageData = new observableModule.fromObject({
		myArticleList: myArticleList,
		categoryName: categoryName
	});
	page.bindingContext = pageData;
	checkInternet();
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
