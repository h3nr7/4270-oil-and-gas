(function() {

	var ns = MKK.getNamespace('data');

	if (!ns.scenedata) {

		ns.scenedata = {

			totalFrame: 27194,
			navi: {
				tweenTime:{}
			},
			scene1:{
				name: 'Start',
				startFrame: 0,
				duration: 4000,
				cuepoint: 0,
				level:[
					{name:"level0", x:0, y:0, z:0},
					{name:"level1", x:0, y:0, z:5},
					{name:"level2", x:0, y:0, z:4}
				],
				element:[

				]
			},
			scene2:{
				name: 'Exploration',
				startFrame: 3300,
				duration: 8200,
				cuepoint: 3580,
				level:[
					{name:"level0", x:0, y:0, z:0},
					{name:"level1", x:0, y:0, z:1},
					{name:"level2", x:0, y:0, z:10},
					{name:"level3", x:0, y:0, z:1},
				],
				element:{
					shipInner: { x: -500, y:1150, z:0 },
					radar: { x:0, y:0, z:0 }
				}
			},

			scene3:{
				name: 'Drilling',
				startFrame: 4000 + 7200,
				duration: 6800,
				cuepoint: 10920,
			},

			scene4:{
				name: 'Production',
				startFrame: 4000 + 7200 + 4700,
				duration: 7180,
				cuepoint: 17060,
			},

			scene5:{
				name: 'Transmission',
				cuepoint: 20700
			},

			scene6:{
				name: 'Processing',
				startFrame: 4000 + 7200 + 4700 + 6014,
				duration: 3000,
				cuepoint: 22370
			},

			scene7:{
				startFrame: 4000+7200+4700+6014+2000,
				duration: 2880,
				tweenTime: {
					//speed
					_fast: 150,
					_speed: 250,
					_speed1: 500,
					_speed2: 750,

					//start time
					delayStart: 500,
					tween1Start: 750,
					tween2Start: 1000,
					tween3Start: 1500,
					tween4Start: 2000,
					tween5Start: 2250,
					tween6Start: 2700,

					//position
					tweenStartX0: 2024,
					tweenStartX1: -2000,
					tweenStartX2: 0,

					//road position
					roadX0: 3000,
					roadX1: -2500,

					//sea
					seaY0: 700,
					seaY1: 670,

					//truck
					truckX0: 100,
					truckX1: 2000,
					fronttruckX0: 512,
					fronttruckY0: 400,
					fronttruckY1: 340
				}
			},

			scene8:{
				name: 'End',
				startFrame: 4000+7200+4700+6014+2000+2880,
				duration: 400,
				cuepoint: 27140,
				tweenTime:{
					//timing
					_speed: 150,
					stackDelay: 100,

					//positioning
					txt2X0: 512,
					txt2Y0: 240,

					txt3X0: 512,
					txt3Y0: 360,

					txt4X0: 512,
					txt4Y0: 570,

					txt2Y1: 300,
					txt3Y1: 380,
					txt4Y1: 600
				}
			},


		}
	}

})();