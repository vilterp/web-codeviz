pythonstuff = {
  
  repr: function(obj) {
    var repr = arguments.callee
    if(obj == null) {
      return 'None'
    } else if(typeof(obj) == 'boolean') {
      if(obj) {
        return 'True'
      } else {
        return 'False'
      }
    } else if(obj instanceof Array) {
      var res = '['
      for (var i=0; i < obj.length; i++) {
        res += repr(obj[i])
        if(i != obj.length - 1) {
          res += ', '
        }
      }
      return res + ']'
    } else if(typeof(obj) == 'string') {
      var res = "'"
      for (var i=0; i < obj.length; i++) {
        var c = obj[i]
        if(c == '\n') {
          res += '\\n'
        } else if(c == '\t') {
          res += '\\t'
        } else if(c == "'") {
          res += "\\'"
        } else {
          res += c
        }
      }
      return res + "'"
    } else if(typeof(obj) == 'number') {
      return String(obj)
    } else {
      var items = []
      for(var key in obj) {
        var item = ''
        item += repr(key)
        item += ': '
        item += repr(obj[key])
        items.push(item)
      }
      return '{' + items.join(', ') + '}'
    }
  }
  
}
