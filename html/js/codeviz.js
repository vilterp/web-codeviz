var Codeviz = App.extend({
  
  init: function(canvas, callobj) {
    this._super(canvas)
    // some fudge pixels...
    this.setTopLevelView(new CallStackView(this.ctx, new Rect(0, 0, canvas.width, canvas.height),
                                                                                  null, callobj))
    this.resizeCanvas(this.topLevelView.frame.getSize())
    this.topLevelView.frame.width += 2
    this.topLevelView.frame.height += 2
    this.topLevelView.render()
  },
  
  toString: function() {
    return 'Codeviz'
  },
  
})

var CallStackView = View.extend({
  
  init: function(ctx, frame, superview, callobj) {
    this._super(ctx, frame, superview)
    this.callobj = callobj
    var maxdims = this.layout(callobj) // creates subviews, modifies this.subviews
    this.frame.width = maxdims.width
    this.frame.height = maxdims.height
  },
  
  toString: function() {
    return 'CallStackView'
  },
  
  layout: function(callobj) {
    
    var ARROW = '\u2192'
    var MARGIN = 5
    var FONT_SIZE = 10
    var HEIGHT = FONT_SIZE + MARGIN * 2
    var CALL_SPACING = HEIGHT + 10
    
    var FONT_STYLE = new TextStyle(FONT_SIZE, 'monospace', 'black')
    
    // these are for inside ly()
    var ctx = this.ctx
    var subviews = this.subviews
    var superview = this
    
    function ly(startx, starty, call) {
      var ct = call.func + '(' + pythonstuff.repr(call.args).slice(1, -1) + ')'
      var rt = ' ' + ARROW + ' ' + pythonstuff.repr(call.retval)
      var ctwidth = ctx.measureText(ct).width
      var rtwidth = ctx.measureText(rt).width
      var minwidth = ctwidth + rtwidth + MARGIN * 2
      var x = startx + CALL_SPACING
      var y = starty + HEIGHT
      var maxsize = new Size(x, y)
      for (var i=0; i < call.subevents.length; i++) {
        var evt = call.subevents[i]
        if(evt.type == 'call') {
          var newsize = ly(x, y, evt)
          x = newsize.width
          if(newsize.height > maxsize.height) {
            maxsize = newsize
          } else {
            maxsize = new Size(x, maxsize.height)
          }
          x += CALL_SPACING
        }
      }
      var lywidth = x - startx
      var width = Math.max(lywidth, minwidth)
      var maxx = startx + width
      var frame = new Rect(startx, starty, width, HEIGHT)
      var callview = new CallView(ctx, frame, superview)
      
      var ctframe = new Rect(MARGIN, MARGIN, ctwidth, FONT_SIZE)
      var calltext = new TextView(ctx, ctframe, callview, ct, FONT_STYLE)
      callview.setCallText(calltext)
      
      var rtframe = new Rect(width - MARGIN - rtwidth, MARGIN, rtwidth, FONT_SIZE)
      var rettext = new TextView(ctx, rtframe, callview, rt, FONT_STYLE)
      callview.setRetText(rettext)
      
      subviews.push(callview)
      
      return new Size(maxx, maxsize.height)
    }
    
    this.ctx.save()
    FONT_STYLE.setStyle(this.ctx)
    var maxdims = ly(CALL_SPACING, 0, callobj)
    this.ctx.restore()
    
    maxdims.width += CALL_SPACING
    maxdims.height += HEIGHT
    return maxdims
  },
  
  draw: function() {
    // just let View#render draw subviews
  }
  
})

var CallView = View.extend({
  
  init: function(ctx, frame, superview) {
    this._super(ctx, frame, superview)
    this.mousedOver = false
  },
  
  toString: function() {
    return 'CallView[' + this.calltext + ']'
  },
  
  setCallText: function(ct) {
    this.calltext = ct.text
    this.subviews.push(ct)
  },
  
  setRetText: function(rt) {
    this.rettext = rt.text
    this.subviews.push(rt)
  },
  
  onMouseIn: function(pt) {
    this.mousedOver = true
    this.render()
  },
  
  onMouseOut: function(pt) {
    this.mousedOver = false
    this.render()
  },
  
  onClick: function(pt) {
  },
  
  draw: function() {
    // fill
    if(this.mousedOver) {
      this.ctx.fillStyle = 'red'
    } else {
      this.ctx.fillStyle = 'white'
    }  
    this.ctx.fillRect(0, 0, this.frame.width, this.frame.height)
    // stroke
    this.ctx.strokeStyle = 'black'
    this.ctx.strokeRect(0, 0, this.frame.width, this.frame.height)
  }
  
})

var TextStyle = Obj.extend({
  
  init: function(size, font, fill) {
    this.size = size
    this.font = font
    this.fill = fill
    this.fontString = size + 'px ' + font
  },
  
  toString: function() {
    return 'TextStyle'
  },
  
  setStyle: function(ctx) {
    ctx.fillStyle = this.fill
    ctx.font = this.fontString
  }
  
})

var TextView = View.extend({
  
  init: function(ctx, frame, superview, text, style) {
    this._super(ctx, frame, superview)
    this.text = text
    this.style = style
  },
  
  toString: function() {
    return 'TextView("' + this.text + '")'
  },
  
  draw: function() {
    this.ctx.textBaseline = 'top'
    this.style.setStyle(this.ctx)
    this.ctx.fillText(this.text, 0, 0)
  }
  
})
