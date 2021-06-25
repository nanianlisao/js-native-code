/**
 * 防抖函数
 * 防抖的原理就是：你尽管触发事件，但是我一定在事件触发 n 秒后才执行，
 * 如果你在一个事件触发的 n 秒内又触发了这个事件，那我就以新的事件的时间为准，n 秒后才执行，
 * 总之，就是要等你触发完事件 n 秒内不再触发事件，我才执行
 */

// 1. 基础版本
function debounce(fn, delay) {
  let timer = null;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}

// 2. this指向问题
function debounce(fn, delay) {
  let timer = null;
  return function () {
    const self = this;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(self);
    }, delay);
  };
}

// 3. 传递其他参数
function debounce(fn, delay) {
  let timer = null;
  return function () {
    const self = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(self, args);
    }, delay);
  };
}


// 4. 立即执行 immediate
function debounce(fn, delay, immediate) {
    let timer = null;
    let callNow = immediate
    return function () {
      const self = this;
      const args = arguments;
      if(callNow){
        fn.apply(self, args);
        callNow = false
      }
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(self, args);
      }, delay);
    };
  }