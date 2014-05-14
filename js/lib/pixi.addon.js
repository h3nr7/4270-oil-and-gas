// -------------------------------
// Extra Vector function addon 
// By Henry @ monKiKi
// -------------------------------

(function(){

	if(!PIXI) {
		console.log('PIXI.js is not loaded!'); 
		return;
	}

	PIXI.Point = function(x, y)
	{
	    this.x = x || 0;
	    this.y = y || 0;
	};

	PIXI.Point.prototype.clone = function()
	{
	    return new PIXI.Point(this.x, this.y);
	};

	// constructor
	PIXI.Point.prototype.constructor = PIXI.Point;

	//add vector
	PIXI.Point.prototype.add = function(v) {
	    this.x += v.x;
	    this.y += v.y;
	    return this;
	};

	//subtract
	PIXI.Point.prototype.sub = function(v) {
	    this.x -= v.x;
	    this.y -= v.y;
	    return this;
	};

	//multiply
	PIXI.Point.prototype.multiplyScalar = function(s) {
	    this.x *= s;
	    this.y *= s;
	    return this;
	};

	//divide
	PIXI.Point.prototype.divideScalar = function(s) {
	    if(s === 0) {
	        this.x = 0;
	        this.y = 0;
	    } else {
	        var invScalar = 1 / s;
	        this.x *= invScalar;
	        this.y *= invScalar;
	    }
	    return this;
	};	

	//dot product
	PIXI.Point.prototype.dot = function(v) {
	    return this.x * v.x + this.y * v.y;
	};

	//length
	PIXI.Point.prototype.length = function(v) {
	    return Math.sqrt(this.x * this.x + this.y * this.y);
	};

	//length square
	PIXI.Point.prototype.lengthSq = function() {
	    return this.x * this.x + this.y * this.y;
	};

	//normalize
	PIXI.Point.prototype.normalize = function() {
	    return this.divideScalar(this.length());
	};

	//distance to andother vector
	PIXI.Point.prototype.distanceTo = function(v) {
	    return Math.sqrt(this.distanceToSq(v));
	};

	//distance to square
	PIXI.Point.prototype.distanceToSq = function(v) {
	    var dx = this.x - v.x, dy = this.y - v.y;
	    return dx * dx + dy * dy;
	};

	//set pos
	PIXI.Point.prototype.set = function(x, y)
	{
	    this.x = x || 0;
	    this.y = y || ( (y !== 0) ? this.x : 0 ) ;
	};

	//set x
	PIXI.Point.prototype.setX = function(x) {
	    this.x = x;
	    return this;
	};

	//set y
	PIXI.Point.prototype.setY = function(y) {
	    this.y = y;
	    return this;
	};

	//set length
	PIXI.Point.prototype.setLength = function(l) {
	    var oldLength = this.length();
	    if(oldLength !== 0 && l !== oldLength) {
	        this.multiplyScalar(l / oldLength);
	    }
	    return this;
	};

	//invert
	PIXI.Point.prototype.invert = function(v) {
	    this.x *= -1;
	    this.y *= -1;
	    return this;
	};

	//lerp
	PIXI.Point.prototype.lerp = function(v, alpha) {
	    this.x += (v.x - this.x) * alpha;
	    this.y += (v.y - this.y) * alpha;
	    return this;
	};

	//get radian
	PIXI.Point.prototype.rad = function() {
	    return Math.atan2(this.x, this.y);
	};

	//get degree
	PIXI.Point.prototype.deg = function() {
	    return this.rad() * 180 / Math.PI;
	};

	//equals to vector
	PIXI.Point.prototype.equals = function(v) {
	    return this.x === v.x && this.y === v.y;
	};

	//rotate
	PIXI.Point.prototype.rotate = function(theta) {
	    var xtemp = this.x;
	    this.x = this.x * Math.cos(theta) - this.y * Math.sin(theta);
	    this.y = xtemp * Math.sin(theta) + this.y * Math.cos(theta);
	    return this;
	};

})();