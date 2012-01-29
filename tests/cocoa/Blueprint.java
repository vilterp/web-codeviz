// TODO: think about EVENTS (bubbling, etc)

class Rect {
  
  public Rect(int x, int y, int width, int height)
  
  boolean containsPoint(Point pt)
  Maybe<Rect> getOverlap(Rect other)
  boolean overlaps(Rect other)
  
  void strokeTo(Context ctx)
  void fillTo(Context ctx)
  
}

class Point {
  
  public Point(int x, int y)
  
}

abstract class View {
  
  Context getCtx()  
  void draw(Rect visible)
  
}

class CodeViz extends View {
  
  StackView stackView;
  ThumbnailScroller scroller;
  
  void draw(Rect visible) { // always the whole thing...
    
  }
  
}

class ThumbnailScroller extends View {
  
  ImageData thumbnail;
  Rect viewport;
  
  Codeviz parent;
  
  void draw(Rect visible) {
    // draw Thumbnail (putImageData)
    // draw viewport (strokeRect)
  }
  
  void setViewport(Rect newViewport) {
    viewport = newViewport;
  }
  
  void setThumbnail(ImageData newThumbnail) {
    thumbnail = newThumbnail;
  }
  
}

class StackView extends View {
  
  List<CallView> callViews;
  
  void draw(Rect visible)
  
  void reflow()
  
  ImageData getThumbnail()
  
}

class CallView extends View {
  
  Rect dims;
  String callText;
  String retText;
  
  // what about local var timeline??
  
  CallView parent;
  
  List<LineRecord> record;  
  Maybe<Int> curRecordPos;
  
  void draw(Rect visible) {
    // draw & fill rect (based on curRecordPos)
    // draw calltext & rettext based on visible rect
  }
  
  void setRect(Rect newDims) { // called by layout
    dims = newDims;
  }
  
}

class LineRecord {
  
  int line;
  List<ExecEvent> events;
  
}

abstract class ExecEvent {}

class PrintEvent extends ExecEvent {
  
  String output;
  
}

class CallEvent extends ExecEvent {
  
  CallView call;
  
}
