load('oop.js')


var Person = Obj.extend({
  init: function(isDancing){
    this.dancing = isDancing;
  },
  dance: function(){
    return this.dancing;
  }
});

var Ninja = Person.extend({
  init: function(){
    this._super( false );
  },
  dance: function(){
    // Call the inherited version of dance()
    return this._super();
  },
  swingSword: function(){
    return true;
  }
});

var p = new Person(true);
print(p.dance()); // => true

var n = new Ninja();
print(n.dance()); // => false
print(n.swingSword()); // => true

// Should all be true
print(p instanceof Person && p instanceof Obj &&
n instanceof Ninja && n instanceof Person && n instanceof Obj)



// var Person = Obj.extend({
//   init: function(name, age) {
//     this.name = name
//     this.age = age
//   },
//   sayHi: function() {
//     print("Hi, I'm " + this.name + " and I'm " + this.age + " years old")
//   }
// })
// var p = new Person('Pete', 18)
// p.sayHi()
// 
// var SubPerson = Person.extend({
// 
//   newMethod: function(x) {
//     return x + 2
//   },
//   
//   sayHi: function() {
//     this._super()
//     print('saying hi again')
//   }
// 
// })
// var sp = new SubPerson('Paul', 49)
// print(sp.newMethod(8))
// sp.sayHi()
