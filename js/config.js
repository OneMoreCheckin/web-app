window.Omc = {};
window.Omc.config = {};
if (document.location.host.match(/local/)){
 Omc.config.client = "V4E5YSHBAG34FPQZA2X2ABUCHQP4M1AFIYWA5ZUTQWGSIPZE";
 Omc.config.callback = "http://local.onemorecheckin.com";
 Omc.config.api = {
   host: "http://local.api.onemorecheckin.com",
   port: 8080
 };
 Omc.conf
} else {
 Omc.config.client = "KPA3DXY55S1OWUAXKDNTXUCE0AL4AI0EMPKO2BSIVU2IUSAH";
 Omc.config.callback = "http://www.onemorecheckin.com";
 Omc.config.api = {
   host: "http://api.onemorecheckin.com",
   port: ""
 };

}