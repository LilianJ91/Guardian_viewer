import * as fs from "tns-core-modules/file-system";
var dialogsModule = require("ui/dialogs");
var frameModule = require("ui/frame");
var observableModule = require("data/observable")
var ObservableArray = require("data/observable-array").ObservableArray;
var ArticleDetailsViewModel = require("../../shared/view-models/article-details-view-model");
var nativescriptFilePicker = require("nativescript-file-picker");
var http = require("http");
var page;
var pageData;

var articleHTML;
var article;

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
	article = page.getViewById("articleContent");
	articleHTML = new ArticleDetailsViewModel([contextData.api_url,contextData.id_text]);
	pageData = new observableModule.fromObject({
		articleHTML: articleHTML,
	});
	page.bindingContext = pageData;
	checkInternet();
	articleHTML.empty();
	pageData.set("isLoading", true);

	articleHTML.load().then(function(response) {
		if(response){
			console.log("set visible "+response);
			article.visibility="visible";
		}
		else{
			console.log("set hidden "+response);
			article.visibility="collapsed";	
		}
		pageData.set("isLoading", false);
		article.animate({
			opacity: 1,
			duration: 1000
		});
	});
	var documents = fs.knownFolders.documents();
	var file = documents.getFile("NewFileToCreate.txt");
};
