/**
 * 参考链接 https://github.com/mqyqingfeng/Blog/issues/13
 */

function objectFactory() {
  const obj = new Object();
  // 取到构造函数
  const Constructor = [].shift.call(arguments);
  obj.__proto__ = Constructor.prototype;

  const ret = Constructor.apply(obj, arguments);
  // 如果返回一个对象  new Fn() 直接返回ret
  return typeof ret === 'object' ? ret : obj;
}

function Man(name, age) {
  this.name = name;
  this.age = age;
  this.habit = 'Games';
}

Man.prototype.strength = 60;

Man.prototype.sayYourName = function () {
  console.log('I am ' + this.name);
};

var person = objectFactory(Man, 'Kevin', '18');

console.log(person.name); // Kevin
console.log(person.habit); // Games
console.log(person.strength); // 60

person.sayYourName(); // I am Kevin
