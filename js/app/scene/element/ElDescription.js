(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;
	var ElRect = ns.ElRect;
	var ElText = ns.ElText;
	var scenedata = MKK.getNamespace('data').settings;
	var scenedata = MKK.getNamespace('data').scenedata;
	var styledata = MKK.getNamespace('data').styledata;


	if(!ns.ElDescription) {

		var ElDescription = function ElDescription(title, body, products, styling, sFrame, duration, x, y, z, animateIn, animateOut, animateDuration) {

			this.name = name;
			this.container = new PIXI.DisplayObjectContainer();
			this.titleTxt = title.split("\n");
			this.bodyTxt = body;
			this.productTxt = products;
			this.title = [];
			this.styling = (styling || styling=='')? styling:'blue';

			this.duration = duration || 600;
			this.delayFactor = 40;
			this.animateIn = animateIn || 0;
			this.animateOut = animateOut || 200;
			this.animateDuration = animateDuration || 200;


			this.setup(sFrame, duration, x, y);

			this.z = z
			this.container.position = this.cPos;


		}	

		ns.ElDescription = ElDescription;

		var p = ElDescription.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);

			switch(this.styling) {

				case 'blue':
					this.titleStyle = styledata.descriptionTitleBlue;
					this.bodyStyle = styledata.descriptionBodyBlue;

					break;
				case 'white':
					this.titleStyle = styledata.descriptionTitleWhite;
					this.bodyStyle = styledata.descriptionBodyWhite;
					break;
				default:
				case 'grey':
					this.titleStyle = styledata.descriptionTitle;
					this.bodyStyle = styledata.descriptionBody;
					break;
			}

			//set the bar colour in hex
			this.barColour = parseInt(this.titleStyle.fill.replace("#", "0x"));

			for(var i=0; i<this.titleTxt.length; i++) {
				this.title[i] = new ElText(this.titleTxt[i], 0, 40 + settings.defaultDescriptionLineHeight*i, 0, 0,0);
				this.title[i].setStyle(this.titleStyle);
				this.container.addChild(this.title[i].container);
				this.title[i].opacity(0);
			}

			var tVertical = this.title[this.title.length-1].container.y + this.title[this.title.length-1].container.height + settings.defaultDescriptionGap/2;
			this.trect = new ElRect(0, tVertical-5, 0, 350, 2, this.barColour);
			this.container.addChild(this.trect.container);
			this.trect.opacity(0);

			var descTop = this.title[this.title.length-1].container.y + this.title[this.title.length-1].container.height + settings.defaultDescriptionGap;
			this.description = new ElText(this.bodyTxt, 0, descTop, 0, 0,0);
			this.description.setStyle(this.bodyStyle);
			this.container.addChild(this.description.container);
			this.description.opacity(0);


			//animate In
			var tweenTitleBound = ListenerFunctions.createListenerFunction(this, this.tweenTitle);
			this.tween0 = this.createAnimateInTween(tweenTitleBound, 0);

			var tweenLineBound = ListenerFunctions.createListenerFunction(this, this.tweenLine);
			this.tween1 = this.createAnimateInTween(tweenLineBound, this.delayFactor);


			var tweenDescBound = ListenerFunctions.createListenerFunction(this, this.tweenDesc);
			this.tween2 = this.createAnimateInTween(tweenDescBound, this.delayFactor*2);



			//animate Out
			var tweenOutBound = ListenerFunctions.createListenerFunction(this, this.tweenOut);
			this.tween3 = this.createAnimateOutTween(tweenOutBound);


		}

		p.open = function() {

		}

		p.update = function(frame) {
			this._update(frame);
			var cFrame = this.localCurFrame(frame);
		}


		//create tween in
		p.createAnimateInTween = function(func, delay) {
			var tmp = new TweenEach({x: -30, opacity: 0})
							.to({x: 0, opacity: 1}, this.animateDuration)
							.easing(TWEEN.Easing.Exponential.InOut)
							.onUpdate(func)
							.delay(this.startFrame+this.animateIn+delay).start();

			return tmp;
		}

		//create tween out
		p.createAnimateOutTween = function(func) {
			var tmp = new TweenEach({x: 0, opacity: 1})
							.to({x: -30, opacity: 0}, this.animateDuration)
							.easing(TWEEN.Easing.Exponential.InOut)
							.onUpdate(func)
							.delay(this.startFrame + this.duration - this.animateDuration - this.animateOut).start();

			return tmp;
		}

		//create functions
		p.tweenTitle = function(e) {
			var cObj = this.tween0.tweenVars();
			for(var i=0; i<this.title.length; i++) {
				this.title[i].container.x = cObj.x;
				this.title[i].opacity(e);
			}
		}

		p.tweenLine = function(e) {
			var cObj = this.tween2.tweenVars();
			this.description.container.x = cObj.x;
			this.description.opacity(e);
		}

		p.tweenDesc = function(e) {
			var cObj = this.tween1.tweenVars();
			this.trect.container.x = cObj.x;
			this.trect.opacity(e);
		}

		p.tweenOut = function(e) {
			var cObj = this.tween3.tweenVars();

			for(var i=0; i<this.title.length; i++) {
				this.title[i].container.x = cObj.x;
				this.title[i].opacity(1-e);
			}

			this.description.container.x = cObj.x;
			this.description.opacity(1-e);

			this.trect.container.x = cObj.x;
			this.trect.opacity(1-e);
		}


	}

})();
