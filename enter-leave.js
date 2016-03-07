/* Animate views */

var transitionend = 'transitionend';

var fxq = require('fxq');

document.addEventListener(transitionend, function(e) {
	if (e.target.matches('.animate.active')) {
		e.stopPropagation();
		fxq.dequeue(e.target);
	}
});

function transition(className, options, complete) {
	options = options || {};

	// TODO perhaps className should be an array of classes
	if (options.className)
		className += ' ' + options.className;

	var stop;

	return {
		start: function(next, hooks) {
			hooks.stop = stop = animate.call(this, className, options);
		},

		finish: function() {
			if (complete) complete.call(this);

			stop();

			this.classList.remove('animate', 'active');
			this.style.height = '';
			
			fxq.dequeue(this);
		}
	};
}

function animate(className, options) {
	var self = this;

	this.classList.add.apply(this.classList, className.split(' ').concat('animate'));

	// force redraw
	this.offsetHeight;

	var timeout = setTimeout(function() {
		self.classList.add('active');
		//self.addClass('active');

		var duration = parseFloat(window.getComputedStyle(self).getPropertyValue('transition-duration'));

		timeout = setTimeout(function() {
			// finish animation if we are still waiting for transitionend

			//if (elem.is('.animate.active'))
			if (self.matches('.animate.active'))
				fxq.dequeue(self);
		}, duration > 0 ? duration * 1100 : 0);
	});

	return function() {
		clearTimeout(timeout);
		// TODO maybe split(' ') and apply?
		self.classList.remove.apply(self.classList, className.split(' '));
		//elem.removeClass(className);
	};
}

module.exports = {

	toggle: function(options) {
		if(this.hasClass('hidden') || this.hasClass('leave'))
			this.show(options);
		else 
			this.hide(options);
	},

	enter: function(element, targetElement, options, complete) {
		options = options || {};

		var enter = transition('enter', options, complete);

		fxq.queue(element, function() {
			// TODO implement different insertiong methods
			targetElement.appendChild(element);

			element.classList.remove('hidden');

			if (options.animateHeight)
				element.style.height = element.scrollHeight;

			enter.start.apply(element, arguments);
		});
		
		fxq.queue(element, enter.finish);
	},

	leave: function(element, options, complete) {

		var leave = transition('leave', options, complete || function() {
			// remove element when transition ends
			element.parentNode.removeChild(element);
		});

		fxq.finish(element);

		if (options && options.animateHeight && !element.classList.contains('animate')) {
			fxq.queue(element, function(next, hooks) {
				element.style.height = element.scrollHeight;

				// force redraw
				element.offsetHeight;

				var timeout = setTimeout(next);

				hooks.stop = function() {
					clearTimeout(timeout);
				};
			});
		}
		
		fxq.queue(element, leave.start);
		fxq.queue(element, leave.finish);
	},

	show: function(element, options) {
		fxq.finish(element);

		fxq.queue(element, function(next) {
			this.classList.add('visible');

			next();
		});

		this.enter(null, options);
	},

	hide: function(element, options) {
		this.leave(element, options, function() {
			this.classList.add('hidden');
			this.classList.remove('visible');
		});
	}
};
