(function() {

	if (!ns) var ns = {};


		var scrolltest = function() {

		};

		var p = scrolltest.prototype;
		ns.scrolltest = scrolltest;

		p.setup = function() {
			console.log('scrolltest setup!');

			this.yPos = 0;

			this.main = document.getElementById('main');
			this.container = document.createElement('div');
			this.container.id = 'container';
			this.container.style.width= '100%';
			this.container.style.height= '100%';
			this.container.style.background = 'green';
			this.main.appendChild(this.container);


			this.tester = document.createElement('div');
			this.tester.style.cssText = 'position: absolute; top: 200px; width: 100px; height: 100px; background: red;'
			container.appendChild(this.tester);

			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.right = '0px';
			this.stats.domElement.style.bottom = '0px';
			this.main.appendChild(this.stats.domElement);

			this.scrolldat = new ScrollDat();
			this.main.appendChild(this.scrolldat.domElement);
		}

		p.update = function() {
			this.yPos++;
		}

		p.animate = function() {

			this.stats.update();
			this.scrolldat.update(this.yPos);
			// this.tester.style.cssText = '-webkit-transform: translateX(-1px) translateY(0px) translateZ(0px);';
		}



		// begins
		document.addEventListener("DOMContentLoaded", function() {


			console.log('DOM Content Loaded ::');
			var test = new ns.scrolltest();
			test.setup();


			window.addEventListener('touchstart', function(e) {
				e.preventDefault();
				console.log('haha');
				test.update();
			})

			window.addEventListener('touchend', function(e) {
				e.preventDefault();
				console.log('haha');
				test.update();
			})


			window.addEventListener('touchmove', function(e) {
				e.preventDefault();
				console.log('haha');
				test.update();
			})

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