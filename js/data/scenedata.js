(function() {

	var ns = MKK.getNamespace('data');

	if (!ns.scenedata) {

		ns.scenedata = {

			scene1:{

				startFrame: 0,
				duration: 4000,
				level:[
					{name:"level0", x:0, y:0, z:0},
					{name:"level1", x:0, y:0, z:5},
					{name:"level2", x:0, y:0, z:4}
				],
				element:[
					{ type: 'elsprite', name: "cloud_satellite.png", x:100, y:100, z:0, level:'level0' },

				]
			},
			scene2:{
				startFrame: 0,
				duration: 4000,
				level:[
					{name:"level1", x:0, y:0, z:0},
					{name:"level2", x:0, y:0, z:5},
					{name:"level3", x:0, y:0, z:4},
				],
				element:[
					{ type: 'elsprite', name: "cloud_satellite.png", x:100, y:100, z:0 }

				]
			},

			scene3:{

			},

			scene4:{

			},

			scene5:{

			},

			scene6:{

			},

			scene7:{

			},

			scene8:{

			},


		}
	}

})();