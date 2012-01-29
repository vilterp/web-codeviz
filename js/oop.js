// more or less taken from http://ejohn.org/blog/simple-javascript-inheritance/

(function(){
  
  var initializing = false

  this.Obj = function() {} // superclass

  Obj.extend = function(methods) {

    // create the new class's prototype object

    var _super = this.prototype

    initializing = true
    var prototype = new this
    initializing = false

    for(var mname in methods) {
      var overwriting = typeof methods[mname] == 'function' && typeof _super[mname] == 'function'
      if(overwriting) {
        prototype[mname] = (function(name, fn){
          return function() {
            var tmp = this._super
            this._super = _super[name]
            var ret = fn.apply(this, arguments)
            this._super = tmp
            return ret
          }
        })(mname, methods[mname])
      } else {
        prototype[mname] = methods[mname]
      }
    }

    // create the constructor (dummy which calls init)

    function NewObj() {
      if(!initializing && this.init)
        this.init.apply(this, arguments)
    }

    // link 'em together & return

    NewObj.prototype = prototype
    NewObj.prototype.constructor = NewObj
    NewObj.extend = arguments.callee

    return NewObj
    
  }
  
})()
