Omc.map = new (function(){
	var map;	

	this.init = function(name, lat, lng, icon, z, description) {
		//objet contenant des propriétés avec des identificateurs prédéfinis dans Google Maps permettant
		//de définir des options d'affichage de notre carte
		var options = {
			center: new google.maps.LatLng(lat, lng),
			zoom: 14,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			streetViewControl: false
		};
		//constructeur de la carte qui prend en paramêtre le conteneur HTML
		//dans lequel la carte doit s'afficher et les options
		map = new google.maps.Map(document.getElementById("carte"), options);
		this.setMarkers([[name, lat, lng, icon, z, description]], "img/example_cat.png");
	}


	var markersArray = [];

	this.killTheCrap = function(){
		clearCrap();
	};

	var clearCrap = function(){
		for(var x = 0; x < markersArray.length; x++){
			markersArray[x].setMap(null);
		}
		markersArray = [];
	};

	this.pushingTheEnvelope = function(venues) {
		clearCrap();
		var infowindow = new google.maps.InfoWindow();

		var shape = {
			coord: [1, 1, 1, 60, 40, 30, 40 , 1],
			type: 'poly'
		};

		var fond = new google.maps.MarkerImage("img/check_map.png",
			new google.maps.Size(69, 80),
			new google.maps.Point(0,0),
			new google.maps.Point(18, 50)
		);

		for(var x = 0; x < venues.length; x++){
			var venue = venues[x];

			var ii = venue.categories.shift();
			if(ii){
				try{
					ii = ii.icon;
				}catch(e){
					console.log("errrrrrr", venue, venue.categories);
					ii = "img/example_cat.png";
				}
			}else{
				ii = "img/example_cat.png";
			}

			var cat = new google.maps.MarkerImage(
				ii,
			// This marker is 20 pixels wide by 32 pixels tall.
				new google.maps.Size(32, 32),
			// The origin for this image is 0,0.
				new google.maps.Point(0,0),
			// The anchor for this image is the base of the flagpole at 0,32.
				new google.maps.Point(0, 32)
			);

			var myLatLng = new google.maps.LatLng(venue.location.lat, venue.location.lng);
			var description = "<ul><li>Here now: " + venue.hereNow.count + "</li>"
					 + "<li>Total checkins: " + venue.stats.checkinsCount + "</li></ul>";


			var marker = new google.maps.Marker({
				markercount: x,
				position: myLatLng,
				map: map,
				shadow: fond,
				icon: cat,
				shape: shape,
				title: venue.name,
				zIndex: (100-x),
				description: description
			});

			markersArray.push(marker);


			google.maps.event.addListener(marker, 'click', function(event) {

				var contentString = '<div id="info-window"><h3>' + this.title + "</h3>" + this.description +'</div>';

				infowindow.setContent(contentString);
				infowindow.setPosition(event.latLng);// this.position

				infowindow.open(map);

			});
		}
	};

				
	this.setMarkers = function(locations, urlcat) {
		// Add markers to the map
		// Marker sizes are expressed as a Size of X,Y
		// where the origin of the image (0,0) is located
		// in the top left of the image.
		// Origins, anchor positions and coordinates of the marker
		// increase in the X direction to the right and in
		// the Y direction down.
		var fond = new google.maps.MarkerImage("img/check_map.png",
		// The shadow image is larger in the horizontal dimension
		// while the position and offset are the same as for the main image.
			new google.maps.Size(69, 80),
			new google.maps.Point(0,0),
			new google.maps.Point(18, 50)
		);
		// Shapes define the clickable region of the icon.
		// The type defines an HTML <area> element 'poly' which
		// traces out a polygon as a series of X,Y points. The final
		// coordinate closes the poly by connecting to the first
		// coordinate.
		var shape = {
			coord: [1, 1, 1, 60, 40, 30, 40 , 1],
			type: 'poly'
		};
		
		var infowindow = new google.maps.InfoWindow();
		var icon = "http://www.onemorecheckin.com/img/all_cat.png";

		for (var i = 0; i < locations.length; i++) {
			var checkin = locations[i];
			var cat = new google.maps.MarkerImage(
				checkin[3] ? checkin[3] : icon,
			// This marker is 20 pixels wide by 32 pixels tall.
				new google.maps.Size(32, 32),
			// The origin for this image is 0,0.
				new google.maps.Point(0,0),
			// The anchor for this image is the base of the flagpole at 0,32.
				new google.maps.Point(0, 32)
			);
			var myLatLng = new google.maps.LatLng(checkin[1], checkin[2]);
			var marker = new google.maps.Marker({
				markercount:i,
				position: myLatLng,
				map: map,
				shadow: fond,
				icon: cat,
				shape: shape,
				title: checkin[0],
				zIndex: checkin[4],
				description:checkin[5]
			});

			markersArray.push(marker);

			google.maps.event.addListener(marker, 'click', function(event) {
				console.log("Ouais j'ai cliqué sur le marqueur !.", this);

				var contentString = '<div id="content">' +
						'<div id="siteNotice">' +
						'</div>' +
						'<h1 id="firstHeading" class="firstHeading">' + this.title + '</h1>' +
						'<div id="bodyContent">' +
						'<p><b>' + this.description + '</b>' +
						'</div>' +
						'</div>';

				var contentString = '<div id="info-window"><h3>' + this.title + "</h3>" + this.description +'</div>';

				infowindow.setContent(contentString);
				infowindow.setPosition(event.latLng);// this.position

				infowindow.open(map);

			});
			 
		}
	};

})();
