(function() {

	var ns = MKK.getNamespace('data');

	if (!ns.settings) {

		ns.settings = {

			defaultWidth:1024,
			defaultHeight:768,
			depthLevel:0.1,
			defaultTextStyle: {
				font:"40px EMPrintW01-semibold", 
				fill: "#58595b", 
				align: "center", 
				wordWrap: true, 
				wordWrapWidth: 800
			}
			// "dev": {
			// 	"assets":""
			// },

			// "deploy": {
			// 	"assets":""
			// }
		};
	}


})();
