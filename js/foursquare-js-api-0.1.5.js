/*
The MIT License

Copyright (c) 2011 M.F.A. ten Veldhuis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// make sure we can do XMLHttpRequests
if(!window.XMLHttpRequest && window.ActiveXObject) 
{
	window.XMLHttpRequest = function()
	{
		try 
		{
			return new ActiveXObject("Msxml2.XMLHTTP");
		} 
		catch(e) 
		{
			try 
			{
				return new ActiveXObject("Microsoft.XMLHTTP");
			} 
			catch(e) 
			{
				return false;
			}
		}
	};
} 	

/**
 * @class
 */
FourSquareUtils = 
{
	getCookie: function(toGet)
	{
		var cookies = document.cookie.split(";");
		for(var idx = 0; idx < cookies.length; idx++)
		{
			var cookieName = cookies[idx].substr(0, cookies[idx].indexOf("="));
			var cookieValue = cookies[idx].substr(cookies[idx].indexOf("=") + 1);
			cookieName.replace(/^\s+|\s+$/g, "");

			if(cookieName == toGet)
			{
				return unescape(cookieValue);
			}
  		}
  		
  		return null;
	},
		
	setCookie: function(name, value)
	{
		document.cookie = name + "=" + value;
	},
	
	retrieveAccessToken: function()
	{
		var hash = document.location.hash;
		if(hash.indexOf("#access_token=") != -1)
		{
			FourSquareUtils.setCookie("access_token", hash.replace("#access_token=", ""));
			return hash.replace("#access_token=", "");
		}
		else if(FourSquareUtils.getCookie("access_token") != null)
		{
			return FourSquareUtils.getCookie("access_token");
		}
	
		return null;
	},
	
	parseResponse: function(response)
	{
		try
		{
			return eval("(" + response + ")");
		}
		catch(exception)
		{
			return null;
		}
	},
	
	createQueryString: function(prefix, parameters)
	{
		var query = "";
		for(key in parameters) 
		{
			if(parameters[key] != undefined && parameters[key] != null)
			{
				query += "&" + key + "=" + parameters[key];
			}
		}
		
		if(query.length > 0)
		{
			prefix = (prefix) ? prefix : "";
			query = prefix + query.substring(1);
		}
		
		return query;
	},
	
	doRequest: function(url, requestCallback, method, body)
	{
		var request = new XMLHttpRequest();
	    var method = (method) ? method : "GET";
			    
	    request.open(method, url, true);	    
	    request.onreadystatechange = function(event) 
	    {
	    	if(request.readyState == 4) 
	    	{
	    		if(request.status == 200)
	    		{
	    			if(requestCallback.onSuccess)
	    			{
	    				requestCallback.onSuccess(
	    						FourSquareUtils.parseResponse(request.responseText));
	    			}
	    		}
	    		else
		    	{
		    		if(requestCallback.onFailure)
		    		{
		    			requestCallback.onFailure(
		    					FourSquareUtils.parseResponse(request.responseText));
		    		}
		    	}
	    	}
	    };
	    
	    if(body)
	    {
	    	request.setRequestHeader("Content-Length", body.length);
	    	request.send(body);
	    }
	    else
	    {
	    	request.send();
	    }
	}
};

/**
 * @class
 */
FourSquareClient = function(clientId, clientSecret, redirectUri)
{
	/**
	 * @constant
	 */
	this.AUTHENTICATION_URL = "https://foursquare.com/oauth2/authenticate";
	/**
	 * @constant
	 */
	this.ACCESS_TOKEN_URL = "https://foursquare.com/oauth2/access_token";
	
	this.requestQuery = function()
	{
		if(!this.accessToken)
		{
			return "?client_id=" + this.clientId + "&client_secret=" + this.clientSecret;
		}
		else
		{
			return "?oauth_token=" + this.accessToken;
		}
	};
	
	// required variables
	this.redirectUri = redirectUri;
	this.clientId = clientId;
	this.clientSecret = clientSecret;
	
	this.accessToken = FourSquareUtils.retrieveAccessToken();
	this.authenticate = function()
	{
		var authenticationURL = this.AUTHENTICATION_URL + "?client_id=" + this.clientId; 
		authenticationURL += FourSquareUtils.createQueryString("&",
							 {
							 	 response_type: "token",
								 redirect_uri: this.redirectUri
							 });
		
		window.open(authenticationURL);
	};
	
	//=================================================
	// The separate clients for each type of endpoint.
	//=================================================

	// create client to access;
	var client = this;
	
	this.usersClient = 
	{
		/**
		 * 	@constant
		 */
		USERS_URL: "https://api.foursquare.com/v2/users/{user_id}",	
		/**
		 * 	@constant
		 */
		SEARCH_URL: "https://api.foursquare.com/v2/users/search",
		/**
		 * 	@constant
		 */
		REQUESTS_URL: "https://api.foursquare.com/v2/users/requests",	
		/**
		 * 	@constant
		 */
		BADGES_URL: "https://api.foursquare.com/v2/users/{user_id}/badges",
		/**
		 * 	@constant
		 */
		CHECKINS_URL: "https://api.foursquare.com/v2/users/{user_id}/checkins",
		/**
		 * 	@constant
		 */
		FRIENDS_URL: "https://api.foursquare.com/v2/users/{user_id}/friends",
		/**
		 * 	@constant
		 */
		TIPS_URL: "https://api.foursquare.com/v2/users/{user_id}/tips",
		/**
		 * 	@constant
		 */
		TODOS_URL: "https://api.foursquare.com/v2/users/{user_id}/todos",
		/**
		 * 	@constant
		 */
		VENUE_HISTORY_URL: "https://api.foursquare.com/v2/users/{user_id}/venuehistory",	
		/**
		 * 	@constant
		 */
		REQUEST_URL: "https://api.foursquare.com/v2/users/{user_id}/request",
		/**
		 * 	@constant
		 */
		UNFRIEND_URL: "https://api.foursquare.com/v2/users/{user_id}/unfriend",
		/**
		 * 	@constant
		 */
		APPROVE_URL: "https://api.foursquare.com/v2/users/{user_id}/approve",
		/**
		 * 	@constant
		 */
		DENY_URL: "https://api.foursquare.com/v2/users/{user_id}/deny",
		/**
		 * 	@constant
		 */
		SET_PINGS_URL: "https://api.foursquare.com/v2/users/{user_id}/setpings",
			
		users: function(requestCallback, userId)
		{
			var requestUrl = this.USERS_URL.replace("{user_id}", userId) + client.requestQuery();
		
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},	
		
		search: function(requestCallback, phone, email, twitter, twitterSource, fbid, name)
		{
			var requestUrl = this.SEARCH_URL + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									phone: phone,
									email: email,
									twitter: twitter,
									twitterSource: twitterSource,
									fbid: fbid,
									name: name
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		requests: function(requestCallback)
		{
			var requestUrl = this.REQUESTS_URL + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		badges: function(requestCallback, userId, sets, badges)
		{
			var requestUrl = this.BADGES_URL.replace("{user_id}", userId) + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									sets: sets,
									badges: badges
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		checkins: function(requestCallback, userId, limit, offset, afterTimestamp, beforeTimestamp)
		{
			var requestUrl = this.CHECKINS_URL.replace("{user_id}", userId) + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									limit: limit,
									offset: limit,
									afterTimestamp: afterTimestamp,
									beforeTimestamp: beforeTimestamp
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		friends: function(requestCallback, userId, limit, offset)
		{
			var requestUrl = this.FRIENDS_URL.replace("{user_id}", userId) + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									limit: limit,
									offset: offset
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		tips: function(requestCallback, userId, sort, latitude, longitude, limit, offset)
		{
			var requestUrl = this.TIPS_URL.replace("{user_id}", userId) + client.requestQuery();			
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									sort: sort,
									ll: (latitude && longitude) ? latitude + "," + longitude : null,
									limit: limit,
									offset: offset
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		todos: function(requestCallback, userId, sort, latitude, longitude)
		{
			var requestUrl = this.TODOS_URL.replace("{user_id}", userId) + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									sort: sort,
									ll: (latitude && longitude) ? latitude + "," + longitude : null,
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		venuehistory: function(requestCallback, userId, afterTimestamp, beforeTimestamp)
		{
			var requestUrl = this.VENUE_HISTORY_URL.replace("{user_id}", userId) + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									afterTimestamp: afterTimestamp,
									beforeTimestamp: beforeTimestamp
								});

			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},	
		
		request: function(requestCallback, userId)
		{
			var requestUrl = this.REQUEST_URL.replace("{user_id}", userId) + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		},
		
		unfriend: function(requestCallback, userId)
		{
			var requestUrl = this.UNFRIEND_URL.replace("{user_id}", userId) + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		},
		
		approve: function(requestCallback, userId)
		{
			var requestUrl = this.APPROVE_URL.replace("{user_id}", userId) + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		},
		
		deny: function(requestCallback, userId)
		{
			var requestUrl = this.DENY_URL.replace("{user_id}", userId) + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		},
		
		setpings: function(requestCallback, userId, value)
		{
			var requestUrl = this.DENY_URL.replace("{user_id}", userId) + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									value: value
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		}
	};	
	
	this.venuesClient = 
	{
		/**
		 * @constant
		 */	
		VENUES_URL: "https://api.foursquare.com/v2/venues/{venue_id}",
		/**
		 * @constant
		 */
		ADD_URL: "https://api.foursquare.com/v2/venues/add",
		/**
		 * @constant
		 */
		CATEGORIES_URL: "https://api.foursquare.com/v2/venues/categories",
		/**
		 * @constant
		 */
		SEARCH_URL: "https://api.foursquare.com/v2/venues/search",
		/**
		 * @constant
		 */
		TRENDING_URL: "https://api.foursquare.com/v2/venues/trending",
		/**
		 * @constant
		 */
		HERENOW_URL: "https://api.foursquare.com/v2/venues/{venue_id}/herenow",
		/**
		 * @constant
		 */
		TIPS_URL: "https://api.foursquare.com/v2/venues/{venue_id}/tips",
		/**
		 * @constant
		 */
		PHOTOS_URL: "https://api.foursquare.com/v2/venues/{venue_id}/photos",
		/**
		 * @constant
		 */
		LINKS_URL: "https://api.foursquare.com/v2/venues/{venue_id}/links",
		/**
		 * @constant
		 */
		MARK_TODO_URL: "https://api.foursquare.com/v2/venues/{venue_id}/marktodo",
		/**
		 * @constant
		 */
		FLAG_URL: "https://api.foursquare.com/v2/venues/{venue_id}/flag",
		/**
		 * @constant
		 */
		PROPOSE_EDIT_URL: "https://api.foursquare.com/v2/venues/{venue_id}/proposeedit",
		
		venues: function(requestCallback, venueId)
		{
			var requestUrl = this.VENUES_URL.replace("{venue_id}", venueId) + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		add: function(requestCallback, name, address, crossStreet, city, state, zip, phone, latitude, longitude, primaryCategoryId)
		{
			var requestUrl = this.ADD_URL + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									name: name,
									address: address,
									crossStreet: crossStreet,
									city: city,
									state: state,
									zip: zip,
									phone: phone, 
									ll: (latitude && longitude) ? latitude + "," + longitude : null,
									primaryCategoryId: primaryCategoryId
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		},
		
		categories: function(requestCallback)
		{
			var requestUrl = this.CATEGORIES_URL + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		search: function(requestCallback, latitude, longitude, accuracy, altitude, altitudeAccuracy, query, limit, intent, categoryId, url, providerId, linkedId)
		{
			var requestUrl = this.SEARCH_URL + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									ll: (latitude && longitude) ? latitude + "," + longitude : null,
									accuracy: accuracy,
									altitude: altitude,
									altitudeAccuracy: altitudeAccuracy,
									query: query,
									limit: limit,
									intent: intent,
									categoryId: categoryId,
									url: url, 
									providerId: providerId,
									linkedId: linkedId
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		trending: function(requestCallback, venueId, latitude, longitude, limit,  radius)
		{
			var requestUrl = this.TRENDING_URL + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									ll:  latitude + "," + longitude,
									limit: limit,
									radius: radius
								});
						
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		herenow: function(requestCallback, venueId, limit, offset, afterTimestamp)
		{
			var requestUrl = this.HERENOW_URL.replace("{venue_id}", venueId) + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									limit: limit,
									radius: radius,
									afterTimestamp: afterTimestamp
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},

		tips: function(requestCallback, venueId, sort, limit, offset)
		{
			var requestUrl = this.TIPS_URL.replace("{venue_id}", venueId) + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									sort: sort,
									limit: limit,
									offset: offset
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		photos: function(requestCallback, venueId, group, limit, offset)
		{
			var requestUrl = this.PHOTOS_URL.replace("{venue_id}", venueId) + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									group: group,
									limit: limit,
									offset: offset
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		links: function(requestCallback, venueId)
		{
			var requestUrl = this.LINKS_URL.replace("{venue_id}", venueId) + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
	
		marktodo: function(requestCallback, venueId, text)
		{
			var requestUrl = this.MARK_TODO_URL.replace("{venue_id}", venueId) + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									text: text
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		},
		
		flag: function(requestCallback, venueId, problem)
		{
			var requestUrl = this.FLAG_URL.replace("{venue_id}", venueId) + client.requestQuery() + "&problem=" + problem;
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		},
		
		proposeedit: function(requestCallback, venueId, name, address, crossStreet, city, state, zip, phone, latitude, longitude, primaryCategoryId)
		{
			var requestUrl = this.PROPOSE_EDIT_URL.replace("{venue_id}", venueId) + client.requestQuery();
			requestUrl += (name) ? "&name=" + name : "";
			requestUrl += (address) ? "&address=" + address : "";
			requestUrl += (crossStreet) ? "&crossStreet=" + crossStreet : "";
			requestUrl += (city) ? "&city=" + city : "";
			requestUrl += (state) ? "&state=" + state : "";
			requestUrl += (zip) ? "&zip=" + zip : "";
			requestUrl += (phone) ? "&phone=" + phone : "";
			requestUrl += (latitude && longitude) ? "&ll=" + latitude + "," + longitude : "";
			requestUrl += (primaryCategoryId) ? "&primaryCategoryId=" + primaryCategoryId : "";
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		}
	};
	
	this.checkinsClient = 
	{
		/**
		 * 	@constant
		 */
		CHECKINS_URL: "https://api.foursquare.com/v2/checkins/{checkin_id}",
		/**
		 *	@constant
		 */
		ADD_URL: "https://api.foursquare.com/v2/checkins/add",
		/**
		 *	@constant
		 */
		RECENT_URL: "https://api.foursquare.com/v2/checkins/recent",
		/**
		 *	@constant
		 */
		ADD_COMMENT_URL: "https://api.foursquare.com/v2/checkins/{checkin_id}/addcomment",
		/**
		 *	@constant
		 */
		DELETE_COMMENT_URL: "https://api.foursquare.com/v2/checkins/{checkin_id}/deletecomment",
			
		checkins: function(requestCallback, checkinId, signature)
		{
			var requestUrl = this.CHECKINS_URL.replace("{checkin_id}", checkinId) + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									signature: signature
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		add: function(requestCallback, venueId, venue, shout, broadcast, latitude, longitude, accuracy, altitude, altitudeAccuracy)
		{
			var requestUrl = this.ADD_URL + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									venueId: venueId,
									venue: venue,
									shout: shout,
									accuracy: accuracy,
									broadcast: broadcast,
									ll: (latitude && longitude) ? latitude + "," + longitude : null,
									llAcc: accuracy,
									alt: altitude,
									altAcc: altitudeAccuracy
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		},
		
		recent: function(requestCallback, latitude, longitude, limit, afterTimestamp)
		{
			var requestUrl = this.RECENT_URL + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									ll: (latitude && longitude) ? latitude + "," + longitude : null,
									limit: limit,
									afterTimestamp: afterTimestamp
								});

			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		addcomment: function(requestCallback, checkinId)
		{
			var requestUrl = this.ADD_COMMENT_URL.replace("{checkin_id}", checkinId) + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		},
			
		deletecomment: function(requestCallback, checkinId)
		{
			var requestUrl = this.DELETE_COMMENT_URL.replace("{checkin_id}", checkinId) + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		}
	};
	
	this.tipsClient = 
	{
		/**
		 * @constant
		 */
		TIPS_URL: "https://api.foursquare.com/v2/tips/TIP_ID",
		/**
		 * @constant
		 */
		ADD_URL: "https://api.foursquare.com/v2/tips/add",
		/**
		 * @constant
		 */
		SEARCH_URL: "https://api.foursquare.com/v2/tips/search",
		/**
		 * @constant
		 */
		MARK_TODO_URL: "https://api.foursquare.com/v2/tips/{tip_id}/marktodo",
		/**
		 * @constant
		 */
		MARK_DONE_URL: "https://api.foursquare.com/v2/tips/{tip_id}/markdone",
		/**
		 * @constant
		 */
		UNMARK_URL: "https://api.foursquare.com/v2/tips/{tip_id}/unmark",
	
		tips: function(requestCallback, tipId)
		{
			var requestUrl = this.PHOTOS_URL.replace("{tip_id}", tipId) + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		add: function(requestCallback, venueId, text, url)
		{
			var requestUrl = this.ADD_URL + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									venueId: venueId,
									text: text,
									url: url
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		},
		
		search: function(requestCallback, latitude, longitude, limit, offset, filter, query)
		{
			var requestUrl = this.SEARCH_URL + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									ll: (latitude && longitude) ? latitude + "," + longitude : null,
									limit: limit,
									offset: offset,
									filter: filter,
									query: query
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		marktodo: function(requestCallback, tipId)
		{
			var requestUrl = this.MARK_TODO_URL.replace("{tip_id}", tipId) + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		},
		
		markdone: function(requestCallback, tipId)
		{
			var requestUrl = this.MARK_DONE_URL.replace("{tip_id}", tipId) + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		},
		
		unmark: function(requestCallback, tipId)
		{
			var requestUrl = this.UNMARK_URL.replace("{tip_id}", tipId) + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
		}
	};
	
	this.photosClient = 
	{
		/**
		 * @constant
		 */	
		PHOTOS_URL: "https://api.foursquare.com/v2/photos/{photo_id}",
		/**
		 * @constant
		 */
		ADD_URL: "https://api.foursquare.com/v2/photos/add",
		
		photos: function(requestCallback, photoId)
		{
			var requestUrl = this.PHOTOS_URL.replace("{photo_id}", photoId) + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		add: function(requestCallback, bytes, checkinId, tipId, venueId, broadcast, latitude, longitude, accuracy, altitude, altitudeAccuracy)
		{
			var requestUrl = this.ADD_URL + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									checkinId: checkinId,
									tipId: tipId,
									venueId: venueId,
									broadcast: broadcast,
									ll: (latitude && longitude) ? latitude + "," + longitude : null,
									llAcc: accuracy,
									alt: altitude,
									altAcc: altitudeAccuracy
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback, "POST", bytes);
		}
	};
	
	this.settingsClient = 
	{
		/**
		 * @static
		 */	
		SETTING_URL: "https://api.foursquare.com/v2/settings/{setting_id}",
		/**
		 * @static
		 */
		SET_URL: "https://api.foursquare.com/v2/settings/{setting_id}/set",
		
		// sendToTwitter, sendToFacebook, receivePings, receiveCommentPings.
		settings: function(requestCallback, settingId)
		{
			var settingParam = (settingId) ? settingId : "all";
			var requestUrl = this.SETTING_URL.replace("{setting_id}", settingId) + client.requestQuery();
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		set: function(requestCallback, settingId, value)
		{
			if(value.toString() == "0" || value.toString() == "1")
			{
				var settingParam = (settingId) ? settingId : "all";
				var requestUrl = this.SET_URL.replace("{setting_id}", settingId) + client.requestQuery() + "&value=" + value;
			
				FourSquareUtils.doRequest(requestUrl, requestCallback, "POST");
			}
			else
			{
				console.error("Setting has to be '0' or '1'");
			}
		}
	};
	
	/**
	 * @class
	 */
	this.specialsClient = 
	{
		/**
		 * @static
		 */	
		SPECIAL_URL: "https://api.foursquare.com/v2/specials/{special_id}",
		/**
		 * @static
		 */
		SEARCH_URL: "https://api.foursquare.com/v2/specials/search",
	
		special: function(requestCallback, venueId, specialId)
		{
			var requestUrl = this.SPECIAL_URL.replace("{special_id}", specialId) + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									venueId: venueId
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		},
		
		search: function(requestCallback, latitude, longitude, accuracy, altitude, altitudeAccuracy, limit)
		{
			var requestUrl = this.SEARCH_URL + client.requestQuery();
			requestUrl += FourSquareUtils.createQueryString("&",
								{
									ll: latitude + "," + longitude,
									llAcc: accuracy,
									alt: altitude,
									altAcc: altitudeAccuracy,
									limit: limit
								});
			
			FourSquareUtils.doRequest(requestUrl, requestCallback);
		}
	};
};