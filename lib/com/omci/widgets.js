Omc.App = new (function(){
	this.boot = function(){
		// Straight form foursquare
		Omc.Widgets.userBadges.boot();
		$("#header").removeClass("chuipasla");
		$("#content").removeClass("chuipasla");
		$("#prompt-content").addClass("chuipasla");
		$("#footer").removeClass("chuipasla");
		// The rest comes from cause we have to consume it server either ways
		Omc.Services.fetchInfo(success, error);
	};

	this.setup = function(){
		// Add the sniffy effect
		$('.btn_4qs > a').get(0).href = "https://foursquare.com/oauth2/authenticate?client_id="+Omc.config.client+"&response_type=code&redirect_uri="+Omc.config.callback
		$('.btn_4qs > a').hover(function(){
			$(this).stop().animate({'opacity' : '0'}, 500);  
		}, function(){
			$(this).stop().animate({'opacity' : '1'}, 500);
		});

		$('#user-disconnect').click(function(){
			$.cookie("token", null);
			Omc.Widgets.userBadges.destroy();
			Omc.Widgets.userInfos.destroy();
			Omc.Widgets.badger.destroy();

			// Otherwise, prompt for logon
			Omc.App.prompt();
		});
	};

	this.prompt = function(){
		$("#header").addClass("chuipasla");
		$("#content").addClass("chuipasla");
		$("#prompt-content").removeClass("chuipasla");
		$("#footer").removeClass("chuipasla");
	};

	var success = function(){
		// Got it? Boot it!
		console.log("Logged");
		Omc.Widgets.userInfos.boot();
		Omc.Widgets.badger.boot();
		// Clear the loader
		Omc.Widgets.loader.destroy();
	};

	var error = function(){
		console.log("errrrrrrr");
		Omc.Widgets.error.boot();
	};

})();


Omc.HAX = {};

Omc.Widgets = new (function(){

	this.loader = new (function(){
		this.boot = function(){
			$('#loader-widget').show();
			window.scrollTo(0, 0);
			$("body").addClass("top-widgetted");
		};

		this.destroy = function(){
			$('#loader-widget').hide();
			$("body").removeClass("top-widgetted");
		};
	});
	

	this.error = new (function(){
		this.boot = function(info){
			$('#loader-widget').hide();
			$('#error-widget').show();
			window.scrollTo(0, 0);
			$("body").addClass("top-widgetted");
			console.log(info);
		};

		this.destroy = function(){
			$('#error-widget').show();
			$("body").removeClass("top-widgetted");
		};
	});

	this.userInfos = new (function() {
		this.boot = function() { 
			Omc.Services.getUser(
				function(data){
					$('#user-infos-name').text(data.firstName + ' ' + data.lastName);
					$('#user-infos-avatar').attr("src", data.avatar);
					$('#user-infos-gender').text(data.gender);
				},

				function(){
					Omc.Widgets.error.boot("Couldn't fetch basic user infos!");
				}
			);

			Omc.Services.getLastCheckin(
				function(data){
					var description = "<ul><li>Here now: " + data.hereNow + "</li>"
					 + "<li>You're the mayor? " + (data.isMayor ? "yes" : "no") + "</li>"
					 + "<li>Total checkins: " + data.checkins + "</li></ul>";

					Omc.HAX.lat = data.location.lat;
					Omc.HAX.lng = data.location.lng;
					Omc.map.init(data.name, data.location.lat, data.location.lng, data.icon, 4, description);

					console.log("wooohoooo");
					console.log(data);

					var d = new Date();
					d.setTime(data.createdAt*1000);
					// A shitload more is avalaible
					var last = (data.name) + (("city" in data.location) ? (', ' + data.location.city) : "") + ' - ' + d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate();
					$('#user-infos-lastcheck').text(last);
				},

				function(){
					Omc.Widgets.error.boot("Couldn't fetch basic user infos!");
				}
			);

			Omc.Services.getStats(
				function(data){
					$('#user-infos-countcheck').text(data.checkins);
					$('#user-infos-countbadges').text(data.badges);
					$('#user-infos-mayor').text(data.mayorships);

					$('#user-infos-currentscore').text(data.currentScore);
					$('#user-infos-bestscore').text(data.bestScore);
					$('#user-infos-counttips').text(data.tips);
					$('#user-infos-todo').text(data.todos);
					$('#user-infos-friends').text(data.friends);
				},
				function(){
					Omc.Widgets.error.boot("Couldn't fetch basic user infos!");
				}
			);
		};

		this.destroy = function(){
			$('#user-infos-name').empty();
			$('#user-infos-avatar').empty();
			$('#user-infos-gender').empty();
			$('#user-infos-lastcheck').empty();

			$('#user-infos-countcheck').empty();
			$('#user-infos-countbadges').empty();
			$('#user-infos-mayor').empty();

			$('#user-infos-currentscore').empty();
			$('#user-infos-bestscore').empty();
			$('#user-infos-counttips').empty();
			$('#user-infos-todo').empty();
			$('#user-infos-friends').empty();
		};
	})();

	this.userBadges = new (function() {
		this.boot = function() { 
			Omc.Services.getBadges(
				function(data){
					var badges = [], b;
					for (var key in data.badges) {
						b = data.badges[key];
						if(b.unlocks.length && b.unlocks[0].checkins.length){
							badges.push({date: b.unlocks[0].checkins[0].createdAt, name: b.name, image: b.image.name});
						}
					}
					badges.sort(function (a,b){ return (a.date < b.date) ? 1 : ((a.date > b.date) ? -1 : 0);} );
					for(var x = 0; x < Math.min(badges.length, 3); x++)
						$('<li><img width="17" height="17" src="https://playfoursquare.s3.amazonaws.com/badge/57' + badges[x]["image"] + '"/> <span>'
								+ badges[x]["name"] + '</span></li>').appendTo('#user-infos-badges'); 

					for(x = badges.length; x < 3; x++)
						$('<li></li>').appendTo('#user-infos-badges'); 
				},
				function(){
					Omc.Widgets.error.boot("Couldn't fetch user badges!");
				}
			);
		};

		this.destroy = function(){
			$("#user-infos-badges").empty();
		};
	})();


	this.badger = new (function(){

		this.boot = function(){

			$('#navigation > li > a').click(function(event){
				console.log('They clicked me !');
				event.preventDefault();
				$('#navigation > li').removeClass('active');
				$(this).parent().addClass('active');

				$(this).parent().find('ul > li').removeClass('active');
				
				defaultItem = $(this).parent().find('ul > li:first-child');
				defaultItem.addClass('active');
				defaultItem.find('a').click();
			});

			$('#navigation > li > ul > li > a').click(function(event){
				event.preventDefault();
				$(this).parent().parent().find('li').removeClass('active');
				$(this).parent().addClass('active');

				filter = $(this).parent().parent().parent().attr('id').replace('filter_', '');
				_gaq.push(['_trackEvent', 'filter', filter, filter + '.' + $(this).parent().attr('rel') , 1]);
				BadgeList.reset();
				BadgeList.init();
				BadgeList.setBackend(Omc.Services.getUserData($(this).parent().attr('rel')), filter, $(this).parent().attr('rel') == "level" ? true : false);
				BadgeList.render();

				$('#pagination #previous').removeClass('active');

				if(!BadgeList.isEnding())
					$('#pagination #next').addClass('active');
				else
					$('#pagination #next').removeClass('active');

			});

			$('#pagination #previous').click(function (){
				if(!BadgeList.isStarting()){
					BadgeList.reset();
					BadgeList.render('next');
					if(BadgeList.isStarting())
						$('#pagination #previous').removeClass('active');
					if(!BadgeList.isEnding())
						$('#pagination #next').addClass('active');
				}
			});
				 
			$('#pagination #next').click(function () {
				if(!BadgeList.isEnding()){
					BadgeList.reset();
					BadgeList.render('prev');
					if(BadgeList.isEnding())
						$('#pagination #next').removeClass('active');
					if(!BadgeList.isStarting())
						$('#pagination #previous').addClass('active');
				}
			});


			$('#navigation > li:first-child > a').click();

			if(!BadgeList.isStarting())
				$('#pagination #previous').addClass('active');
			if(!BadgeList.isEnding())
				$('#pagination #next').addClass('active');

		};

		this.destroy = function(){
			BadgeList.reset();
		};

	})();

	// Gutting in progress!!! 
	this.mapper = function(cat, venues, name){
		var success = function(data){
//			console.log(data.venue);
			if("venues" in data)
				Omc.map.pushingTheEnvelope(data.venues);
			else if("venue" in data)
				Omc.map.pushingTheEnvelope([data.venue]);
			else
				Omc.map.killTheCrap();
		};

		var error = function(){
			console.log("errrrrrr");
		};

		_gaq.push(['_trackEvent', 'map', name, name , 1]);

		Omc.Services.search(cat, venues, Omc.HAX.lat, Omc.HAX.lng, success, error);

// -> in badge -> cat [4bf58dd8d48988d1e2941735] -> search on categories
// -> 
// venues -> century club -> [ids]
	};


	/*
	 * Private badge list helper from Manûß that I don't want to trash
	 */
	var BadgeList = new (function () {
		 var cnt = 0;
		 
		 var start = 0;
		 var limit = 5;
		 
		 var __backend = [];
		 
		 this.setBackend = function (backend, filter, aliasAchievement) {

			 __backend = [];

			 if (!aliasAchievement)
		 	    aliasAchievement = false;

			 if (!filter)
			 	filter = "all";

			 
			 if (filter == "all") {
			 	__backend = backend;
			 	return;
			 }

			 var currentObj;

			 for (var i =0; i < backend.length; i ++) {
			 	
			 	if (backend[i].type == filter) {
			 		
			 		//copy and insert
			 		index = __backend.push($.extend(true, {}, backend[i]));
			 		index --;

			 		currentObj = __backend[index];

			 		if (aliasAchievement) {
			 			currentObj.complete = currentObj.achievement;
			 		}

			 		if (currentObj.type == 'expertise' && currentObj.level > 0) {
			 			currentObj.longDesc = 'Visit '+currentObj.more+' new places to hit Level '+(currentObj.level + 1)+'. '+currentObj.details; 
			 		}
			 	}
			 }

		 };
		 
		 this.init = function () {
				start = 0;
				limit = 5;
		 };
		 
		 this.render = function (type) {
			if (type == "prev") {
				start += limit;
			} else if (type == "next") {
				start = start - limit;
			}
			cnt = 0;
			for (var i = start; i < (start+limit); i++) {
				this.add(__backend[i]);
			}
					
		};
		 
		this.isStarting = function(){
			return !start;
		};

		this.isEnding = function(){
			return (start+limit) >= __backend.length;
		};

		this.reset = function(){
			$("#list_badges").empty();
		};
		 
		this.add = function (obj) {
			 if (!obj)
				return;
			cnt ++;
			var imgPath = "https://playfoursquare.s3.amazonaws.com/badge/57"+obj.img;
			 
			if (!obj.icon)
				obj.icon = "img/all_cat.png";
				
			var onc = "Omc.Widgets.mapper('" + obj.cat.pop() + "', '" + (obj.venues ? obj.venues.pop() : '') + "', '"+obj.name.replace("'", "\\'", +"');";
			onc += "$('.box_badge').removeClass('box_badge_active');$(this).addClass('box_badge_active');";

			var desc = '';
			if (obj.longDesc)
				desc = obj.longDesc;
			else
				desc = 'Need '+obj.more+' more check-in. '+obj.details; 

			$("#list_badges").append('<li onclick="' + onc + '" class="box_badge" id="id_box_badge'+cnt+'"><div class="img_badge"><img src="'+
				imgPath+'" /></div> <div class="infos_badges"> <p class="titre_badge">'+obj.name+'</p> <div class="cat_badge"><img src="'+
				obj.icon+'"/></div> <p class="description_badge">'+desc+'</p> </div><div class="pourcent_badge"><script>$(document).ready(function() {$("#progressbar'+
				cnt+'").addClass("ui-progressbar"); $("#progressbar'+
				cnt+'").append("<div class=\'ui-progressbar-value\' style=\'width: ' + (obj.complete == 0 ? 5 : obj.complete)  + '%\'></div>");\
				 });</script> <div class="pastille"><p class="txt_pastille" style="">'+obj.complete+'%</p></div> <div id="progressbar'+
				cnt+'"></div></div></li>');
				// css( propertyName, value  )
		}; // progressbar({ value: '+(obj.complete == 0 ? 5 : obj.complete)+' })
	})();

});


