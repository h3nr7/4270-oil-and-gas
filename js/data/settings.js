(function() {

	var ns = MKK.getNamespace('data');

	if (!ns.settings) {

		ns.settings = {

			//DIMENSIONS
			defaultWidth:1024,
			defaultHeight:768,
			depthLevel:0.1,
			defaultTextStyle: {
				font:"40px emprintw01-semibold", 
				fill: "#58595b", 
				align: "center", 
				wordWrap: true, 
				wordWrapWidth: 800
			},

			//TEXT and FONTS
			defaultDescriptionGap: 20, 
			defaultDescriptionLineHeight: 40,

			//COLORS
			defaultBrandRed: '#e30420',
			defaultBrandBlue: '#174c8f',

			//HEX COLORS
			defaultOilRigBlue: 0x174c8f,
			defaultOilRigLightBlue: 0x1fbcee,
			defaultBGColor: 0xe7e7e7,
			defaultOilColor: 0x000000,
			defaultOilBGColor: 0xc5c5c7,
			defaultSeaFloorColor: 0x464649,
			defaultSeaLight: 0x41b4e7,
			defaultSeaColor: 0x0079c1,
			defaultRoadGrey: 0x7e8083,
			defaultRoadGreen: 0xcdd201,
			defaultTownGreen: 0xb7b70e
			// "dev": {
			// 	"assets":""
			// },

			// "deploy": {
			// 	"assets":""
			// }
		};
	}


})();
