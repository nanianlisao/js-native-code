/**
 * memoize 记忆函数，当参数相同时，不再重复计算结果直接返回
 * @params fn 为纯函数
 */

function memoize(fn) {
  let cache = {};
  return function () {
    let args = arguments;
    let key = JSON.stringify(args);
    if (cache[key]) {
      console.log('直接走缓存');
      // 直接输出缓存的数据
      return cache[key];
    } else {
      return (cache[key] = fn.apply(this, args));
    }
  };
}

function add(x, y, z) {
  return x + y + z;
}

var x = memoize(add);
console.log(x('1', '2', '3')); // 123
console.log(x(1, 2, 3)); // 6
console.log(x(1, 2, 3)); // 直接走缓存  6
