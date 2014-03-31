(function() {

	if (!ns) var ns = {};


		var scrolltest = function() {

		};

		var p = scrolltest.prototype;
		ns.scrolltest = scrolltest;

		p.setup = function() {
			console.log('scrolltest setup!');

			this.yPos = 0; 
			this.prevYPos = 0;
			this.tiltX = 0;
			this.tiltY = 0;

			this.main = document.getElementById('main');
			this.container = document.createElement('div');
			this.container.id = 'container';
			this.container.style.width= '100%';
			this.container.style.height= '100%';
			this.container.style.background = 'green';
			this.main.appendChild(this.container);


			this.tester = document.createElement('div');
			this.tester.style.cssText = 'position: absolute; top: 0px; width: 100px; height: 100px; background: red;'
			container.appendChild(this.tester);

			this.tester2 = document.createElement('div');
			this.tester2.style.cssText = 'position: absolute; top: 0px; width: 100px; height: 100px; background: red;'
			this.tester2.style.background = 'blue';
			container.appendChild(this.tester2);


			this.tester3 = document.createElement('div');
			this.tester3.style.cssText = 'position: absolute; top: 0px; width: 100px; height: 100px; background: red;'
			this.tester3.style.background = 'white';
			container.appendChild(this.tester3);

			this.tester4 = document.createElement('div');
			this.tester4.style.cssText = 'position: absolute; top: 0px; width: 200px; height: 200px; background: red;'
			this.tester4.style.background = 'black';
			container.appendChild(this.tester4);

			this.tester5 = document.createElement('div');
			this.tester5.style.cssText = 'position: absolute; top: 0px; width: 80px; height: 80px; background: red;'
			this.tester5.style.background = 'white';
			container.appendChild(this.tester5);


			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.right = '0px';
			this.stats.domElement.style.bottom = '0px';
			this.main.appendChild(this.stats.domElement);

			this.scrolldat = new ScrollDat();
			this.main.appendChild(this.scrolldat.domElement);
		}

		p.update = function(yY) {
			this.yPos = this.prevYPos + yY;
		}

		p.updateEnd = function(yY) {
			console.log('dragend called');
			this.yPos = this.prevYPos= this.prevYPos + yY;
		}

		p.updateTilt = function(xX, yY) {

			this.tiltX = xX;
			this.tiltY = yY;
		}

		p.animate = function() {

			this.stats.update();
			this.scrolldat.update(this.yPos);
			this.tester.style.webkitTransform = 'translate3d('+ this.yPos +'px,0,0)';
			this.tester2.style.webkitTransform = 'translate3d('+ this.yPos*0.8 +'px,0,-30px)';
			this.tester3.style.webkitTransform = 'translate3d('+ this.yPos*0.3 +'px, '+ this.yPos*0.8 +'px, 0px)';
			this.tester4.style.webkitTransform = 'translate3d( '+ (500+this.tiltY) +'px, '+ (200+2*this.tiltX) +'px,0)';
			this.tester5.style.webkitTransform = 'translate3d( '+ (540-this.tiltY) +'px, '+ (200-2*this.tiltX) +'px,0)';

		}



		// begins
		document.addEventListener("DOMContentLoaded", function() {


			console.log('DOM Content Loaded ::');
			var test = new ns.scrolltest();
			test.setup();

			window.addEventListener('touchstart', function(e) {
				e.preventDefault();
			})

			var hammertime = Hammer(test.container, {
		        drag: true,
		        transform: false,
		        drag_block_horizontal: false
		    });

		    var taptime = Hammer(test.tester, {
		        drag: false
		    });

			taptime.on("tap", function(e) {
				alert('hey you! Stop touching me!');
			});

		    hammertime.on("dragup dragdown", function(e) {
		    	e.preventDefault();
		        test.update(Math.round(e.gesture.deltaY));
		    });

		    hammertime.on("dragend", function(e) {
		    	test.updateEnd(e.gesture.deltaY);
		    });

		    window.addEventListener('deviceorientation', function(eventData){
		    	var yTilt = Math.round((-eventData.beta + 90) * (40/180) - 40);
		    	var xTilt = Math.round(-eventData.gamma * (20/180) - 20);
				if (xTilt > 0) {
					xTilt = -xTilt;
				} else if (xTilt < -40) {
					xTilt = -(xTilt + 80);
				}

				test.updateTilt(xTilt, yTilt);
		    });

			// window.addEventListener('touchend', function(e) {
			// 	e.preventDefault();
			// 	console.log('haha');
			// 	test.update();
			// })


			// window.addEventListener('touchmove', function(e) {
			// 	e.preventDefault();
			// 	console.log('haha');
			// 	test.update();
			// })

			// window.addEventListener('scroll', function() {
			// 	test.animate();
			// })

			var animate = function() {
				requestAnimationFrame( animate );
				test.animate();
			};

			animate();

		});

})();