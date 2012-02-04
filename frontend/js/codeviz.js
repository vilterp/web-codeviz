(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  jQuery(function() {
    var CallTreeView, EditorView, PythonProgram, editor, program;
    PythonProgram = (function(_super) {

      __extends(PythonProgram, _super);

      function PythonProgram() {
        PythonProgram.__super__.constructor.apply(this, arguments);
      }

      PythonProgram.prototype.initialize = function() {
        return this.on('change:source', function() {
          return this.set('state', 'changed');
        });
      };

      PythonProgram.prototype.defaults = {
        title: 'test',
        source: "print 'hello world'",
        state: 'changed',
        call_tree: null
      };

      PythonProgram.prototype.execute = function() {
        var _this = this;
        this.set('state', 'executing');
        return jQuery.post('/exec', {
          source: this.get('source'),
          title: this.get('title')
        }, function(data) {
          var view;
          if (data.type === 'success') {
            _this.set('call_tree', data.events);
            _this.set('state', 'executed');
            view = new CallTreeView({
              model: _this,
              el: $('#viz-container')
            });
            return view.render();
          } else {
            alert("Syntax error: line " + data.lineno + ": " + data.msg);
            return _this.set('state', 'failed');
          }
        }, 'json');
      };

      return PythonProgram;

    })(Backbone.Model);
    EditorView = (function(_super) {

      __extends(EditorView, _super);

      function EditorView() {
        EditorView.__super__.constructor.apply(this, arguments);
      }

      EditorView.prototype.initialize = function() {
        var PythonMode,
          _this = this;
        this.titleEl = $('#prog-title');
        this.lineCount = $('#line-count');
        this.spinnerEl = $('#spinner');
        this.execButton = $('#exec-button');
        this.stateIndicator = $('#state-indicator');
        this.editor = ace.edit('source');
        this.editor.setTheme('ace/theme/twilight');
        PythonMode = require('ace/mode/python').Mode;
        this.editor.getSession().setMode(new PythonMode());
        this.editor.getSession().on('change', function() {
          return _this.model.set('source', _this.editor.getSession().getValue());
        });
        this.titleEl.val(this.model.get('title'));
        this.editor.getSession().setValue(this.model.get('source'));
        return this.model.on('change', this.render, this);
      };

      EditorView.prototype.render = function() {
        var lines, title;
        title = this.model.get('title');
        document.title = title.length === 0 ? 'Codeviz' : title + ' | Codeviz';
        lines = this.model.get('source').split('\n').length;
        this.lineCount.html("" + lines + " " + (lines === 1 ? 'line' : 'lines'));
        this.stateIndicator.text(this.model.get('state'));
        if (this.model.get('state') === 'executing') {
          this.spinnerEl.show();
          return this.execButton.text('Executing...').attr('disabled', true);
        } else {
          this.spinnerEl.hide();
          return this.execButton.text('Execute').attr('disabled', false);
        }
      };

      EditorView.prototype.el = '#editor';

      EditorView.prototype.events = {
        'click #exec-button': function() {
          return this.model.execute();
        },
        'keyup #prog-title': function() {
          return this.model.set('title', this.titleEl.val());
        }
      };

      return EditorView;

    })(Backbone.View);
    CallTreeView = (function(_super) {

      __extends(CallTreeView, _super);

      function CallTreeView() {
        CallTreeView.__super__.constructor.apply(this, arguments);
      }

      CallTreeView.prototype.render = function() {
        return this.$el.text(JSON.stringify(this.model));
      };

      return CallTreeView;

    })(Backbone.View);
    program = new PythonProgram;
    editor = new EditorView({
      model: program
    });
    return editor.render();
  });

}).call(this);
