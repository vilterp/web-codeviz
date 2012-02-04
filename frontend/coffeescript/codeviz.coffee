jQuery ->
  
  class PythonProgram extends Backbone.Model
    
    initialize: ->
      this.on 'change:source', -> this.set 'state', 'changed'
    
    defaults:
      title: 'test'
      source: "print 'hello world'"
      state: 'changed' # changed -> executing -> [ executed | failed ]
      call_tree: null
    
    # send code to server for execution, update @call_tree with response
    execute: ->
      this.set 'state', 'executing'
      jQuery.post('/exec',
                  {
                    source: this.get 'source'
                    title: this.get 'title'
                  },
                  (data) =>
                    if data.type == 'success'
                      this.set 'call_tree', data.events
                      this.set 'state', 'executed'
                      # TODO: SHOULD NOT BE HERE
                      view = new CallTreeView model: this, el: $('#viz-container')
                      view.render()
                    else
                      alert "Syntax error: line #{data.lineno}: #{data.msg}"
                      this.set 'state', 'failed'
                  'json')
  
  
  class EditorView extends Backbone.View
    
    initialize: ->
      # maintain pointers to elements
      @titleEl = $('#prog-title')
      @lineCount = $('#line-count')
      @spinnerEl = $('#spinner')
      @execButton = $('#exec-button')
      @stateIndicator = $('#state-indicator')
      # initialize ace (syntax highlighting)
      @editor = ace.edit('source')
      @editor.setTheme 'ace/theme/twilight'
      PythonMode = require('ace/mode/python').Mode;
      @editor.getSession().setMode(new PythonMode());
      @editor.getSession().on 'change', =>
        @model.set 'source', @editor.getSession().getValue()
      # put default vals into DOM
      @titleEl.val(@model.get 'title')
      @editor.getSession().setValue(@model.get 'source')
      # setup bindings
      @model.on 'change', this.render, this
    
    render: ->
      # set document title
      title = @model.get 'title'
      document.title = if title.length == 0 then 'Codeviz' else title + ' | Codeviz'
      # update line count
      lines = @model.get('source').split('\n').length
      @lineCount.html("#{lines} #{if lines == 1 then 'line' else 'lines'}")
      # reflect executing state
      @stateIndicator.text(@model.get 'state')
      if @model.get('state') == 'executing'
        @spinnerEl.show()
        @execButton.text('Executing...')
                   .attr('disabled', true)
      else
        @spinnerEl.hide()
        @execButton.text('Execute')
                   .attr('disabled', false)
      
    
    el: '#editor'
    
    events:
      'click #exec-button': ->
        @model.execute()
      'keyup #prog-title': ->
        @model.set('title', @titleEl.val())
  
  
  # the point of this whole exercise...
  class CallTreeView extends Backbone.View
    
    render: ->
      @$el.text(JSON.stringify(@model))
    
  
  #initialize
  program = new PythonProgram
  editor = new EditorView model: program
  editor.render()
