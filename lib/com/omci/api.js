Omc.Utils = new (function(){
	this.getCurrentParams = function(){
		var q, p = window.location.search.substr(1).split("&");
		var s = {};
		for(var x = 0; x < p.length; x++){
			q = p[x].split("=");
			s[q.shift()] = q.join("=");
		}
		return s;
	};
})();



/**
 * API to query OMCI services
 */


Omc.Services = new (function(){



	this.NEAREST = "nearest";
	this.EASIEST = "easiest";
	this.LEVEL = "level";

/*
encodeURIComponent("/venues/search?ll=" + encodeURIComponent("40,30") + ",/specials/search?ll=" + (encodeURIComponent("40,30")))
*/

	this.search = function(cat, venues, lat, lng, success, error){
		var url;
		// XXX AHEM
		if(cat && cat != "undefined")
			url = 'https://api.foursquare.com/v2/venues/search?oauth_token=' + m_oauth + '&v=20110918&ll=' + (lat + "," + lng) + '&categoryId=' + cat;
		else if(venues)
			url = 'https://api.foursquare.com/v2/venues/' + venues + '?oauth_token=' + m_oauth;
		else
			url = 'https://api.foursquare.com/v2/venues/search?oauth_token=' + m_oauth + '&v=20110918&ll=' + (lat + "," + lng) + '&limit=30';

		$.ajax({
			url: url,
			dataType: "jsonp",
			cache: true,
			data: {},
			success: function(data){
				success(data.response);
			},
			error: function(err){
				error();
			}
		});

//		https://api.foursquare.com/v2/venues/search
	};

	this.getOAuth = function(){
		if(!m_ready)
			throw "NOT INITIALIZED";
		return m_oauth;
	};

	this.getUserData = function(sort){
		if(!m_ready)
			throw "NOT INITIALIZED";

		switch(sort){
			case this.EASIEST:
				fastSortBy("more", function(a, b){return a > b;});
			break;
			case this.LEVEL:
				fastSortBy("achievement", function(a, b){return a < b;});
			break;
			case this.NEAREST:
			default:
				fastSortBy("complete", function(a, b){return a < b;});
			break;
		}
		return m_userdata.badges;
	};

	this.getBadges = function(success, error){
		$.ajax({
			url: 'https://api.foursquare.com/v2/users/self/badges?oauth_token=' + m_oauth + '&v=20110918',
			dataType: "jsonp",
			cache: true,
			data: {},
			success: function(data){
				success(data.response);
			},
			error: function(err){
				error();
			}
		});
	};

	this.fetchInfo = function(success, error){
		var url = m_base + m_uid + "/infos?token=" + m_token;
		$.ajax({
				url: url,
				dataType: 'jsonp',
				jsonpCallback: "OmcFetch",
				cache: true,
				data: {},
				success: function (data) {
					if (data.error) 
						error();
					else{
						m_userdata = data;
						success();
					}
				},
				error : function (err) {
					error();
				}
			});
	};

	this.authenticate = function (code, success, error) {
		var url = m_base + "register?code="+code;
		$.ajax({
				url: url,
				dataType: 'jsonp',
				jsonpCallback: "OmcAuthenticate",
				cache: true,
				data: {},
				success: function (data) {
					if (data.error) 
						error();
					else {
						m_token = data.token;
						m_uid = data.uid;
						m_oauth = data.oauth;
						m_ready = true;
						success();
						_gaq.push(['_setVar', m_uid]);
					}
				},
				error : function (err) {
					error();
				}
			});
	};


	this.getUser = function(success, error){
		success(m_userdata.user);
	};

	this.getLastCheckin = function(success, error){
		success(m_userdata.lastCheckin);
	};

	this.getStats = function(success, error){
		success(m_userdata.stats);
	};


	var m_token;
	var m_uid;
	var m_oauth;
	var m_ready = false;
	var m_base = "http://" + Omc.config.api.host + (Omc.config.api.port ? (':' + Omc.config.api.port) : "") + "/1.0/";
	var m_userdata = [];

	// XXXdmp fastsort voodoo - temper at your own perils (and a poney) - or use the native sort instead...
	var fastSortBy = function(prop, cbk){
		var d = m_userdata.badges;
		for (var tmp, max = d.length, ecart = Math.floor(max / 2); ecart > 0; ecart = Math.floor(ecart / 2))
			for (var i = ecart; i < max; i++)
				for (var j = (i - ecart); (j >= 0) && cbk(d[j][prop], d[j + ecart][prop]); j -= ecart)
				{
					tmp = d[j];
					d[j] = d[j + ecart];
					d[j + ecart] = tmp;
				}
	};

});