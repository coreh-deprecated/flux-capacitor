/* Copyright (c) 2010, Marco A. Buono Carone
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * The name of Marco A. Buono Carone may not be used to endorse or promote products
      derived from this software without specific prior written permission.
	
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MARCO A. BUONO CARONE BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

var flux = function(_this){
	
	// The functions we still need to call
	var calls = []
	
	// The dependencies still needed to be resolved for the next function
	var dependencies = [];
	
	var ignoreCapacitors = false;
	
	// A chaining function to push functions to the 'calls' list
	var chain = function(f) {
		calls.push(f)
		return chain;
	}
	
	// Walk on the 'calls' list, until a dependency needs to be resolved
	var proceed = function() {
		while(dependencies.length == 0 && calls.length > 0) {
			//calls.shift()(chain);
			calls.shift().call(_this, chain);
		}
	}
	
	// Creates a new "Capacitor" delegate function that waits until it's called,
	// then stores the arguments and notifies the flux by calling 'proceed'
	chain.capacitor = function() {
		var capacitorArgs;
		var capacitorCallback;
		
		// Check if we received multiple string arguments or a single
		// function argument
		if (arguments.length != 1 || !(arguments[0] instanceof Function)) {
			// Stores the capacitor arguments (used to name stored arguments later)
			capacitorArgs = arguments;
		} else {
			capacitorCallback = arguments[0];
		}
		
		// Creates the actual function that receives the arguments
		var transferFunction = function() {
			
			if (ignoreCapacitors) {
				return;
			}
			
			// Store the arguments
			var transferArgs = transferFunction.arguments = arguments;
			
			if (capacitorCallback === undefined) {
				// Store the arguments on named attributes
				for (var i = 0; i < capacitorArgs.length; i++) {
					transferFunction[capacitorArgs[i]] = transferArgs[i];
				}
			} else {
				capacitorCallback.apply(_this, transferArgs);
			}
			
			// Find and remove the dependency from the list
			for (var i in dependencies) {
				if (dependencies[i] === transferFunction) {
					dependencies.splice(i, 1);
					break;
				}
			}
			
			// Notify the flux that we've been called
			proceed();
		}
		
		// Store the new dependency
		dependencies.push(transferFunction);
		
		// Return the function created
		return transferFunction;
	}
	
	// Escapes from a flux, without ignoring flux capacitors
	chain.escape = function() {
		calls = [];
	}
	
	// Escapes from a flux and ignores all flux capacitors from now on
	chain.elude = function() {
		calls = [];
		ignoreCapacitors = true;
	}
	
	// If no _this variable was provided, use the chain as this
	if (_this === undefined) {
		_this = chain;
	}
	
	// Start the chain soon
	setTimeout(proceed, 0);
	
	// Return chain
	return chain;
};

// For CommonJS
this.flux = flux;
