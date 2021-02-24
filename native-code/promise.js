/**
 * 参考链接 https://blog.csdn.net/pma934/article/details/100041873
 */

function CxPromise(fn) {
  const that = this;
  this.state = 'pending';
  this.value = undefined;
  this.reason = undefined;

  // 异步的话 需要先将cb存起来
  this.resolvedCb = [];
  this.rejectedCb = [];

  let resolve = function (value) {
    that.value = value;
    that.state = 'fulfilled';
    that.resolvedCb.forEach(cb => cb(that.value));
  };

  let reject = function (reason) {
    that.reason = reason;
    that.state = 'rejected';
    that.rejectedCb.forEach(cb => cb(that.value));
  };

  try {
    fn(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

CxPromise.prototype.then = function (onFulfilled, onRejected) {
  const that = this;
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : () => {};
  onRejected = typeof onRejected === 'function' ? onRejected : () => {};

  if (this.state === 'fulfilled') {
    return new CxPromise((resolve, reject) => {
      if (this.value instanceof CxPromise) {
        this.value.then(onFulfilled, onRejected);
      } else {
        try {
          console.log('res2', res);
          let res = onRejected(this.value);
          resolve(res);
        } catch (e) {
          reject(e);
        }
      }
    });
  }

  if (this.state === 'rejected') {
    return new CxPromise((resolve, reject) => {
      try {
        let res = onRejected(this.reason);
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  }
  if (this.state === 'pending') {
    return new CxPromise((resolve, reject) => {
      this.resolvedCb.push(() => {
        if (that.value instanceof CxPromise) {
          that.value.then(onFulfilled, onRejected);
        } else {
          try {
            resolve(onFulfilled(that.value));
          } catch (e) {
            reject(e);
          }
        }
      });
      this.rejectedCb.push(() => {
        try {
          reject(onRejected(that.value));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
};

CxPromise.resolve = function (value) {
  return new CxPromise(resolve => {
    resolve(value);
  });
};

CxPromise.reject = function (reason) {
  return new CxPromise((resolve, reject) => {
    reject(reason);
  });
};

new CxPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(3);
  }, 300);
})
  .then(res => {
    console.log('res', res);
    return '32';
  })
  .then(x => {
    console.log('x', x);
  });
