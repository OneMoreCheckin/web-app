Omc.App = new (function(){
	this.boot = function(){
		// Straight form foursquare
		Omc.Widgets.userBadges.boot();
		$("#header").removeClass("chuipasla");
		$("#content").removeClass("chuipasla");
		$("#footer").removeClass("chuipasla");
		// The rest comes from cause we have to consume it server either ways
		Omc.Services.fetchInfo(success, error);
	};

	this.setup = function(){
		// Add the sniffy effect
		$('.btn_4qs > a').get(0).href = "https://foursquare.com/oauth2/authenticate?client_id="+Omc.config.client+"&response_type=code&redirect_uri="+Omc.config.callback+"/"
		$('.btn_4qs > a').hover(function(){
			$(this).stop().animate({'opacity' : '0'}, 500);  
		}, function(){
			$(this).stop().animate({'opacity' : '1'}, 500);
		});
	};

	this.prompt = function(){
		$("#prompt-content").removeClass("chuipasla");
		$("#footer").removeClass("chuipasla");
		// XXX display the "main" page
		console.log("need prompting!");
	};

	var success = function(){
		// Got it? Boot it!
		Omc.Widgets.userInfos.boot();
		Omc.Widgets.badger.boot();
		// Clear the loader
		Omc.Widgets.loader.destroy();
	};

	var error = function(){
		Omc.Widgets.error.boot();
	};

})();


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
			
			$('#btn_near').click(function(){
				$('#btn_near').addClass('active');
				$('#btn_easy').removeClass('active');
				BadgeList.reset();
				BadgeList.init();
				BadgeList.setBackend(Omc.Services.getUserData(Omc.Services.NEAREST));
				BadgeList.render();

				$('#pagination #previous').removeClass('active');

				if(!BadgeList.isEnding())
					$('#pagination #next').addClass('active');
				else
					$('#pagination #next').removeClass('active');

			});
			
			$('#btn_easy').click(function(){
				$('#btn_easy').addClass('active');
				$('#btn_near').removeClass('active');
				BadgeList.reset();
				BadgeList.init();
				BadgeList.setBackend(Omc.Services.getUserData(Omc.Services.EASIEST));
				BadgeList.render();

				$('#pagination #previous').removeClass('active');

				if(!BadgeList.isEnding())
					$('#pagination #next').addClass('active');
				else
					$('#pagination #next').removeClass('active');
			});


			$('#btn_near').click();

			if(!BadgeList.isStarting())
				$('#pagination #previous').addClass('active');
			if(!BadgeList.isEnding())
				$('#pagination #next').addClass('active');

		};

		this.destroy = function(){
			BadgeList.reset();
		};

	})();


	/*
	 * Private badge list helper from Manûß that I don't want to trash
	 */
	var BadgeList = new (function () {
		 var cnt = 0;
		 
		 var start = 0;
		 var limit = 5;
		 
		 var __backend = [];
		 
		 this.setBackend = function (backend) {
			 __backend = backend;
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
			for (var i = start; i < (start+limit); i++)
				this.add(__backend[i]);
					
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
				
			$("#list_badges").append('<li class="box_badge" id="id_box_badge'+cnt+'"> <div class="img_badge"><img src="'+
				imgPath+'" /></div> <div class="infos_badges"> <p class="titre_badge"><a href="#">'+obj.name+'</a></p> <div class="cat_badge"><img src="'+
				obj.icon+'"/></div> <p class="description_badge">Need '+obj.more+' more check-in. '+obj.details+
				' </p> <!--<p class="findit_badge"><a href="">Find it now!</a> <span class="txt_hurry"></span></p> --></div><div class="pourcent_badge"><script>$(document).ready(function() {$("#progressbar'+
				cnt+'").progressbar({ value: '+(obj.complete == 0 ? 5 : obj.complete)+' });});</script> <div class="pastille"><p class="txt_pastille" style="">'+obj.complete+'%</p></div> <div id="progressbar'+
				cnt+'"></div></div></li>');
		}; 
	})();

});


