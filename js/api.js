Services = new (function(){
    
    var host = "http://api.onemorecheckin.com";
    var __token = null;
    var __uid = null;
    var __oauth = null;
    
    this.easiest = [];
    this.nearest = [];
    
    this.ready = false;
    
    Object.defineProperty(this, "uid", {
      get: function(){
        return __uid;
      },
      set: function(uid){
        __uid = uid
      },
      enumerable: true
    });
    
    Object.defineProperty(this, "token", {
      get: function(){
        return __token;
      },
      set: function(token){
        __token = token
      },
      enumerable: true
    });
    
    Object.defineProperty(this, "oauth", {
      get: function(){
        return __oauth;
      },
      set: function(oauth){
        __oauth = oauth
      },
      enumerable: true
    });
    
    this.authenticate = function (code, success, error) {
      $.ajax({
          url: host + "/1.0/register?code="+code,
          dataType: 'jsonp',
          data: {},
          success: function (data) {
            if (data.error) 
              error();
            else {
              Services.token = data.token;
              Services.uid = data.uid;
              Services.oauth = data.oauth;
              Services.fetchBadges('more', function (d) { Services.easiest = d; if (Services.ready == true) success(); else Services.ready = true; }, error);
              Services.fetchBadges('complete', function (d) { Services.nearest = d; if (Services.ready == true) success(); else Services.ready = true;  }, error);
              
            }
          },
          error : function (error) {
            error()
          }
        });
    }
    
    this.fetchBadges = function (sort, success, error) {
      $.ajax({
          url: host + "/1.0/"+Services.uid+"/badges?token="+Services.token+"&sort="+sort,
          dataType: 'jsonp',
          data: {},
          success: function (data) {
            if (data.error) 
              error();
            else {
              success(data);
            }
          },
          error : function (error) {
            error()
          }
        });
    }

});