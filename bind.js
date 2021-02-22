/**
 * 参考链接 https://www.cnblogs.com/echolun/p/12178655.html
 */

Function.prototype.cxBind = function (context) {
  if (typeof this !== 'function') {
    throw new Error(
      'Function.prototype.bind - what is trying to be bound is not callable'
    );
  }

  const self = this;
  // 获取到函数的参数
  const args1 = [].slice.call(arguments, 1);
  //原型链继承 这里不能直接继承 需要用一个新函数
  const _fn = function () {};
  const newFn = function () {
    // 这里获取到bind返回的函数的参数
    const arg2 = [].slice.call(arguments);
    // "当 bind 返回的函数作为构造函数的时候，bind 时指定的 this 值会失效"
    self.apply(_fn.prototype.isPrototypeOf(this) ? this : context, [
      ...args1,
      ...arg2,
    ]);
  };

  _fn.prototype = self.prototype;
  newFn.prototype = new _fn();
  return newFn;
};

const obj = {
  n: 1,
};

function fn(x, y, z) {
  this.name = 'name1';
  console.log(this.n);
  console.log(x);
  console.log(y);
  console.log(z);
}

const fn2 = fn.cxBind(obj, 2).cxBind(obj, 3);

fn2(4); // 1 2 3 4

new fn2(4); // undefined 2 3 4
