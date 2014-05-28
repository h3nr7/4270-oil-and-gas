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

				]
			},
			scene2:{
				startFrame: 0,
				duration: 4000,
				level:[
					{name:"level0", x:0, y:0, z:0},
					{name:"level1", x:0, y:0, z:1},
					{name:"level2", x:0, y:0, z:10},
					{name:"level3", x:0, y:0, z:10},
				],
				element:{
					shipInner: { x: -500, y:1150, z:0 },
					radar: { x:0, y:0, z:0 }
				}
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