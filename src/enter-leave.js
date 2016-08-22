import * as fxq from 'fxq';

const transitionend = 'transitionend';

document.addEventListener(transitionend, function (e) {
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

  let stop;

  return {
    start(next, hooks) {
      hooks.stop = stop = animate.call(this, className, options);
    },

    finish() {
      if (complete) complete.call(this);

      stop();

      this.classList.remove('animate', 'active');
      this.style.height = '';

      fxq.dequeue(this);
    }
  };
}

function animate(className, options) {
  this.classList.add(...className.split(' '), 'animate');

  // force redraw
  this.offsetHeight;

  let timeout = setTimeout(() => {
    const duration = parseFloat(window.getComputedStyle(self).getPropertyValue('transition-duration'));

    timeout = setTimeout(() => {
      // finish animation if we are still waiting for transitionend

      //if (elem.is('.animate.active'))
      if (this.matches('.animate.active'))
        fxq.dequeue(this);
    }, duration > 0 ? duration * 1100 : 0);
  });

  return () => {
    clearTimeout(timeout);
    // TODO maybe split(' ') and apply?
    this.classList.remove(...className.split(' '));
  };
}

export function toggle(options) {
  if (this.hasClass('hidden') || this.hasClass('leave'))
    this.show(options);
  else
    this.hide(options);
}

export function enter(element, targetElement, options, complete) {
  options = options || {};

  const enter = transition('enter', options, complete);

  fxq.queue(element, function () {
    // TODO implement different insertiong methods
    targetElement.appendChild(element);

    element.classList.remove('hidden');

    if (options.animateHeight)
      element.style.height = element.scrollHeight;

    enter.start.apply(element, arguments);
  });

  fxq.queue(element, enter.finish);
}

export function leave(element, options, complete) {
  const leave = transition('leave', options, complete || function () {
    // remove element when transition ends
    element.parentNode.removeChild(element);
  });

  fxq.finish(element);

  if (options && options.animateHeight && !element.classList.contains('animate')) {
    fxq.queue(element, (next, hooks) => {
      element.style.height = element.scrollHeight;

      // force redraw
      element.offsetHeight;

      const timeout = setTimeout(next);

      hooks.stop = () => {
        clearTimeout(timeout);
      };
    });
  }

  fxq.queue(element, leave.start);
  fxq.queue(element, leave.finish);
}

export function show(element, options) {
  fxq.finish(element);

  fxq.queue(element, function (next) {
    this.classList.add('visible');

    next();
  });

  this.enter(null, options);
}

export function hide(element, options) {
  this.leave(element, options, function () {
    this.classList.add('hidden');
    this.classList.remove('visible');
  });
}
