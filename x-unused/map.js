/**
 * API to manipulate google maps (possibly not used)
 */


// MAP
	function initialiser_map() {
				var latlng = new google.maps.LatLng(-33.890542, 151.274856);
				//objet contenant des propriétés avec des identificateurs prédéfinis dans Google Maps permettant
				//de définir des options d'affichage de notre carte
				var options = {
					center: latlng,
					zoom: 19,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};
				
				//constructeur de la carte qui prend en paramêtre le conteneur HTML
				//dans lequel la carte doit s'afficher et les options
				var carte = new google.maps.Map(document.getElementById("carte"), options);
				
				setMarkers(carte, checkins);
				}
				
				var checkins = [
				  ['Bondi Beach', -33.890542, 151.274856, 4],
				  ['Coogee Beach', -33.923036, 151.259052, 5],
				  ['Cronulla Beach', -34.028249, 151.157507, 3],
				  ['Manly Beach', -33.80010128657071, 151.28747820854187, 2],
				  ['Maroubra Beach', -33.950198, 151.259302, 1]
				];

function setMarkers(map, locations) {
  // Add markers to the map

  // Marker sizes are expressed as a Size of X,Y
  // where the origin of the image (0,0) is located
  // in the top left of the image.

  // Origins, anchor positions and coordinates of the marker
  // increase in the X direction to the right and in
  // the Y direction down.
  var cat = new google.maps.MarkerImage('img/example_cat.png',
      // This marker is 20 pixels wide by 32 pixels tall.
      new google.maps.Size(32, 32),
      // The origin for this image is 0,0.
      new google.maps.Point(0,0),
      // The anchor for this image is the base of the flagpole at 0,32.
      new google.maps.Point(0, 32));
  var fond = new google.maps.MarkerImage('img/check_map.png',
      // The shadow image is larger in the horizontal dimension
      // while the position and offset are the same as for the main image.
      new google.maps.Size(69, 80),
      new google.maps.Point(0,0),
      new google.maps.Point(18, 50));
      // Shapes define the clickable region of the icon.
      // The type defines an HTML <area> element 'poly' which
      // traces out a polygon as a series of X,Y points. The final
      // coordinate closes the poly by connecting to the first
      // coordinate.
  var shape = {
      coord: [1, 1, 1, 60, 40, 30, 40 , 1],
      type: 'poly'
  };
  for (var i = 0; i < locations.length; i++) {
    var checkin = locations[i];
    var myLatLng = new google.maps.LatLng(checkin[1], checkin[2]);
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        shadow: fond,
        icon: cat,
        shape: shape,
        title: checkin[0],
        zIndex: checkin[3]
    });
	
	google.maps.event.addListener(marker, 'click', function() {
		alert("Ouais j'ai cliqué sur le marqueur !.");//message d'alerte
	});
	
  }
						
				
}