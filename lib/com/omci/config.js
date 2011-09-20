/**
 * Base configuration for the app
 */

if (document.location.host.match(/local/)){
	window.Omc = {
		config: {
			client: "V4E5YSHBAG34FPQZA2X2ABUCHQP4M1AFIYWA5ZUTQWGSIPZE",
			callback: "http://local.onemorecheckin.com/~dmp/omci-frontend",
			api: {
				host: "local.api.onemorecheckin.com",
				port: 8080
			}
		}
	};
} else {
	window.Omc = {
		config: {
			client: "KPA3DXY55S1OWUAXKDNTXUCE0AL4AI0EMPKO2BSIVU2IUSAH",
			callback: "http://www.onemorecheckin.com",
			api: {
				host: "api.onemorecheckin.com",
				port: null
			}
		}
	};
}