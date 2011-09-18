Infos = new (function() {
  

  this.grab = function() { 
  // STATS
    $.getJSON('https://api.foursquare.com/v2/users/self?oauth_token='+ Services.oauth+'&v=20110918', function(data) {
      var items = [];
      prenom_user = (data.response.user.firstName);
      nom_user = (data.response.user.lastName);
      count_checkin = (data.response.user.checkins.count);
      countbadges_checkin = (data.response.user.badges.count);
      mayor_checkin = (data.response.user.mayorships.count);
      
      $.each(data.response.user.checkins.items, function(i,item){
      	  var date = new Date();
    	  date.setTime(item.createdAt*1000);
          last_checkin = (item.venue.name)+', '+(item.venue.location.city)+' - '+date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate();
        });
    	
      $('<span>'+prenom_user+' '+nom_user+'</span>').appendTo('#prenom_nom');
      $('<span>'+last_checkin+'</span>').appendTo('#last_check');
      $('<span>'+count_checkin+'</span>').appendTo('#count_check');
      $('<span>'+countbadges_checkin+'</span>').appendTo('#countbadges_check');
      $('<span>'+mayor_checkin+'</span>').appendTo('#mayor_check');
    });
    
   
  
    $.getJSON('https://api.foursquare.com/v2/users/self/badges?oauth_token='+Services.oauth+'&v=20110918', function(data2) {
    var itemsz = [];
  
    var lesbadges = new Array();	
    i = -1;
    for (var key in data2.response.badges) {
   	 	
    		badges=data2.response.badges[key];
    	
  	    if (badges.unlocks.lenght!=0 && badges.unlocks.length!=0 && badges.unlocks[0].checkins.length != 0) {
  		lesbadges[i]={date:badges.unlocks[0].checkins[0].createdAt, name:badges.name, image:badges.image.name};
  		i++;
  	  }
    	  
    } 
    
    lesbadges.sort(callbackFunc);
    var size = (lesbadges.length < 3) ? lesbadges.length : 3;
    for(var y=0; y < size; y++) {
    //var date2 = new Date();
    //date2.setTime(lesdates[y]);
    $('<li><img width="17" height="17" src="https://playfoursquare.s3.amazonaws.com/badge/57'+lesbadges[y]["image"]+'"/> <span>'+lesbadges[y]["name"]+'</span>   </li>').appendTo('#ulstatsdyn'); 
    }
    
  });
};
  
  
var callbackFunc = function (a,b){

	if(a.date == b.date){
		return 0;
	}

	return (a.date > b.date) ? -1 : 1;
}

});




BadgeList = new (function () {
   
   this.reset = function(){
     $("#list_badges").empty();
   }
   
   this.add = function (obj) {
     console.log(obj.img);
     $("#list_badges").append('<li class="box_badge" id="id_box_badge01"> <div class="img_badge"><img src="img/'+obj.img+'" /></div> <div class="infos_badges"> <p class="titre_badge"><a href="#">'+obj.name+'</a></p> <div class="cat_badge"><img src="img/'+obj.icon+'"/></div> <p class="description_badge">Do '+obj.more+' check-in in a bar venue with 3 others (opposite sex) </p> <p class="findit_badge"><a href="">Find it now!</a> <span class="txt_hurry">'+obj.details+'</span></p> </div><div class="pourcent_badge"><script>$(document).ready(function() {$("#progressbar01").progressbar({ value: '+obj.infos.complete+' });});</script> <div class="pastille"><p class="txt_pastille" style="">'+obj.infos.complete+'%</p></div> <div id="progressbar01"></div></div></li>');
   }
});
