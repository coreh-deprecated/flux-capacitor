flux-capacitor
==============

*Stop thinking fourth-dimensionally!*

**flux-capacitor** is a JavaScript library designed to simplify the development of
applications with asynchronous I/O. It's suitable for use on both web browser and 
CommonJS environments. (such as *node.js*)

flux-capacitor is small (~100 lines), has no external dependencies and is new BSD-licensed.

It takes away most of the complications and all the uglyness of the "traditional" several-levels-of-nested-functions approach.
It's based on two simple concepts: *flux* and *capacitors*

## Flux

A **flux** is a chain of anonymous functions that are executed asynchronously, but *always on sequence*.

The simplest flux possible does nothing, and is created with:

	flux();

Functions can then be chained for sequential execution like this:

	flux()
	(function(){
		// do something...
	})
	(function(){
		// do more stuff...
	})
	(function(){
		// do even more stuff...
	});

Notice the semicolon at the end. It's a good idea to end the chain explicitly, or the parser might end up chaining
something you didn't expect, if the next statement is an expression within parenthesis.

Inside the chained functions, the *this* variable points to the flux object created by calling
*flux()*. It can be used to control flux execution. For instance, to escape from a flux, one would do:

	flux()
	(function(){
		this.escape(); // stop flux execution
	})
	(function(){
		// this code is not executed
	});

*flux()* takes an optional parameter, *_this*, to specify a value for the 
*this* variable inside the chained functions. If *_this* is specified, the flux object
created by calling flux() can be accessed by the chained functions via a parameter.

	var that = this;
	flux(this)
	(function($){
		that === this; // evaluates to true
		$.escape();
	})
	(function($){
		// this code is not executed
	});

## Capacitors

**Capacitors** are special callbacks constructed inside a flux. When created,
they instruct the flux object to wait for their execution before executing the 
next function in the chain. For example:

	flux()
	(function(){
		console.log("Hello.");
		setTimeout(this.capacitor(), 1000);
	})
	(function(){
		console.log("World.");		
	});

Here, a capacitor is constructed by calling the *capacitor()* method on the flux
object. (Notice the parenthesis!) This example outputs:

	Hello.
	World.

However, the line "World." is printed one second after the line "Hello."

If multiple capacitors are created inside a single function on the flux chain, the flux
will wait for all of them to be executed before moving on to the next function in the chain. For example:

	flux()
	(function(){
		console.log("Hello.");
		setTimeout(this.capacitor(), 1000);
		setTimeout(this.capacitor(), 2000);
		setTimeout(this.capacitor(), 1500);
	})
	(function(){
		console.log("World.");		
	});

When the code is executed, "World." is printed two seconds after "Hello." <code>(2s = max(1000ms, 2000ms, 1500ms)</code>

The *capacitor()* function takes an optional function as an argument. If specified,
the function is called when the capacitor is executed, and receives all the parameters
the capacitor received. For example, suppose a *readData* function that reads data from the disk
asynchronously and fires a callback on completion, with the data as an argument:

	...
	readData(function(data){
		console.log(data);
	});
	...

To use it with capacitors, simply wrap it with *this.capacitor()*:

	...
	readData(this.capacitor(function(data){
		console.log(data);
	}));
	...

This ability comes in handy when a piece of code needs to be executed when one of the 
callbacks fires; not necessarily after all of them have fired. It is also
necessary if you want to store the data passed to the callbacks:

	flux()
	(function(){
		readData(this.capacitor(function(data){
			this.data = data;
		}));
	})
	(function(){
		console.log(this.data);
	});

Since storing the data passed to a callback is something done very often, a shorthand form is
provided to achieve similar results with less code:

	flux()
	(function(){
		readData(this.stored = this.capacitor("data"));
	})
	(function(){
		console.log(this.stored.data);
	});

## Escaping from a Flux

There are two different ways of escaping from a flux. The *escape()* method, shown
previously, stops the flow execution, making so that no more chained functions 
get executed after the current one. However, it should be noted that callback
functions passed to flux capacitors are still going to be executed:

	flux()
	(function(){
		setTimeout(this.capacitor(function(){
			this.escape();
		}), 1000);
		setTimeout(this.capacitor(function(){
			// This IS executed
		}), 2000);
	})
	(function(){
		// This is not executed	
	});

If this is not what you want, you should use the *elude()* method, instead:

	flux()
	(function(){
		setTimeout(this.capacitor(function(){
			this.elude();
		}), 1000);
		setTimeout(this.capacitor(function(){
			// This is not executed
		}), 2000);
	})
	(function(){
		// This is not executed	
	});

Keep in mind that the *escape()* and *elude()* functions prevent the execution
of the next functions on the chain, but they don't affect the execution of
the current function:

	flux()
	(function(){
		this.escape();
		doSomething(); // This line is still going to be executed
	})
	(function(){
		// This is not executed	
	});

If that's what you want, you should use the regular JavaScript flow control
mechanisms, like the *return* statement, along with the *escape()* or *elude()* methods.

## License

	Copyright (c) 2010, Marco A. Buono Carone
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
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
