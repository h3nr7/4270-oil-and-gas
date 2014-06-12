(function(){

	var ns = MKK.getNamespace('mkk.event');

	if (!ns.EventDispatcher) {

		var EventDispatcher = function EventDispatcher() {
			this._eventListeners = null;
		}

		ns.EventDispatcher = EventDispatcher;

		// Check if this browser supports Custom Events
		var supportsCustomEvents = true;
		try {
			var newTestCustomEvent = document.createEvent("CustomEvent");
		} catch(e){
			supportsCustomEvents = false;
		}

		var p = EventDispatcher.prototype;

		p.addEventListener = function(aEventType, aFunction) {

			if(this._eventListeners === null) {
				this._eventListeners = {};
			}
			if(!this._eventListeners[aEventType]){
				this._eventListeners[aEventType] = [];
			}
			this._eventListeners[aEventType].push(aFunction);
			
			return this;			
		}

		
		p.removeEventListener = function(aEventType, aFunction) {
			if(this._eventListeners === null) {
				this._eventListeners = {};
			}
			var currentArray = this._eventListeners[aEventType];
			
			if (typeof(currentArray) === "undefined") {
				// console.warn("EventDispatcher :: removeEventListener :: Tried to remove an event handler (for " + aEventType +") that doesn't exist");
				return this;
			}
			
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++){
				if(currentArray[i] == aFunction){
					currentArray.splice(i, 1);
					i--;
					currentArrayLength--;
				}
			}
			return this;
		};

		p.dispatchEvent = function(aEvent) {
			if(this._eventListeners === null) {
				this._eventListeners = {};
			}
			var eventType = aEvent.type;
			
			if(aEvent.target === null) {
				aEvent.target = this;
			}
			aEvent.currentTarget = this;
			//console.log(eventType, this._eventListeners[eventType], this._eventListeners[eventType].length);
			var currentEventListeners = this._eventListeners[eventType];
			if(currentEventListeners !== null && currentEventListeners !== undefined) {
				var currentArray = this._copyArray(currentEventListeners);
				var currentArrayLength = currentArray.length;
				for(var i = 0; i < currentArrayLength; i++){
					var currentFunction = currentArray[i];
					//console.log(currentFunction);
					//console.log(eventType, i, currentArray.length);
					currentFunction.call(this, aEvent);
				}
			}
			return this;
		};
		
		p.dispatchCustomEvent = function(aEventType, aDetail) {
			if (supportsCustomEvents){
				var newEvent = document.createEvent("CustomEvent");	
				newEvent.dispatcher = this;
				newEvent.initCustomEvent(aEventType, false, false, aDetail);
			} else {
				var newEvent = {"type" : aEventType, "detail" : aDetail, "dispatcher" : this };
				return this.dispatchEvent(newEvent);
			}	
			return this.dispatchEvent(newEvent);
		};
		
		p.destroy = function() {
			if(this._eventListeners !== null) {
				for(var objectName in this._eventListeners) {
					var currentArray = this._eventListeners[objectName];
					var currentArrayLength = currentArray.length;
					for(var i = 0; i < currentArrayLength; i++) {
						currentArray[i] = null;
					}
					delete this._eventListeners[objectName];
				}
				this._eventListeners = null;
			}
		};


		p._copyArray = function(aArray) {
			var currentArray = new Array(aArray.length);
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				currentArray[i] = aArray[i];
			}
			return currentArray;
		};

	}



})();