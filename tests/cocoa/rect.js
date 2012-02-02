// @requires: oop.js

var Point = Obj.extend({
  
  init: function(x, y) {
    this.x = x
    this.y = y
  },
  
  toString: function() {
    return 'Point(' + this.x + ', ' + this.y + ')'
  },
  
  subtractOffset: function(offset) {
    return new Point(this.x - offset.width, this.y - offset.height)
  }
  
})

var Size = Obj.extend({
  
  init: function(width, height) {
    this.width = width
    this.height = height
  },
  
  toString: function() {
    return 'Size(' + this.width + ', ' + this.height + ')'
  }
  
})

var Rect = Obj.extend({
  
  init: function(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  },
  
  toString: function() {
    return 'Rect(' + [this.x, this.y, this.width, this.height].join(', ') + ')'
  },
  
  
  containsPoint: function(point) {
    return (point.x > this.x && point.x < (this.x + this.width)) &&
              (point.y > this.y && point.y < (this.y + this.height))
  },
  
  
  getOverlap: function(other) {
    // TODO: this can probably be optimized / written in less code...
    function getLineOverlap(a1, a2, b1, b2) { // (Int, Int, Int, Int) => [Int, Int]
      if(a1 < b1) {
        if(a2 < b1) {
          return null
        } else if(a2 == b1) {
          return [a2, 0]
        } else if(a2 < b2) {
          return [b1, a2 - b1]
        } else {
          return [b1, b2 - b1]
        }
      } else if(a1 > b1) {
        if(b2 < a1) {
          return null
        } else if(b2 == a1) {
          return [a1, 0]
        } else if(b2 < a2) {
          return [a1, b2 - a1]
        } else {
          return [a1, a2 - a1]
        }
      }
    }
    var xOverlap = getLineOverlap(this.x, this.x + this.width, other.x, other.x + other.width)
    if(xOverlap == null) {
      return null
    } else {
      var yOverlap = getLineOverlap(this.y, this.y + this.height, other.y, other.y + other.height)
      if(yOverlap == null) {
        return null
      } else {
        return new Rect(xOverlap[0], yOverlap[0], xOverlap[1], yOverlap[1])
      }
    }
  },
  
  getOffset: function() {
    return new Size(this.x, this.y)
  },
  
  strokeTo: function(ctx) {
    ctx.strokeRect(this.x, this.y, this.width, this.height)
  },
  
  fillTo: function(ctx) {
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
  
})
