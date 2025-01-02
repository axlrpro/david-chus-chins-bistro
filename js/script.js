$(function(){
    $("#navbarToggle").blur(function(){
        var screenWidth = window.innerWidth;
        if(screenWidth<768){
            $("#collapsable-nav").collapse('hide');
        }
    });
});

(function (global){
    var dc = {};

    var homeHtml = "snippets/home-snippet.html";
    var allCategoriesUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
    var categoriesTitleHtml = "snippets/categories-title-snippet.html";
    var categoryHtml = "snippets/category-snippet.html";
    var singleCategoryUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
    var singleCategoryHtml = "snippets/single-category-snippet.html";
    var singleCategoryTitleHtml = "snippets/single-category-title-snippet.html";

    var insertHtml = function(selector, html){
        var targetelement = document.querySelector(selector);
        targetelement.innerHTML = html;
    };

    var showLoading = function(selector){
        var html = "<div class='text-center'>";
        html += "<img src='images/ajax-loader.gif'></div>";
        insertHtml(selector, html);
    };

    var insertProperty = function(string, propName, propValue){
        var propToReplace = "{{" + propName + "}}";
        string = string.replace(new RegExp(propToReplace, "g"), propValue);
        return string;
    }

    document.addEventListener('DOMContentLoaded', function(){
        showLoading('#main-content');
        $ajaxUtils.sendGetRequest(
            homeHtml,
            function(response){
                console.log(response);
                document.querySelector('#main-content').innerHTML = response.responseText;
            },
            false);
    });

    dc.loadMenuCategories = function(){
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
    };

    var buildAndShowCategoriesHTML = function(categories){
        categories = categories.responseText;
        categories = JSON.parse(categories);
        $ajaxUtils.sendGetRequest(
            categoriesTitleHtml,
            function(categoriesTitleHtml){
                categoriesTitleHtml = categoriesTitleHtml.responseText;
                $ajaxUtils.sendGetRequest(
                    categoryHtml,
                    function(categoryHtml){
                        categoryHtml = categoryHtml.responseText;
                        var categoriesViewHtml = buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml);
                        insertHtml("#main-content", categoriesViewHtml);
                    },
                    false
                );
            },
            false
        );
    };

    function buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml){
        var finalHtml = categoriesTitleHtml;
        finalHtml += "<section class='row'>";

        for(var i=0; i<categories.length; i++){
            var html = categoryHtml;
            var name = "" + categories[i].name;
            var short_name = categories[i].short_name;
            html = insertProperty(html, "name", name);
            html = insertProperty(html, "short_name", short_name);
            finalHtml += html;
        }
        finalHtml += "</section>";
        return finalHtml;
    }

    dc.loadMenuItems = function(short_name){
        //show loading 
        showLoading("#main-content");
        //send ajaxrequest to get json
        singleCategoryUrl += short_name + ".json";
        $ajaxUtils.sendGetRequest(singleCategoryUrl, loadMenuItemsHandler);
    };

    //loadmenuitems handler
        //convert string to json
        //fetch title html
        //fetch content html
        //create page function
        //insert html
    function loadMenuItemsHandler(response){
        response = response.responseText;
        response = JSON.parse(response);
        $ajaxUtils.sendGetRequest(singleCategoryTitleHtml, function(singleCategoryTitleHtml){
            singleCategoryTitleHtml = singleCategoryTitleHtml.responseText;
            $ajaxUtils.sendGetRequest(singleCategoryHtml, function(singleCategoryHtml){
                singleCategoryHtml = singleCategoryHtml.responseText;
                var singleCategoryViewHtml = createSingleCategoryPageHtml(response, singleCategoryTitleHtml, singleCategoryHtml);
                insertHtml("#main-content", singleCategoryViewHtml);
            }, false);
        }, false);
    }

    //create page function
        //for all items in json
            //create tile and add to html

    function createSingleCategoryPageHtml(items, singleCategoryTitleHtml, singleCategoryHtml){
        var finalHtml = "<section class='row'>";
        var menu_items = items.menu_items;
        var titleHtml = singleCategoryTitleHtml;
        titleHtml = insertProperty(titleHtml, "name", items.category.name);
        titleHtml = insertProperty(titleHtml, "special_instructions", items.category.special_instructions);
        finalHtml += titleHtml;

        for(var i=0;i<menu_items.length; i++){
            var item = menu_items[i];
            var html = singleCategoryHtml;
            html = insertProperty(html, "item_short_name", item.short_name);
            html = insertProperty(html, "short_name", items.category.short_name);
            html = insertProperty(html, "description", item.description);
            html = insertProperty(html, "name", item.name);
            
            if(item.price_large){
                html = insertProperty(html, "price_large", "$" + item.price_large);
            }else{
                html = insertProperty(html, "price_large", "");
            }
            if(item.large_portion_name){
                html = insertProperty(html, "large_portion_name", "(" + item.large_portion_name + ")");
            }else{
                html = insertProperty(html, "large_portion_name", "");
            }
            if(item.price_small){
                html = insertProperty(html, "price_small", "$" + item.price_small);
            }else{
                html = insertProperty(html, "price_small", "");
            }
            if(item.small_portion_name){
                html = insertProperty(html, "small_portion_name", "(" + item.small_portion_name + ")");
            }else{
                html = insertProperty(html, "small_portion_name", "");
            }

            
            finalHtml += html;
        }
        finalHtml += "</section>";
        return finalHtml;
    }

    


    global.$dc = dc;
})(window);