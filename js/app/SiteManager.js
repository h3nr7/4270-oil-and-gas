(function(aGlobalObject) {

	if (aGlobalObject.MKK) {
		console.warn("aGlobalObject.MKK has already been constructed")
	}

	var MKK = {}
	aGlobalObject.MKK = MKK;

	// get the namespacing with structure
	MKK.getNamespace = function(aPackagePath) {
		
		var currentObject = this;
		var currentArray = aPackagePath.split(".");
		var currentArrayLength = currentArray.length;
		for(var i = 0; i < currentArrayLength; i++) {
			var currentName = currentArray[i];
			if(currentObject[currentName] === undefined) {
				currentObject[currentName] = {};
			}
			currentObject = currentObject[currentName];
		}
		return currentObject;
	};

	// get the class from ns
	MKK.getClass = function(aClassPath) {

		var lastSplitPosition = aClassPath.lastIndexOf(".");
		var packagePath = aClassPath.substring(0, lastSplitPosition);
		var className = aClassPath.substring(lastSplitPosition+1, aClassPath.length);
		
		var packageObject = this.getNamespace(packagePath);
		if(packageObject[className] === undefined) {
			console.error("Class " + aClassPath + " doesn't exist.");
			return null;
		}
		return packageObject[className];
	};

	// setup singletons
	MKK.singletons = new Object();

})(window);