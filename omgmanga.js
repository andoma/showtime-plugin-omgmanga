/**
 * OMG Manga plugin for showtime version 0.1  by NP
 *
 *  Copyright (C) 2011 NP
 
 * 
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

//TODO : Clean up

(function(plugin) {


//settings 

  var service =
    plugin.createService("OMG Manga", "omgmanga:start", "tv", true,
			   plugin.path + "omg.jpg");
  
  var settings = plugin.createSettings("OMG Manga",
					  plugin.path + "omg.jpg",
					 "OMG Manga Reader");

  settings.createInfo("info",
			     plugin.path + "omg.jpg",
			     "OMG Manga Reader \n"+
			     "Copyrighted Limited www.OmgManga.com - Some Rights Reserved.\n"+
				 "Plugin developed by NP \n");



function startPage(page) {      	

   page.type = "directory";
   page.metadata.title = "OMG Manga: " + "Latest Chapters";
   page.metadata.logo = plugin.path + "omg.jpg";


   var site = showtime.httpGet("http://www.omgmanga.com/").toString();
   var popular = site;
   site = site.slice(site.indexOf("Latest Chapters"), site.indexOf('<div class="contentbox_down">'));
   var split = site.split('<div class="contentbox_item_series">');
   
   for each (var manga in split){
	   if(manga.match('<a href=".*" title') != null){
		   var url = manga.match('<a href=".*" title').toString();
		   manga = manga.replace(url,'');
		   url = url.replace('<a href="http://','').replace('" title','');
		   
		   page.appendItem("omgmanga:present:" + url + ":" + manga.match('<a href=".*" title').toString().replace('<a href="http://','').replace('" title',''), "directory", {
			title: manga.match('title=".*">').toString().replace('title="','').replace('">','')
			});
		}	   
	   }
	  		
   //popular 
   popular = popular.slice(popular.indexOf("Popular Manga"), popular.indexOf('Affiliates'));
   split = popular.split('<div class="sidebarbox_mid_separated_down"></div>');
   for each (var manga in split){
	   if(manga.match('<img src=".*"') != null){
		   var img = manga.match('<img src=".*" />').toString().replace('<img src="','').replace('" />','');
		   url = manga.slice(manga.indexOf('<p><a href="')+12, manga.indexOf('">',manga.indexOf('<p><a href="')));
		   var link = manga.slice(manga.indexOf('<spam><a href="')+15, manga.indexOf('">',manga.indexOf('<spam><a href="')));
		   
		   page.appendItem("omgmanga:present:" + url.replace('http://','') + ":" + link.replace('http://',''), "directory", {
			title: manga.slice(manga.indexOf('">',manga.indexOf('<p><a href="'))+2, manga.indexOf('</a></p>')),
			icon: img
			});
		}	   
	   }

   page.appendItem("omgmanga:more", "directory", {
			title: "More"
			});
			
   page.loading = false;
   

  }


plugin.addURI("omgmanga:more", function(page) { 
  page.type = "directory";
  page.metadata.title = "OMG Manga: " + "More";
  page.metadata.logo = plugin.path + "omg.jpg";
  
  var list = ["#","A","B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", 
			  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  
  for each (var letter in list) {
		page.appendItem('omgmanga:more:'+ letter, "directory", { title:  letter});
		}
  
  page.loading = false;
     
});


plugin.addURI("omgmanga:more:(.*)", function(page, letter) {
   
  page.type = "directory";
  page.metadata.title = "OMG Manga: " + "Mangas starting with " + letter.replace(/\//g, ' ').toUpperCase();
  page.metadata.logo = plugin.path + "omg.jpg";
   
  if(letter != "#" && letter.length == 1)
	letter = letter.toLowerCase();
  var site = showtime.httpGet("http://www.omgmanga.com/directory/" + letter).toString();
  
  site = site.slice(site.indexOf('Series Name'),site.indexOf('<div class="fotter">'));
  
  var split = site.split('</a> on');
   
   for each (var manga in split){
	   if(manga.match('<a href=".*" title') != null){
		   var url = manga.match('<a href=".*" title').toString().replace('" title','');
		   manga = manga.replace(url,'');
		   url = url.replace('<a href="http://','');
		   
		   page.appendItem("omgmanga:present:" + url + ":" + manga.slice(manga.indexOf('<a href="http://')+16,manga.indexOf('"',manga.indexOf('<a href="')+16)), "directory", {
			title: manga.match('title=".*">').toString().replace('title="','').replace('">','')
			});
		}	   
	   }
  var url_next = site.slice(site.lastIndexOf('href="',site.lastIndexOf("Next"))+6, site.lastIndexOf('">Next',site.lastIndexOf("Next"))).replace("/directory/",'');
  if(url_next.length >2 && url_next.length <6)	
	page.appendItem("omgmanga:more:" + url_next, "directory", {
			title: "Next"
			});   
  page.loading = false; 
});



plugin.addURI("omgmanga:present:(.*):(.*)", function(page, link, url) {

   page.metadata.logo = plugin.path + "omg.jpg";
   
   var content = showtime.httpGet("http://"+link).toString();
   content = content.slice(content.indexOf('<div class="main">'), content.indexOf('<div class="contentbox_up">Chapters</div>'));
   
   page.metadata.title = content.slice(content.indexOf('<h2>')+4,content.indexOf('</h2>',content.indexOf('</h2>')));
   content.match('<h2>.*</h2>').toString().replace('<h2>','').replace('</h2>','');  
   page.metadata.icon = content.slice(content.indexOf('<img src="')+10,content.indexOf('" alt',content.indexOf('<img src="')));
   
   page.appendPassiveItem("label", content.slice(content.indexOf('<a href="">')+11,content.indexOf('</a><br><br>',content.indexOf('<a href="">'))).replace(/<a href="">/g,"").replace(/<\/a>/g,""));	
   page.appendPassiveItem("rating", parseFloat(content.slice(content.indexOf('<b>Rating:</b> ')+15,content.indexOf('/5',content.indexOf('<b>Rating:</b> ')))/5));
   
   page.appendPassiveItem("label", content.slice(content.indexOf('<b>Author: </b>')+15,content.indexOf('<br>',content.indexOf('<b>Author: </b>'))), { title: "Author"});
   page.appendPassiveItem("label", content.slice(content.indexOf('<b>Status</b>')+14,content.indexOf('<br>',content.indexOf('<b>Status</b>'))), { title: "Status"});
   
   
   var descrip = content.slice(content.indexOf('<p>Summary</p>'),content.indexOf('</spam>',content.indexOf('<p>Summary</p>'))).replace('<spam>','');
   page.appendPassiveItem("bodytext", new showtime.RichText(descrip));
   
   content = showtime.httpGet("http://"+url).toString();
   url = "http://www.omgmanga.com"+ content.slice(content.indexOf('<img class="manga" src="')+24, content.indexOf('" alt=',content.indexOf('<img class="manga" src="')+24)-8); 
   page.appendAction("navopen", url, true, { title: "Read Last Chapters" });
   
   page.appendAction("navopen", "omgmanga:episodes:"+link, true, { title: "All Chapters" });
   
   page.loading = false;
   page.type = "item";


});

plugin.addURI("omgmanga:episodes:(.*)", function(page, link) {
	
   page.type = "directory";
   page.metadata.logo = plugin.path + "omg.jpg";
   var content = showtime.httpGet("http://"+link).toString();     
   page.metadata.title = "OMG Manga: " + content.slice(content.indexOf('<h2>')+4,content.indexOf('</h2>',content.indexOf('</h2>')));
   content = content.slice(content.indexOf('<div class="contentbox_mid">'), content.indexOf('<div class="contentbox_down"></div>'));
   
   var split = content.split('<div class="contentbox_item_catlist">');
	
   for each (var manga in split){
	   if(manga.match('<a href=".*" title') != null){
		   var url = manga.slice(manga.indexOf('<a href="http://')+16, manga.indexOf('" title')); 
		   url = getUrl(url); //.replace('<a href="http://',''));
		   page.appendItem( url , "directory", {
			title: manga.slice(manga.indexOf('title="')+7, manga.indexOf('">',manga.indexOf('title="')))
			});
		}	   
	   }

   page.loading = false;



});

function getUrl(link) {
   var content = showtime.httpGet("http://"+link).toString();
   content = "http://www.omgmanga.com"+ content.slice(content.indexOf('<img class="manga" src="')+24, content.indexOf('" alt=',content.indexOf('<img class="manga" src="')+24)-8);
   return content;
	
}

	
plugin.addURI("omgmanga:start", startPage);
})(this);
