/**
 * 参考链接 https://github.com/mqyqingfeng/Blog/issues/11
 */

Function.prototype.cxCall = function (context) {
  context = context || window;

  // 这里当然不能用es6了
  const args = [];
  for (let i = 1, len = arguments.length; i < len; i++) {
    // 这里不能直接拼 arguments[i] 因为放到eval函数中是作为变量执行的
    args.push(`arguments[${i}]`);
  }

  context.fn = this;

  // 这里用eval执行一下函数
  // context.fn(...args);
  const ret = eval(`context.fn(${args})`);
  delete context.fn;
  return ret;
};

const obj = {
  n: 'x',
};

function a(x) {
  console.log(this.n);
  console.log(x);
}

a.cxCall(obj, 'y');

/**
 * apply 跟call相似 只是参数为第二参数
 */

Function.prototype.cxApply = function (context, arr) {
  context = context || window;
  context.fn = this;

  let ret;
  if (!arr) {
    ret = context.fn();
  } else {
    let args = [];
    for (let i = 0, len = arr.length; i < len; i++) {
      args.push(`arr[${i}]`);
    }
    ret = eval(`context.fn(${args})`);
  }

  delete context.fn;
  return ret;
};
