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
  },
  
  addOffset: function(offset) {
    return new Point(this.x + offset.width, this.y + offset.height)
  },
  
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
  
  getSize: function() {
    return new Size(this.width, this.height)
  },
  
  getPos: function() {
    return new Point(this.x, this.y)
  },
  
  getOffset: function() {
    return new Size(this.x, this.y)
  },
  
  containsPoint: function(point) {
    return (point.x >= this.x && point.x <= (this.x + this.width)) &&
              (point.y >= this.y && point.y <= (this.y + this.height))
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
  
  
  strokeTo: function(ctx) {
    ctx.strokeRect(this.x, this.y, this.width, this.height)
  },
  
  
  fillTo: function(ctx) {
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
  
})

var App = Obj.extend({
  
  init: function(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.offset = this.getRealOffset(this.canvas)
    // set up event handlers
    this.canvas.onmousemove = (function(fn, scope){
      return function(evt) {
        fn.call(scope, evt)
      }
    })(this.onMouseMove, this)
    this.canvas.onclick = (function(fn, scope){
      return function(evt) {
        fn.call(scope, evt)
      }
    })(this.onClick, this)
  },
  
  setTopLevelView: function(tlv) {
    this.topLevelView = tlv
    this.mousedOverView = this.topLevelView
  },
  
  getRealOffset: function(elem) {
    var p = elem.offsetParent
    if(p == null) {
      return new Size(0, 0)
    } else {
      var os = this.getRealOffset(p)
      return new Size(os.width + elem.offsetLeft, os.height + elem.offsetTop)
    }
  },
  
  resizeCanvas: function(newsize) {
    this.canvas.width = newsize.width
    this.canvas.height = newsize.height
  },
  
  onMouseMove: function(evt) {
    var pt = new Point(evt.pageX, evt.pageY).subtractOffset(this.offset)
    var tmp = pt
    var view = this.mousedOverView.superview
    while(view != null) {
      pt = pt.subtractOffset(view.frame.getOffset())
      view = view.superview
    }
    // if it's still in the moused over view
    if(this.mousedOverView.frame.containsPoint(pt)) {
      pt = pt.subtractOffset(this.mousedOverView.frame.getOffset())
      this.mousedOverView = this.mousedOverView.mouseOverDeepestView(pt)
    } else {
      this.mousedOverView.onMouseOut()
      view = this.mousedOverView.superview
      while(view != null) {
        var opt = pt
        pt = pt.addOffset(view.frame.getOffset())
        if(view.frame.containsPoint(pt)) {
          break
        } else {
          view.onMouseOut()
          view = view.superview
        }
      }
      if(view == null) {
        console.log(tmp)
      }
      this.mousedOverView = view.mouseOverDeepestView(pt)
    }
  },
  
  onClick: function(evt) {
    var pt = new Point(evt.pageX, evt.pageY).subtractOffset(this.offset)
    var view = this.mousedOverView
    while(view != null) {
      pt = pt.subtractOffset(view.frame.getOffset())
      view = view.superview
    }
    this.mousedOverView.onClick(pt)
  }
  
})

var View = Obj.extend({
  
  init: function(ctx, frame, superview) {
    this.frame = frame // Rect
    this.ctx = ctx // Context
    this.superview = superview // View
    this.subviews = [] // [View]
  },
  
  render: function() {
    // prepare context to draw (translate & clip)
    this.ctx.save()
    this.ctx.translate(this.frame.x, this.frame.y)
    this.ctx.beginPath()
    this.ctx.rect(0, 0, this.frame.width, this.frame.height)
    this.ctx.closePath()
    this.ctx.clip()
    // draw this
    this.draw()
    // render subviews
    for (var i=0; i < this.subviews.length; i++) {
      this.subviews[i].render()
    }
    // restore context
    this.ctx.restore()
  },
  
  setSuperview: function(sv) {
    this.superview = superview
  },
  
  addSubview: function(v) {
    this.subviews.push(v)
  },
  
  hasSubviews: function() {
    return this.subviews.length > 0
  },
  
  mouseOverDeepestView: function(pt) {
    var view = this
    while(view.hasSubviews()) {
      for(var i=0; i < view.subviews.length; i++) {
        var subview = view.subviews[i]
        if(subview.frame.containsPoint(pt)) {
          pt = pt.subtractOffset(subview.frame.getOffset())
          subview.onMouseIn()
          view = subview
          break
        }
      }
      break
    }
    return view
  },
  
  onMouseIn: function() {
    // console.log('mouse in', this.toString())
  },
  
  onMouseOut: function() {
    // console.log('mouse out', this.toString())
  },
  
  onClick: function(pt) {
    // console.log('clicked:', this.toString(), pt)
  },
  
})
