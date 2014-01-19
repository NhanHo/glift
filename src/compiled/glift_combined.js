/**
 * @preserve Glift: A Responsive Javascript library for the game Go.
 *
 * @copyright Josh Hoak
 * @license MIT License (see LICENSE.txt)
 * --------------------------------------
 */
(function() {
var glift = glift || window.glift || {};
if (window) {
  // expose Glift as a global.
  window.glift = glift;
}
})(window);
glift.global = {
  /**
   * Semantic versioning is used to determine API behavior.
   * See: http://semver.org/
   * Currently in alpha.
   */
  version: '0.8.6',
  debugMode: false,
  // Options for performanceDebugLevel: none, fine, info
  performanceDebugLevel: 'none',
  // Map of performance timestamps.
  perf: {},
  // The active registry.  Used to determine who has 'ownership' of key-presses.
  // The problem is that key presses have to be captured in a global scope (or
  // at least at the <body> level.  Unfortunate.
  // (not used yet).
  active: {}
};
glift.util = {
  logz: function(msg) {
    var modmsg = msg;
    if (glift.util.typeOf(msg) === "array" ||
        glift.util.typeOf(msg) === "object") {
      modmsg = JSON.stringify(msg);
    }
    console.log("" + modmsg);
    return glift.util.none; // default value to return.
  },

  /**
   * Via Crockford / StackOverflow: Determine the type of a value in robust way.
   */
  typeOf: function(value) {
    var s = typeof value;
    if (s === 'object') {
      if (value) {
        if (value instanceof Array) {
          s = 'array';
        }
      } else {
        s = 'null';
      }
    }
    return s;
  },

  // Array utility functions
  // is_array is Taken from JavaScript: The Good Parts
  isArray: function (value) {
    return value && typeof value === 'object' && value.constructor === Array;
  },

  /**
   * Test whether two arrays are (shallowly) equal.  We only test references on
   * the elements of the array.
   */
  arrayEquals: function(arr1, arr2) {
    if (arr1 === undefined || arr2 == undefined) return false;
    if (arr1.length !== arr2.length) return false;
    for (var i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  },

  /**
   * Checks to make sure a number is inbounds.  In other words, whether a number
   * is between 0 (inclusive) and bounds (exclusive).
   */
  inBounds: function(num, bounds) {
    return ((num < bounds) && (num >= 0));
  },

  // Checks to make sure a number is out-of-bounds
  // returns true if a number is outside a bounds (inclusive) or negative
  outBounds: function(num, bounds) {
    return ((num >= bounds) || (num < 0));
  },

  intersection: function(set1, set2) {
    var out = {};
    for (var key in set1) {
      if (set2[key] !== undefined) {
        out[key] = 1;
      }
    }
    return out;
  },

  // Init a key if the obj is undefined at the key with the given value.
  // Return the value
  getKeyWithDefault: function(obj, key, value) {
    if (obj[key] === undefined) {
      obj[key] = value;
    }
    return obj[key];
  },

  /*
   * Get the size of an object
   */
  sizeOf: function(obj) {
    var size = 0;
    for (var key in obj) {
      size += 1;
    }
    return size;
  },

  /**
   * Set methods in the base object.  Usually used in conjunction with beget.
   */
  setMethods: function(base, methods) {
    for (var key in methods) {
      base[key] = methods[key].bind(base);
    }
    return base;
  },

  /**
   * A utility method -- for prototypal inheritence.
   */
  beget: function (o) {
    var F = function () {};
    F.prototype = o;
    return new F();
  },

  /**
   * Simple Clone creates copies for all string, number, boolean, date and array
   * types.  It does not copy functions (which it leaves alone), nor does it
   * address problems with recursive objects.
   *
   * Taken from stack overflow, with some modification to handle functions and
   * to take advantage of util.typeOf above.  Note: This does not handle
   * recursive objects gracefully.
   *
   * Reference:
   * http://stackoverflow.com/questions/728360/
   * most-elegant-way-to-clone-a-javascript-object
   */
  simpleClone: function(obj) {
    // Handle immutable types (null, Boolean, Number, String) and functions.
    if (glift.util.typeOf(obj) !== 'array' &&
        glift.util.typeOf(obj) !== 'object') return obj;
    if (obj instanceof Date) {
      var copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }
    if (glift.util.typeOf(obj) === 'array') {
      var copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = glift.util.simpleClone(obj[i]);
      }
      return copy;
    }
    if (glift.util.typeOf(obj) === 'object') {
      var copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] =
            glift.util.simpleClone(obj[attr]);
      }
      return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
  }
};

// A better logging solution.
glift.util.debugl = function(msg) {
  if (glift.debugOn) {
    glift.util.log(msg);
  }
};

// A better logging solution.
glift.util.log = function(msg) {
  var modmsg = msg;
  if (glift.util.typeOf(msg) === "array" ||
      glift.util.typeOf(msg) === "object") {
    modmsg = JSON.stringify(msg);
  }
  if (console !== undefined && console.log !== undefined) {
    console.log(msg);
  }
};

(function () {
// Private None Class
var None = function() {
  this.type = "none";
};
None.prototype = {
  toString: function() {
    return "None";
  }
};

// We only need to create one instance of None.
glift.util.none = new None();
})();
glift.util.colors = {
  isLegalColor: function(color) {
    return color === glift.enums.states.BLACK ||
        color === glift.enums.states.WHITE ||
        color === glift.enums.states.EMPTY;
  },

  oppositeColor: function(color) {
    if (color === glift.enums.states.BLACK) return glift.enums.states.WHITE;
    if (color === glift.enums.states.WHITE) return glift.enums.states.BLACK;
    else return color;
  }
};
// Glift: A Go Studying Program
// Copyright (c) 2011-2013, Josh <jrhoak@gmail.com>
// Code licensed under the MIT License
glift.enums = {
  // Also sometimes referred to as colors. Might be good to change back
  states: {
    BLACK: 'BLACK',
    WHITE: 'WHITE',
    EMPTY: 'EMPTY'
  },

  boardAlignments: {
    TOP: "TOP",
    RIGHT: "RIGHT",
    CENTER: "CENTER"
  },

  directions: {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    TOP: 'TOP',
    BOTTOM: 'BOTTOM'
  },

  // The directions should work with the boardRegions.
  boardRegions: {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    TOP: 'TOP',
    BOTTOM: 'BOTTOM',
    TOP_LEFT: 'TOP_LEFT',
    TOP_RIGHT: 'TOP_RIGHT',
    BOTTOM_LEFT: 'BOTTOM_LEFT',
    BOTTOM_RIGHT: 'BOTTOM_RIGHT',
    // TODO(kashomon): Perhaps remove these last two, or at least 'AUTO'
    ALL: 'ALL',
    AUTO: 'AUTO'
  },


  controllerMessages: {
    CONTINUE: 'CONTINUE',
    DONE: 'DONE',
    FAILURE: 'FAILURE'
  },

  marks: {
    CIRCLE: 'CIRCLE',
    SQUARE: 'SQUARE',
    TRIANGLE: 'TRIANGLE',
    XMARK: 'XMARK',
    STONE_MARKER: 'STONE_MARKER',
    // These last three all have to do with Labels.
    // TODO(kashomon): Consolidate these somehow.
    LABEL: 'LABEL',
    VARIATION_MARKER: 'VARIATION_MARKER',
    CORRECT_VARIATION: 'CORRECT_VARIATION'
  },

  problemResults: {
    CORRECT: 'CORRECT',
    INCORRECT: 'INCORRECT',
    INDETERMINATE: 'INDETERMINATE',
    FAILURE: 'FAILURE' // i.e., none of these (couldn't place stone).
  },

  displayDataTypes: {
    PARTIAL: 'PARTIAL',
    FULL: 'FULL'
  },

  /**
   * Used to create svg element Ids.  The enum values are slightly modified to
   * be compatible with being class / id names.
   */
  svgElements: {
    SVG: 'svg',
    BOARD: 'board',
    BOARD_LINE: 'board_line',
    BOARD_LINE_CONTAINER: 'board_line_container',
    BUTTON: 'button',
    BUTTON_CONTAINER: 'button_container',
    MARK: 'mark',
    MARK_CONTAINER: 'mark_container',
    GLIFT_ELEMENT: 'glift_element',
    STARPOINT: 'starpoint',
    STARPOINT_CONTAINER: 'starpoint_container',
    STONE: 'stone',
    STONE_CONTAINER: 'stone_container',
    STONE_SHADOW: 'stone_shadow',
    STONE_SHADOW_CONTAINER: 'stone_shadow_container',
    GUIDE_LINE: 'guide_line',

    // Icon-bar specific enums
    ICON: 'icon',
    ICON_CONTAINER: 'icon_container',
    TEMP_ICON: 'temp_icon',
    TEMP_TEXT: 'temp_text',
    TEMP_ICON_CONTAINER: 'temp_icon_container'
  },

  showVariations: {
    ALWAYS: 'ALWAYS',
    NEVER: 'NEVER',
    MORE_THAN_ONE: 'MORE_THAN_ONE'
  },

  /**
   * Widget types.  These tell the widget manager what widgets to create.
   */
  widgetTypes: {
    CORRECT_VARIATIONS_PROBLEM: 'CORRECT_VARIATIONS_PROBLEM',
    EXAMPLE: 'EXAMPLE',
    GAME_VIEWER: 'GAME_VIEWER',
    REDUCED_GAME_VIEWER: 'REDUCED_GAME_VIEWER',
    STANDARD_PROBLEM: 'STANDARD_PROBLEM',
    BOARD_EDITOR: 'BOARD_EDITOR'
  },

  boardComponents: {
    BOARD: 'BOARD',
    COMMENT_BOX: 'COMMENT_BOX',
    EXTRA_ICONBAR: 'EXTRA_ICONBAR',
    ICONBAR: 'ICONBAR'
  }
};
(function() {
glift.errors = {};

glift.errors.ParseError = function(message) {
  this.name = "ParseError";
  this.message = message || "";
};
glift.errors.ParseError.prototype = new Error();

})();
glift.util._IdGenerator = function(seed) {
  this.seed  = seed || 0;
};

glift.util._IdGenerator.prototype = {
  next: function() {
    var out = this.seed + "";
    this.seed += 1
    return out;
  }
};

glift.util.idGenerator = new glift.util._IdGenerator(0);
glift.keyMappings = {
  _nameToCode: {
    ARROW_LEFT:37,
    ARROW_UP:38,
    ARROW_RIGHT:39,
    ARROW_:40,
    BACKSPACE:8,
    ENTER:13,
    SHIFT:16,
    FORWARD_SLASH:191,
    A:65,
    B:66,
    C:67,
    D:68,
    E:69,
    F:70,
    G:71,
    H:72,
    I:73,
    J:74,
    K:75
    // TODO(kashomon): Complete this.
  },

  nameToCode: function(name) {
    return glift.keyMappings._nameToCode[name];
  },

  _codeToName: undefined, // lazilyDefined

  codeToName: function(keyCode) {
    if (glift.keyMappings._codeToName === undefined) {
      var out = {};
      for (var keyName in glift.keyMappings._nameToCode) {
        out[glift.keyMappings._nameToCode[keyName]] = keyName;
      }
      glift.keyMappings._codeToName = out;
    }
    return glift.keyMappings._codeToName[keyCode];
  }
};
glift.math = {
  abs: function(num) {
    if (num >= 0) return num;
    else return num * -1;
  },

  max: function(num1, num2) {
    if (num1 > num2) return num1;
    else return num2;
  },

  min: function(num1, num2) {
    if (num1 > num2) return num2;
    else return num1;
  },

  isEven: function(num1) {
    if ((num1 % 2) == 0) return true;
    else return false;
  },

  // Returns a random integer between min and max
  getRandomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};
glift.util.perfLog = function(msg) {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'none') {
    return;
  }
  var time = glift.util.perfTime();
  var lastMajor = glift.global.perf.lastMajor;
  var last = glift.global.perf.last;
  console.log("Since Major Record: " + (time - lastMajor + "ms. " + msg));
  if (glift.global.performanceDebugLevel === 'fine') {
    console.log("  Since Last Record: " + (time - last + "ms. " + msg));
  }
  glift.global.perf.last = time;
};

glift.util.majorPerfLog = function(msg) {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'none') {
    return;
  }
  var time = glift.util.perfTime();
  glift.util.perfLog(msg);
  glift.global.perf.lastMajor = time;
};

glift.util.perfDone = function() {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'none') {
    return;
  }
  var time = glift.util.perfTime();
  var first = glift.global.perf.first;
  var lastMajor = glift.global.perf.lastMajor;
  console.log("---Performance Test Complete---");
  console.log("Since Beginning: " + (time - first) + 'ms.')
};

glift.util.perfInit = function() {
  if (glift.global.performanceDebugLevel === undefined ||
      glift.global.performanceDebugLevel === 'none') {
    return;
  }
  var t = glift.util.perfTime();
  glift.global.perf = { first: t, last: t, lastMajor: t};
};

glift.util.perfTime = function() {
  return (new Date()).getTime();
};
(function() {
/**
 * Create a point.  We no longer cache points
 */
glift.util.point = function(x, y) {
  return new GliftPoint(x, y);
};

glift.util.coordToString = function(x, y) {
  return x + ',' + y
};

glift.util.pointFromString = function(str) {
  try {
    var split = str.split(",");
    var x = parseInt(split[0]);
    var y = parseInt(split[1]);
    return glift.util.point(x, y);
  } catch(e) {
    throw "Parsing Error! Couldn't parse a point from: " + str;
  }
};

/**
 * Take an SGF point (e.g., 'mc') and return a GliftPoint.
 * SGFs are indexed from the Upper Left:
 *    _  _  _
 *   |aa ba ca ...
 *   |ab bb
 *   |.
 *   |.
 *   |.
 */
glift.util.pointFromSgfCoord = function(str) {
  if (str.length != 2) {
    throw "Unknown SGF Coord length: " + str.length;
  }
  var a = 'a'.charCodeAt(0)
  return glift.util.point(str.charCodeAt(0) - a, str.charCodeAt(1) - a);
};

glift.util.pointFromHash = function(str) {
  return glift.util.pointFromString(str);
};


/**
 * Basic Point class.
 *
 * As a historical note, this class has transformed more than any other class.
 * It was originally cached, with private variables and immutability.  However,
 * I found that all this protection was too tedious.
 */
var GliftPoint = function(xIn, yIn) {
  this._x = xIn;
  this._y = yIn;
};

GliftPoint.prototype = {
  x: function() { return this._x },
  y: function() { return this._y },
  equals: function(pt) {
    return this._x === pt.x() && this._y === pt.y();
  },

  clone: function() {
    return glift.util.point(this.x(), this.y());
  },

  /**
   * Returns an SGF coord, e.g., 'ab' for (0,1)
   */
  toSgfCoord: function() {
    return String.fromCharCode(this.x() + 97) +
        String.fromCharCode(this.y() + 97);
  },

  /**
   * Create the form used in objects.
   * TODO(kashomon): Replace with string form.  The term hash() is confusing and
   * it makes it seem like I'm converting it to an int (which I was, long ago).
   */
  hash: function() {
    return this.toString();
  },

  toString: function() {
    return glift.util.coordToString(this.x(), this.y());
  },

  /**
   * Return a new point that's a translation from this one
   */
  translate: function(x, y) {
    return glift.util.point(this.x() + x, this.y() + y);
  },

  log: function() {
    glift.util.logz(this.toString());
  }
};

})();
glift.util.regions = {
  getComponents: function(boardRegion) {
    var br = glift.enums.boardRegions,
        out = {};
    if (boardRegion === br.TOP_LEFT) {
      out[br.TOP] = 1;
      out[br.LEFT] = 1;
    } else if (boardRegion === br.TOP_RIGHT) {
      out[br.TOP] = 1;
      out[br.RIGHT] = 1;
    } else if (boardRegion === br.BOTTOM_LEFT) {
      out[br.BOTTOM] = 1;
      out[br.LEFT] = 1;
    } else if (boardRegion === br.BOTTOM_RIGHT) {
      out[br.BOTTOM] = 1;
      out[br.RIGHT] = 1;
    } else if (boardRegion == br.TOP) {
      out[br.TOP] = 1;
    } else if (boardRegion == br.BOTTOM) {
      out[br.BOTTOM] = 1;
    } else if (boardRegion == br.LEFT) {
      out[br.LEFT] = 1;
    } else if (boardRegion == br.RIGHT) {
      out[br.RIGHT] = 1;
    }
    return out;
  }
};
glift.testUtil = {
  ptlistToMap: function(list) {
    var outMap = {};
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (item.value !== undefined) {
        outMap[item.point.hash()] = item; // LABEL
      } else {
        outMap[item.hash()] = item; // point
      }
    }
    return outMap;
  },

  assertFullDiv: function(divId) {
    // really this is just non-empty...
    ok($('#' + divId).text().length > 0, "Div should contain contents");
  },

  assertEmptyDiv: function(divId) {
    var contents = $('#' + divId).text();
    ok(contents.length === 0,
        'Div should not contain contents. Instead was [' + contents + ']');
  }
};
glift.themes = {
  /**
   * Registered themes dict.
   *
   * TODO(kashomon): Make private?  Or perhaps denote with underscore.
   */
  registered: {},

  /**
   * Get a Theme based on ID
   *
   * Accepts a (case sensitive) ID and returns a COPY of the theme.
   */
  get: function(id) {
    var registered = glift.themes.registered;
    // TODO(kashomon): The else case should be undefined. glift.util.none was
    // probably a mistake.
    var rawTheme = !(id in registered) ? glift.util.none : registered[id];
    if (rawTheme === glift.util.none) {
      return rawTheme
    } else {
      return glift.themes.deepCopy({}, rawTheme, registered.DEFAULT);
    }
  },

  /**
   * Copy the theme data from the templateTheme to the themeBase. This is a true
   * deep copy of the properties.  We do this so that we don't pollute the base
   * themes with random data injected later, such as a GoBoard background image.
   *
   * This isn't smart about cycles or crazy things like that, but why would you
   * ever put something like that in a theme?
   *
   * The builder, which should start out an empyty object, is simply a place to
   * dump the copied theme data
   */
  deepCopy: function(builder, themeBase, templateTheme) {
    for (var key in templateTheme) {
      var type = glift.util.typeOf(templateTheme[key]);
      var copyFrom = templateTheme;
      if (themeBase[key] !== undefined) {
        copyFrom = themeBase;
      }

      switch(type) {
        case 'object':
          builder[key] = glift.themes.deepCopy(
              {}, themeBase[key] || {}, templateTheme[key]);
          break;
        case 'array':
          var set = {};
          var out = [];
          var arr = templateTheme[key].concat(themeBase[key] || []);
          for (var i = 0; i < arr.length; i++) {
            // if the items are objects, they won't currently be deep copied.
            var item = arr[i];
            if (item in set) {
              // do nothing
            } else {
              out.push(item);
              set[item] = 1;
            }
          }
          builder[key] = item;
          break;
        default:
          builder[key] = copyFrom[key];
      }
    }
    return builder;
  },

  /** Accepts a (case sensitive) theme ID and true if the theme exists and false
   * otherwise.
   */
  has: function(id) {
    var registered = glift.themes.registered;
    // This isn't scrictly correct because you can set a value in an object to
    // undefined.  However, this is pretty useless for our case (and will cause
    // problems anyway).
    return (id in registered);
  },

  /** Set the 'fill' for the go board to be an image
   * For a theme object. This generally assumes you're called 'get' so that you
   * have a copy of the base theme.
   */
  setGoBoardBackground: function(theme, value) {
    if (theme) {
      theme.board.imagefill = value
      // "url('" + value  + "')";
    } else {
      throw "Yikes! Not a theme: cannot set background image."
    }
  }
};
/**
 * The base theme.  All possible theme options must be specified here.
 */
glift.themes.registered.DEFAULT = {
  board: {
    fill: "#f5be7e",
    stroke: "#000000",
    // imagefill -- defined on loading
    'stroke-width': 1
  },

  starPoints: {
    sizeFraction: .15, // As a fraction of the spacing.
    fill: '#000000'
  },

  lines: {
    stroke: "#000000",
    'stroke-width': 0.5
  },

  stones: {
    shadows: {
      stroke: "none",
      fill: "none"
    },

    marks: {
      'font-family' : 'sans-serif'
    },

    EMPTY : {
      fill: 'blue',
      opacity: 0,
      marks: {
        fill: 'black',
        stroke: 'black',
        VARIATION_MARKER : {
          stroke: '#A22',
          fill: '#A22'
        },
        CORRECT_VARIATION : {
          stroke: '#22D',
          fill: '#22D'
        }
      }
    },

    BLACK : {
      fill: "black",
      opacity: 1,
      "stroke-width": 1, // The default value
      stroke: "black",
      marks: {
        fill: 'white',
        stroke: 'white',
        STONE_MARKER : {
          fill: '#CCF',
          opacity: 0.6
        }
      }
    },
    BLACK_HOVER : {
      fill: "black",
      opacity: 0.5
    },
    WHITE : {
      stroke: "black",
      fill: "white",
      opacity: 1,
      'stroke-width': 1, // The default value
      marks: {
        fill: 'black',
        stroke: 'black',
        STONE_MARKER : {
          fill: '#33F',
          opacity: 0.6
        }
      }
    },
    WHITE_HOVER : {
      fill: "white",
      stroke: "black",
      opacity: 0.5
    }
  },

  // TODO(kashomon): Add support for gradients.  This is non-trivial.  It
  // requires that we attach defs at the beginning of the SVG.  Not hard, but a
  // little bit of work.
  icons: {
    DEFAULT : {
      fill: "#0000AA",
      stroke: 'black'
      //fill: "90-#337-#55B"
    },
    DEFAULT_HOVER : {
      fill: 'cyan',
      stroke: 'black'
      //fill: "90-#337-#55D"
    }
  },

  defs: {
    // TODO(kashomon): Support SVG Defs
  }
};
glift.themes.registered.DEPTH = {
  stones: {
    shadows: {
      stroke: "none",
      fill: "#777"
    },
    "WHITE" : {
      stroke: "white",
      fill: "white"
    },
    "WHITE_HOVER" : {
      fill: "white",
      stroke: "white",
      opacity: 0.5
    }
  }
};
glift.themes.registered.MOODY = {
  board: {
    fill: "#777777"
  },
  stones: {
    "WHITE" : {
      stroke: "white",
      fill: "white"
    },
    "WHITE_HOVER" : {
      fill: "white",
      stroke: "white",
      opacity: 0.5
    }
  }
}
glift.themes.registered.TEXTBOOK = {
  board: {
    fill: "#FFFFFF"
  }
};
glift.themes.registered.TRANSPARENT = {
  board: {
    fill: "none"
  }
};
glift.displays = {
  /**
   * Create the display.  Delegates to board.create(...), which currently
   * creates an SVG based Go Board.
   */
  create: function(options) {
    glift.util.majorPerfLog("Before environment creation");
    var environment = glift.displays.environment.get(options);
    glift.util.majorPerfLog("After environment creation");
    var themeKey = options.theme || 'DEFAULT';
    var theme = glift.themes.get(themeKey); // Get a theme copy.
    if (options.goBoardBackground && options.goBoardBackground !== '') {
      glift.themes.setGoBoardBackground(theme, options.goBoardBackground);
    }
    return glift.displays.board.create(environment, themeKey, theme);
  }
};
glift.displays.bboxFromPts = function(topLeftPt, botRightPt) {
  return new glift.displays._BoundingBox(topLeftPt, botRightPt);
};

glift.displays.bboxFromDiv = function(divId) {
  return glift.displays.bbox(
      glift.util.point(0,0),
      $('#' + divId).width(),
      $('#' + divId).height());
};

glift.displays.bbox = function(topLeft, width, height) {
  return new glift.displays._BoundingBox(
      topLeft, glift.util.point(topLeft.x() + width, topLeft.y() + height));
};

/**
 * A bounding box, represented by a top left point and bottom right point.
 * This is how we represent space in glift, from GoBoards to sections allocated
 * for widgets.
 */
glift.displays._BoundingBox = function(topLeftPtIn, botRightPtIn) {
  this._topLeftPt = topLeftPtIn;
  this._botRightPt = botRightPtIn;
};

glift.displays._BoundingBox.prototype = {
  topLeft: function() { return this._topLeftPt; },
  botRight: function() { return this._botRightPt; },
  width: function() { return this.botRight().x() - this.topLeft().x(); },
  height: function() { return this.botRight().y() - this.topLeft().y(); },
  top: function() { return this.topLeft().y(); },
  left: function() { return this.topLeft().x(); },
  bottom: function() { return this.botRight().y(); },
  right: function() { return this.botRight().x(); },
  hwRatio: function() { return this.height() / this.width(); },

  /**
   * Find the center of the box. Returns a point representing the center.
   */
  center: function() {
    return glift.util.point(
      glift.math.abs((this.botRight().x() - this.topLeft().x()) / 2)
          + this.topLeft().x(),
      glift.math.abs((this.botRight().y() - this.topLeft().y()) / 2)
          + this.topLeft().y());
  },

  /**
   * Test to see if a point is contained in the bounding box.  Points on the
   * edge count as being contained.
   */
  contains: function(point) {
   return point.x() >= this.topLeft().x()
      && point.x() <= this.botRight().x()
      && point.y() >= this.topLeft().y()
      && point.y() <= this.botRight().y();
  },

  /**
   * Test to see if two bboxes are equal by comparing whether their points.
   */
  equals: function(other) {
    return other.topLeft() && this.topLeft().equals(other.topLeft()) &&
        other.botRight() && this.botRight().equals(other.botRight());
  },

  /**
   * Return a new bbox with the width and the height scaled by some fraction.
   * The TopLeft point is also scaled by the amount.
   */
  scale: function(amount) {
    var newHeight = this.height() * amount,
        newWidth = this.width() * amount,
        newTopLeft = glift.util.point(
            this.topLeft().x() * amount, this.topLeft().y() * amount);
    return glift.displays.bbox(newTopLeft, newWidth, newHeight);
  },

  toString: function() {
    return this.topLeft().toString() + ',' +  this.botRight().toString();
  },

  translate: function(dx, dy) {
    return glift.displays.bboxFromPts(
        glift.util.point(this.topLeft().x() + dx, this.topLeft().y() + dy),
        glift.util.point(this.botRight().x() + dx, this.botRight().y() + dy));
  },

  /**
   * Split this bbox into two or more divs across a horizontal axis.  The
   * variable bboxSplits is an array of decimals -- the box will be split via
   * these decimals.
   *
   * In other words, splits a box like so:
   *
   * X ->  X
   *       X
   *
   * Note: There is always one less split decimal specified, so that we don't
   * have rounding errors.In other words: [0.7] uses 0.7 and 0.3 for splits and
   * [0.7, 0.2] uses 0.7, 0.2, and 0.1 for splits.
   */
  hSplit: function(bboxSplits) {
    return this._splitBox('h', bboxSplits);
  },

  /**
   * Split this bbox into two or more divs across a horizontal axis.  The
   * variable bboxSplits is an array of decimals -- the box will be split via
   * these decimals.  They must sum to 1, or an exception is thrown.
   *
   * In other words, splits a box like so:
   * X ->  X X
   *
   * Note: There is always one less split decimal specified, so that we don't
   * have rounding errors.In other words: [0.7] uses 0.7 and 0.3 for splits and
   * [0.7, 0.2] uses 0.7, 0.2, and 0.1 for splits.
   */
  vSplit: function(bboxSplits) {
    return this._splitBox('v', bboxSplits);
  },

  /**
   * Internal method for vSplit and hSplit.
   */
  _splitBox: function(d, bboxSplits) {
    if (glift.util.typeOf(bboxSplits) !== 'array') {
      throw "bboxSplits must be specified as an array. Was: "
          + glift.util.typeOf(bboxSplits);
    }
    if (!(d === 'h' || d === 'v')) {
      throw "What!? The only splits allowed are 'v' or 'h'.  " +
          "You supplied: " + d;
    }
    var totalSplitAmount = 0;
    for (var i = 0; i < bboxSplits.length; i++) {
      totalSplitAmount += bboxSplits[i];
    }
    if (totalSplitAmount >= 1) {
      throw "The box splits must sum to less than 1, but instead summed to: " +
          totalSplitAmount;
    }

    // Note: this is really just used as marker.  We use the final
    // this.botRight().x() / y() for the final marker to prevent rounding
    // errors.
    bboxSplits.push(1 - totalSplitAmount);

    var currentSplitPercentage = 0;
    var outBboxes = [];
    var currentTopLeft = this.topLeft().clone();
    for (var i = 0; i < bboxSplits.length; i++) {
      if (i === bboxSplits.length - 1) {
        currentSplitPercentage = 1;
      } else {
        currentSplitPercentage += bboxSplits[i];
      }

      // TODO(kashomon): All this switching makes me think there should be a
      // separate method for a single split.
      var nextBotRightX = d === 'h' ?
          this.botRight().x() :
          this.topLeft().x() + this.width() * currentSplitPercentage;
      var nextBotRightY = d === 'h' ?
          this.topLeft().y() + this.height() * currentSplitPercentage :
          this.botRight().y();
      var nextBotRight = glift.util.point(nextBotRightX, nextBotRightY);
      outBboxes.push(glift.displays.bboxFromPts(currentTopLeft, nextBotRight));
      var nextTopLeftX = d === 'h' ?
          currentTopLeft.x() :
          this.topLeft().x() + this.width() * currentSplitPercentage;
      var nextTopLeftY = d === 'h' ?
          this.topLeft().y() + this.height() * currentSplitPercentage :
          currentTopLeft.y();
      currentTopLeft = glift.util.point(nextTopLeftX, nextTopLeftY);
    }
    return outBboxes;
  }
};
(function() {
// TODO(kashomon): Add much better tests for these methods.  The BoardPoints are
// pivotal to creating the go board, so we want them to really work.

/**
 * Simple wrapper around the BoardPoints constructor.
 */
glift.displays.boardPoints = function(points, spacing, maxIntersects) {
  return new BoardPoints(points, spacing, maxIntersects);
};

/**
 * Construct the board points from a linebox (see linebox.js).
 *
 * TODO(kashomon): This is pretty irritating to test.  Is there an easier way to
 * structure this?
 */
glift.displays.boardPointsFromLineBox = function(linebox, maxIntersects) {
  var spacing = linebox.spacing,
      radius = spacing / 2,
      linebbox = linebox.bbox,
      left = linebbox.left() + linebox.extensionBox.left() * spacing,
      top = linebbox.top() + linebox.extensionBox.top() * spacing,
      leftPt = linebox.pointTopLeft.x(),
      topPt = linebox.pointTopLeft.y(),
      // Mapping from int point hash, e.g., (0,18), to coordinate data.
      points = {};

  for (var i = 0; i <= linebox.yPoints; i++) {
    for (var j = 0; j <= linebox.xPoints; j++) {
      var xCoord = left + j * spacing;
      var yCoord = top + i * spacing;
      var intPt = glift.util.point(leftPt + j, topPt + i);

      // TODO(kashomon): Prehaps the coordinate point should be truncated?
      // right now it's ~15 decimal places.  This is too much precision and it
      // might hurt performance.
      var coordPt = glift.util.point(xCoord, yCoord);
      points[intPt.hash()] = {
        // Integer point.
        intPt: intPt,
        coordPt: coordPt,
        bbox: glift.displays.bboxFromPts(
            glift.util.point(coordPt.x() - radius, coordPt.y() - radius),
            glift.util.point(coordPt.x() + radius, coordPt.y() + radius))
      };
    }
  }
  return glift.displays.boardPoints(points, spacing, maxIntersects);
};

/**
 * BoardPoints maintains a mapping from an intersection on the board
 * to a coordinate in pixel-space. It also contains information about the
 * spcaing of the points and the radius (useful for drawing circles).
 *
 * Later, this is directly to create everything that lives on an intersection.
 * In particular,
 *  - lines
 *  - star ponts
 *  - marks
 *  - stones
 *  - stone shadows
 *  - button bounding box.
 *
 *  Note: The integer points are 0 Indexed.
 */
var BoardPoints = function(points, spacing, numIntersections) {
  this.points = points; // int hash is 0 indexed, i.e., 0->18.
  this.spacing = spacing;
  this.radius = spacing / 2;
  this.numIntersections = numIntersections; // 1 indexed (1->19)
  this.dataCache = undefined;
};

BoardPoints.prototype = {
  /**
   * Get the points.
   *
   * TODO(kashomon): Remove?  I don't think this is necessary any longer.
   */
  getCoords: function() {
    return this.points;
  },

  /**
   * Get the coordinate for a given integer point string.  Note: the integer
   * points are 0 indexed, i.e., 0->18 for a 19x19.  Recall that board points
   * from the the top left (0,0) to the bottom right (18, 18).
   *
   * Ex. :  (0,2) =>
   *  {
   *    intPt: (0,2),
   *    coordPt: (12.2, 34.2),
   *    ...
   *  }
   */
  getCoord: function(pt) {
    return this.points[pt.hash()];
  },

  /**
   * Traverse over all the points. The order in which the points are traversed
   * is not guaranteed.
   */
  forEach: function(func) {
    for (var key in this.points) {
      func(this.points[key]);
    }
  },

  /**
   * Return the points as an array.
   */
  data: function() {
    if (this.dataCache !== undefined) {
      return this.dataCache;
    }
    var data = [];
    this.forEach(function(point) {
      data.push(point);
    });
    this.dataCache = data;
    return data;
  },

  /**
   * Test whether an integer point exists in the points map.
   * TODO(kashomon): Rename.  This is not apt since it confuses the idea of
   * integer points and float coordinates.
   */
  hasCoord: function(pt) {
    return this.points[pt.hash()] !== undefined;
  },

  /**
   * Return an array on integer points (0-indexed), used to indicate where star
   * points should go. Ex. [(3,3), (3,9), (3,15), ...].  This only returns the
   * points that are actually present in the points mapping.
   */
  starPoints: function() {
    var point = glift.util.point,
        // In pts, each element in the sub array is mapped against every other
        // element.  Thus [2, 6] generates [(2,2), (2,6), (6,2), (6,6)] and
        // [[2, 6], [4]] generates the above concatinated with [4,4].
        pts = {
          9 : [[ 2, 6 ], [ 4 ]],
          13 : [[ 3, 9 ], [6]],
          19 : [[ 3, 9, 15 ]]
        },
        outerSet = pts[this.numIntersections] || [],
        outStarPoints = [];
    for (var k = 0; k < outerSet.length; k++) {
      var thisSet = outerSet[k];
      for (var i = 0; i < thisSet.length; i++) {
        for (var j = 0; j < thisSet.length; j++) {
          var pt = point(thisSet[i], thisSet[j]);
          if (this.hasCoord(pt)) {
            outStarPoints.push(pt);
          }
        }
      }
    }
    return outStarPoints;
  },

  /**
   * Draw a circle for every intersection, for debug purposes.
   *
   * TODO(kashomon): This is raphael-specific and should be removed, or changed
   * to use D3.
   */
  _debugDraw: function(paper, color) {
    for (var ptHash in this.points) {
      var centerX = this.points[ptHash].bbox.center().x();
      var centerY = this.points[ptHash].bbox.center().y();
      var circ = paper.circle(centerX, centerY, this.radius);
      circ.attr({fill:color, opacity:.3});
    }
  }
};

})();
glift.displays.cropbox = {
  LINE_EXTENSION: .5,
  DEFAULT_EXTENSION: 0, // Wut.
  OVERFLOW: 1.5, // The line spacing that goes around the edge.

  create: function(cbox, extBox, minIntersects, maxIntersects) {
    return new glift.displays._CropBox(cbox, extBox, minIntersects, maxIntersects);
  },

  getFromRegion: function(region, intersects) {
    var util = glift.util,
        boardRegions = glift.enums.boardRegions,
        region = region || boardRegions.ALL,
        // So that we can 0 index, we subtract one.
        maxIntersects = intersects - 1,
        minIntersects = 0,
        defaultExtension = 0,
        lineExtension = .5,
        halfInts = Math.ceil(maxIntersects / 2),

        // Assign Defualts
        top = minIntersects,
        left = minIntersects,
        bot = maxIntersects,
        right = maxIntersects,
        topExtension = this.DEFAULT_EXTENSION,
        leftExtension = this.DEFAULT_EXTENSION,
        botExtension = this.DEFAULT_EXTENSION,
        rightExtension = this.DEFAULT_EXTENSION;

    switch(region) {
      // X X
      // X X
      case boardRegions.ALL: break;

      // X -
      // X -
      case boardRegions.LEFT:
          right = halfInts + 1;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - X
      // - X
      case boardRegions.RIGHT:
          left = halfInts - 1;
          leftExtension = this.LINE_EXTENSION;
          break;

      // X X
      // - -
      case boardRegions.TOP:
          bot = halfInts + 1;
          botExtension = this.LINE_EXTENSION;
          break;

      // - -
      // X X
      case boardRegions.BOTTOM:
          top = halfInts - 1;
          topExtension = this.LINE_EXTENSION;
          break;

      // X -
      // - -
      case boardRegions.TOP_LEFT:
          bot = halfInts + 1;
          botExtension = this.LINE_EXTENSION;
          right = halfInts + 2;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - X
      // - -
      case boardRegions.TOP_RIGHT:
          bot = halfInts + 1;
          botExtension = this.LINE_EXTENSION;
          left = halfInts - 2;
          leftExtension = this.LINE_EXTENSION;
          break;

      // - -
      // X -
      case boardRegions.BOTTOM_LEFT:
          top = halfInts - 1;
          topExtension = this.LINE_EXTENSION;
          right = halfInts + 2;
          rightExtension = this.LINE_EXTENSION;
          break;

      // - -
      // - X
      case boardRegions.BOTTOM_RIGHT:
          top = halfInts - 1;
          topExtension = this.LINE_EXTENSION;
          left = halfInts - 2;
          leftExtension = this.LINE_EXTENSION;
          break;
      default: break;
    };

    var cbox = glift.displays.bboxFromPts(
        util.point(left, top), util.point(right, bot));
    var extBox = glift.displays.bboxFromPts(
        util.point(leftExtension, topExtension),
        util.point(rightExtension, botExtension));
    return glift.displays.cropbox.create(
        cbox, extBox, minIntersects, maxIntersects);
  }
};

/**
 * A cropbox is similar to a bounding box, but instead of a box based on pixels,
 * it's a box based on points.
 */
glift.displays._CropBox = function(cbox, extBox, minIntersects, maxIntersects) {
  this._cbox = cbox;
  this._extBox = extBox;
};

glift.displays._CropBox.prototype = {
  cbox: function() { return this._cbox; },
  extBox: function() { return this._extBox; },
  xPoints: function() { return this.cbox().width(); },
  yPoints: function() { return this.cbox().height(); },

  /**
   * Returns the number of 'intersections' we need to allocate for the height.
   * In otherwords:
   *    - The base intersections (e.g., 19x19).
   *    -
   */
  widthMod: function() {
    var OVERFLOW = glift.displays.cropbox.OVERFLOW;
    return this.cbox().width() + this.extBox().topLeft().x()
        + this.extBox().botRight().x() + OVERFLOW;
  },
  heightMod: function() {
    var OVERFLOW = glift.displays.cropbox.OVERFLOW;
    return this.cbox().height() + this.extBox().topLeft().y()
        + this.extBox().botRight().y() + OVERFLOW;
  }
};
(function() {
/***
 * The Environment contains:
 *  - The bounding box for the lines.
 *  - The bounding box for the whole board
 *  - The bounding boxes for the sidebars.
 *  - The divId to be used
 */
glift.displays.environment = {
  TOPBAR_SIZE: 0.10,
  BOTTOMBAR_SIZE: 0.10,

  get: function(options) {
    return new GuiEnvironment(options);
  },

  getInitialized: function(options) {
    return glift.displays.environment.get(options).init();
  }
};

var GuiEnvironment = function(options) {
  this.divId = options.divId || 'glift_display';
  this.boardRegion = options.boardRegion || glift.enums.boardRegions.ALL;
  this.intersections = options.intersections || 19;
  var displayConfig = options.displayConfig || {};
  this.cropbox = displayConfig.cropbox !== undefined ?
      displayConfig.cropbox :
      glift.displays.cropbox.getFromRegion(this.boardRegion, this.intersections);
  this.heightOverride = false;
  this.widthOverride = false;
  if (displayConfig.divHeight !== undefined) {
    this.divHeight = displayConfig.divHeight;
    this.heightOverride = true;
  }
  if (displayConfig.divWidth !== undefined) {
    this.divWidth = displayConfig.divWidth;
    this.widthOverride = true;
  }
};

GuiEnvironment.prototype = {
  // Initialize the internal variables that tell where to place the go broard.
  init: function() {
    if (!this.heightOverride || !this.widthOverride) {
      this._resetDimensions();
    }

    var displays = glift.displays,
        env = displays.environment,
        divHeight = this.divHeight,
        divWidth = this.divWidth,
        cropbox = this.cropbox,
        dirs = glift.enums.directions,

        // The box for the entire div.
        // TODO(kashomon): This is created twice, which is a little silly (but
        // not expensive) in _resetDimensions. Might want to replace.
        divBox = displays.bboxFromPts(
            glift.util.point(0, 0), // top left point
            glift.util.point(divWidth, divHeight)), // bottom right point

        // The resized goboard box, accounting for the cropbox.
        goBoardBox = glift.displays.getResizedBox(divBox, cropbox),

        // The bounding box (modified) for the lines. This is slightly different
        // than the go board, due to cropping and the margin between go board
        // and the lines.
        goBoardLineBox = glift.displays.getLineBox(goBoardBox, cropbox),

        // Calculate the coordinates and bounding boxes for each intersection.
        boardPoints = glift.displays.boardPointsFromLineBox(
            goBoardLineBox, this.intersections);
    this.divBox = divBox;
    this.goBoardBox = goBoardBox;
    this.goBoardLineBox = goBoardLineBox;
    this.boardPoints = boardPoints;
    return this;
  },

  _resetDimensions: function() {
    var bbox = glift.displays.bboxFromDiv(this.divId);
    this.divHeight = bbox.height();
    this.divWidth = bbox.width();
    return this;
  },

  _debugDrawAll: function() {
    var paper = Raphael(this.divId, "100%", "100%")
    this.divBox.draw(paper, 'yellow');
    this.resizedBox.draw(paper, 'red');
    this.goBoardBox.draw(paper, 'orange');
    this.goBoardLineBox.bbox.draw(paper, 'red');
    this.goBoardLineBox._debugDrawLines(paper, 'blue');
    this.boardPoints._debugDraw(paper, 'green');
    this.lineSegments._debugDraw(paper, 'black');
  }
};

})();
/**
 * Collection of ID utilities, mostly for SVG.
 */
glift.displays.ids = {
  /**
   * Create an ID generator.
   */
  generator: function(divId) {
    return new glift.displays.ids._Generator(divId);
  },

  /**
   * Get an ID for a SVG element (return the stringForm id).
   *
   * extraData may be undefined.  Usually a point, but also be an icon name.
   */
  element: function(divId, type, extraData) {
    var base = divId + "_" + type;
    if (extraData !== undefined) {
      if (extraData.x !== undefined) {
        return base + '_' + extraData.x() + "_" + extraData.y();
      } else {
        return base + '_' + extraData.toString();
      }
    } else {
      return base;
    }
  },

  _Generator: function(divId) {
    this.divId = divId;
    this._eid = glift.displays.ids.element;
    this._enum = glift.enums.svgElements;

    this._svg = this._eid(this.divId, this._enum.SVG);
    this._board = this._eid(this.divId, this._enum.BOARD);
    this._stoneGroup = this._eid(this.divId, this._enum.STONE_CONTAINER);
    this._stoneShadowGroup =
        this._eid(this.divId, this._enum.STONE_SHADOW_CONTAINER);
    this._starpointGroup = this._eid(this.divId, this._enum.STARPOINT_CONTAINER);
    this._buttonGroup = this._eid(this.divId, this._enum.BUTTON_CONTAINER);
    this._lineGroup = this._eid(this.divId, this._enum.BOARD_LINE_CONTAINER);
    this._markGroup = this._eid(this.divId, this._enum.MARK_CONTAINER);
    this._iconGroup = this._eid(this.divId, this._enum.ICON_CONTAINER);
  }
};

glift.displays.ids._Generator.prototype = {
  /** ID for the svg container. */
  svg: function() { return this._svg; },

  /** ID for the board. */
  board: function() { return this._board; },

  /** Group id for the stones. */
  stoneGroup: function() { return this._stoneGroup; },

  /** Id for a stone. */
  stone: function(pt) {
    return this._eid(this.divId, this._enum.STONE, pt);
  },

  /** Group id for the stone shadows. */
  stoneShadowGroup: function() { return this._stoneShadowGroup; },

  /** ID for a stone shadow. */
  stoneShadow: function(pt) {
    return this._eid(this.divId, this._enum.STONE_SHADOW, pt);
  },

  /** Group id for the star points. */
  starpointGroup: function() { return this._starpointGroup; },

  /** ID for a star point. */
  starpoint: function(pt) {
    return this._eid(this.divId, this._enum.STARPOINT, pt);
  },

  /** Group id for the buttons. */
  buttonGroup: function() { return this._buttonGroup; },

  /** ID for a button. */
  button: function(pt) {
    return this._eid(this.divId, this._enum.BUTTON, pt);
  },

  /** Group id for the lines. */
  lineGroup: function() { return this._lineGroup; },

  /** ID for a line. */
  line: function(pt) {
    return this._eid(this.divId, this._enum.BOARD_LINE, pt);
  },

  /** Group id a Mark Container. */
  markGroup: function() { return this._markGroup; },

  /** ID for a mark. */
  mark: function(pt) {
    return this._eid(this.divId, this._enum.MARK, pt);
  },

  /** ID for a guideline. */
  guideLine: function() {
    return this._eid(this.divId, this._enum.GUIDE_LINE);
  },

  /** Group ID for the icons.  */
  iconGroup: function() { return this._iconGroup; },

  /** ID for an icon . */
  icon: function(name) {
    return this._eid(this.divId, this._enum.ICON, name);
  },

  /** Group ID for the temporary icons. */
  tempIconGroup: function(name) {
    return this._eid(this.divId, this._enum.TEMP_ICON_CONTAINER, name);
  },

  /** ID for a temporary icon . */
  tempIcon: function(name) {
    return this._eid(this.divId, this._enum.TEMP_ICON, name);
  },

  /** ID for a temporary text. */
  tempIconText: function(name) {
    return this._eid(this.divId, this._enum.TEMP_TEXT, name);
  }
};
(function() {
glift.displays.getLineBox = function(boardBox, cropbox) {
  var totalOverflow = glift.displays.cropbox.OVERFLOW;
  var oneSidedOverflow = totalOverflow / 2;
  // TODO(kashomon): This is very mysterious. Provide more documentation.
  var xSpacing = boardBox.width() / cropbox.widthMod();
  var ySpacing = boardBox.height() / cropbox.heightMod();
  var top = ySpacing * oneSidedOverflow; // Scale the overflow by spacing
  var left = xSpacing * oneSidedOverflow; // Scale the overflow by spacing
  var bot = ySpacing * (cropbox.heightMod() - oneSidedOverflow)
  var right = xSpacing * (cropbox.widthMod() - oneSidedOverflow)
  var leftBase = boardBox.topLeft().x();
  var topBase = boardBox.topLeft().y();

      // The Line Box is an extended cropbox.
  var lineBoxBoundingBox = glift.displays.bboxFromPts(
          glift.util.point(left + leftBase, top + topBase),
          glift.util.point(right + leftBase, bot + topBase));
      return new LineBox(lineBoxBoundingBox, xSpacing, ySpacing, cropbox);
};

var LineBox = function(boundingBox, xSpacing, ySpacing, cropbox) {
  this.bbox = boundingBox;
  this._xSpacing = xSpacing; // For debug -- should be identical
  this._ySpacing = ySpacing; // For debug -- should be identical
  this.spacing = xSpacing;
  // todo: Make these methods instead of variables
  this.extensionBox = cropbox.extBox();
  this.pointTopLeft = cropbox.cbox().topLeft();
  this.xPoints = cropbox.xPoints();
  this.yPoints = cropbox.yPoints();
};

})();
/**
 * Find the optimal positioning of the widget. Creates divs for all the
 * necessary elements and then returns the divIds. Specifically, returns:
 *  {
 *    commentBox: ...
 *    goBox: ...
 *    iconBox: ...
 *  }
 */
glift.displays.positionWidget = function(
    divBox, boardRegion, ints, boardComponentsList) {
  var comps = glift.enums.boardComponents;
  var bcMap = {}
  for (var i = 0; i < boardComponentsList.length; i++) {
    bcMap[boardComponentsList[i]] = true;
  }
  var cropbox = glift.displays.cropbox.getFromRegion(boardRegion, ints);

  // These are simple heuristics.  They do not optimally place the board, but I
  // prefer the simplicity.
  var longBoxRegions = { TOP: true, BOTTOM: true };
  if (!bcMap.hasOwnProperty(comps.COMMENT_BOX)) {
    return glift.displays.positionWidgetVert(
        divBox, cropbox, boardRegion, bcMap);
  } else if (divBox.hwRatio() < 0.45 && longBoxRegions[boardRegion]) {
    return glift.displays.positionWidgetHorz(
        divBox, cropbox, boardRegion, bcMap);
  } else if (divBox.hwRatio() < 0.600 && !longBoxRegions[boardRegion]) {
    // In other words, the width == 1.5 * height;
    // Also: Requires a comment box
    return glift.displays.positionWidgetHorz(
        divBox, cropbox, boardRegion, bcMap);
  } else {
    // Default: Vertically aligned.
    return glift.displays.positionWidgetVert(
        divBox, cropbox, boardRegion, bcMap);
  }
};

glift.displays.positionWidgetVert = function(
    divBox, cropbox, boardRegion, boardComponentsMap) {
  var point = glift.util.point;
  var aligns = glift.enums.boardAlignments;
  var comps = glift.enums.boardComponents;
  var outBoxes = {};
  var splitPercentages = [];
  var boardBase = undefined;
  var iconBarBase = undefined;
  var commentBase = undefined;
  var extraIconBarBase = undefined;
  if (boardComponentsMap.hasOwnProperty(comps.COMMENT_BOX) &&
      boardComponentsMap.hasOwnProperty(comps.ICONBAR) &&
      boardComponentsMap.hasOwnProperty(comps.EXTRA_ICONBAR)) {
    var splits = divBox.hSplit([0.6, 0.2, 0.1]);
    boardBase = splits[0];
    commentBase = splits[1];
    iconBarBase = splits[2];
    extraIconBarBase = splits[3];
  } else if (boardComponentsMap.hasOwnProperty(comps.COMMENT_BOX) &&
      boardComponentsMap.hasOwnProperty(comps.ICONBAR)) {
    var splits = divBox.hSplit([0.7, 0.2]);
    boardBase = splits[0];
    commentBase = splits[1];
    iconBarBase = splits[2];
  } else if (boardComponentsMap.hasOwnProperty(comps.ICONBAR)) {
    var splits = divBox.hSplit([0.9]);
    boardBase = splits[0];
    iconBarBase = splits[1];
  } else if (boardComponentsMap.hasOwnProperty(comps.COMMENT_BOX)) {
    var splits = divBox.hSplit([0.8]);
    boardBase = splits[0];
    commentBase = splits[1];
  } else {
    boardBase = divBox;
  }

  var board = glift.displays.getResizedBox(boardBase, cropbox, aligns.TOP);
  outBoxes.boardBox = board;
  if (commentBase) {
    var bb = outBoxes.boardBase;
    var commentHeight = commentBase.height();
    var boardWidth = board.width();
    var boardLeft = board.left();
    var boardBottom = board.bottom();
    outBoxes.commentBox = glift.displays.bbox(
        point(boardLeft, boardBottom), boardWidth, commentHeight);
  }
  if (iconBarBase) {
    var bb = outBoxes.boardBase;
    var barHeight = iconBarBase.height();
    var boardLeft = board.left();
    var boardWidth = board.width();
    if (outBoxes.commentBox) {
      var bottom = outBoxes.commentBox.bottom();
    } else {
      var bottom = outBoxes.boardBox.bottom();
    }
    outBoxes.iconBarBox = glift.displays.bbox(
        point(boardLeft, bottom), boardWidth, barHeight);
  }
  if (extraIconBarBase) {
    var bb = outBoxes.boardBase;
    var barHeight = extraIconBarBase.height();
    var boardLeft = board.left();
    var boardWidth = board.width();
    if (outBoxes.iconBarBox) {
      var bottom = outBoxes.iconBarBox.bottom();
    } else {
      var bottom = outBoxes.boardBox.bottom();
    }
    outBoxes.extraIconBarBox = glift.displays.bbox(
        point(boardLeft, bottom), boardWidth, barHeight);
  }
  return outBoxes;
};

/**
 * Position a widget horizontally, i.e.,
 * |   X   X   |
 *
 * Since a resizedBox is designed to fill up either the h or w dimension. There
 * are only three scenarios:
 *  1. The GoBoardBox naturally touches the top & bottom
 *  2. The GoBoardBox naturally touches the left & right
 *  2. The GoBoardBox fits perfectly.
 *
 * Note, we should never position horizontally for TOP and BOTTOM board regions.
 *
 * returns:
 *
 *  {
 *    boardBox,
 *    commentBox,
 *    iconBarBox,
 *    rightSide,
 *    leftSide
 *  }
 */
glift.displays.positionWidgetHorz = function(
    divBox, cropbox, boardRegion, boardComponentsMap) {
  var point = glift.util.point;
  var aligns = glift.enums.boardAlignments;
  var comps = glift.enums.boardComponents;
  if (!comps.hasOwnProperty(comps.COMMENT_BOX)) {
    throw "The component map must contain a comment box";
  }
  var boardBox = glift.displays.getResizedBox(divBox, cropbox, aligns.RIGHT);
  var outBoxes = {};

  // These are precentages of boardWidth.  We require a minimum width of 1/2 the
  // GoBoardWidth.
  // TODO(kashomon): Make this configurable.
  var minCommentPercent = 0.5;
  var minCommentBoxSize = boardBox.width() * minCommentPercent;
  var maxCommentPercent = 0.75;
  var maxCommentBoxSize = boardBox.width() * maxCommentPercent;
  var widthDiff = divBox.width() - boardBox.width();

  // The commentBoxPercentage is percentage of the width of the goboard that
  // we want the comment box to be.
  if (widthDiff < minCommentBoxSize) {
    var commentBoxPercentage = minCommentPercent;
  } else if (widthDiff >= minCommentBoxSize
      && widthDiff < maxCommentBoxSize) {
    var commentBoxPercentage = widthDiff / boardBox.width();
  } else {
    var commentBoxPercentage = maxCommentPercent;
  }
  outBoxes.commentBoxPercentage = commentBoxPercentage;

  // Split percentage is how much we want to split the boxes by.
  var desiredWidth = commentBoxPercentage * boardBox.width();
  var splitPercentage = boardBox.width() / (desiredWidth + boardBox.width());
  // This means that if the divBox is very wide (> maxCommentBoxSize +
  // boardWidth), so we just need to partition the box.
  var splits = divBox.vSplit([splitPercentage]);
  outBoxes.leftSide = splits[0];

  // Find out what the resized box look like now.
  var newResizedBox = glift.displays.getResizedBox(
      splits[0], cropbox, aligns.RIGHT);

  var rightSide = splits[1];
  outBoxes.rightSide = rightSide;
  var baseCommentBox = glift.displays.bboxFromPts(
      point(rightSide.topLeft().x(), newResizedBox.topLeft().y()),
      point(rightSide.botRight().x(), newResizedBox.botRight().y()));
  if (rightSide.width() > (0.75 * newResizedBox.width())) {
    baseCommentBox = baseCommentBox.vSplit(
        [0.75 * newResizedBox.width() / baseCommentBox.width()])[0];
  }

  if (boardComponentsMap.hasOwnProperty(comps.ICONBAR) &&
      boardComponentsMap.hasOwnProperty(comps.EXTRA_ICONBAR)) {
    var finishedBoxes = baseCommentBox.hSplit([0.8, 0.1]);
    outBoxes.commentBox = finishedBoxes[0];
    outBoxes.iconBarBox = finishedBoxes[1];
    outBoxes.extraIconBarBox = finishedBoxes[2];
  } else if (boardComponentsMap.hasOwnProperty(comps.ICONBAR)) {
    var finishedBoxes = baseCommentBox.hSplit([0.9]);
    outBoxes.commentBox = finishedBoxes[0];
    outBoxes.iconBarBox = finishedBoxes[1];
  } else {
    outBoxes.commentBox = baseCommentBox;
  }
  outBoxes.boardBox = newResizedBox;
  return outBoxes;
};

glift.displays.setNotSelectable = function(divId) {
  $('#' + divId).css({
      '-webkit-touch-callout': 'none',
      '-webkit-user-select': 'none',
      '-khtml-user-select': 'none',
      '-moz-user-select': 'moz-none',
      '-ms-user-select': 'none',
      'user-select': 'none',
      '-webkit-highlight': 'none',
      '-webkit-tap-highlight-color': 'rgba(0,0,0,0)',
      'cursor': 'default'
  });
};
/**
 * Resize the box optimally into the divBox (bounding box). Currently this finds
 * the minimum of height and width, makes a box out of this value, and centers
 * the box.
 */
glift.displays.getResizedBox = function(divBox, cropbox, alignment) {
  var aligns = glift.enums.boardAlignments,
      alignment = alignment || aligns.CENTER,
      util = glift.util,
      newDims = glift.displays.getCropDimensions(
          divBox.width(),
          divBox.height(),
          cropbox),
      newWidth = newDims.width,
      newHeight = newDims.height,
      xDiff = divBox.width() - newWidth,
      yDiff = divBox.height() - newHeight,
      // These are used to center the box.  However, it's not always the case
      // that we really do want to center the box.
      xDelta = alignment === aligns.RIGHT ? xDiff : xDiff / 2,
      yDelta = alignment === aligns.TOP ? 0 : yDiff / 2,
      newLeft = divBox.topLeft().x() + xDelta,
      newTop = divBox.topLeft().y() + yDelta,
      newBox = glift.displays.bbox(
          util.point(newLeft, newTop), newWidth, newHeight);
  if (glift.global.debugMode) {
    newBox._debugInfo = function() {
      return {
        newDims: newDims,
        newWidth: newWidth,
        newHeight: newHeight,
        xDiff: xDiff,
        yDiff: yDiff,
        xDelta: xDelta,
        yDelta: yDelta,
        newLeft: newLeft,
        newTop: newTop
      };
    };
  }
  return newBox;
};

// Change the dimensions of the box (the height and width) to have the same
// proportions as cropHeight / cropWidth;
glift.displays.getCropDimensions = function(width, height, cropbox) {
  var origRatio = height / width,
      cropRatio = cropbox.heightMod() / cropbox.widthMod(),
      newHeight = height,
      newWidth = width;
  if (origRatio > cropRatio) {
    newHeight = width * cropRatio;
  } else if (origRatio < cropRatio) {
    newWidth = height / cropRatio;
  }
  return {
    height: newHeight,
    width: newWidth
  };
};
glift.displays.board = {
  create: function(env, themeName, theme) {
    return new glift.displays.board.Display(env, themeName, theme).draw();
  }
};

/**
 * The core Display object returned to the user.
 */
glift.displays.board.Display = function(inEnvironment, themeName, theme) {
  // Due layering issues, we need to keep track of the order in which we
  // created the objects.
  this._objectHistory = [];
  this._environment = inEnvironment;
  this._themeName = themeName;
  this._theme = theme;
  this._svgBase = glift.displays.svg.svg({height: '100%', width: '100%'})
  this._svg = undefined; // defined in draw
  this._intersections = undefined // defined in draw;
  this._buffer = []; // All objects are stuffed into the buffer and are only added
};

glift.displays.board.Display.prototype = {
  intersections: function() { return this._intersections; },
  intersectionPoints: function() { return this._environment.intersections; },
  boardPoints: function() { return this._environment.boardPoints; },
  divId: function() { return this._environment.divId },
  theme: function() { return this._themeName; },
  boardRegion: function() { return this._environment.boardRegion; },
  width: function() { return this._environment.goBoardBox.width() },
  height: function() { return this._environment.goBoardBox.height() },

  /**
   * Initialize the SVG
   * This allows us to create a base display object without creating all drawing
   * all the parts.
   */
  init: function() {
    if (this._svg === undefined) {
      this.destroy(); // make sure everything is cleared out of the div.
      this._svg = this._svgBase.copyNoChildren();
    }
    this._environment.init();
    return this;
  },

  /**
   * Draw the GoBoard!
   */
  draw:  function() {
    this.init();
    var board = glift.displays.board,
        env = this._environment,
        boardPoints = env.boardPoints,
        theme = this._theme,
        svg = this._svg,
        divId = this.divId(),
        idGen = glift.displays.ids.generator(divId);
    board.initBlurFilter(divId, svg); // in boardBase
    board.boardBase(svg, idGen, env.goBoardBox, theme);
    board.lines(svg, idGen, boardPoints, theme);
    board.starpoints(svg, idGen, boardPoints, theme);
    board.shadows(svg, idGen, boardPoints, theme);
    board.stones(svg, idGen, boardPoints, theme);
    board.markContainer(svg, idGen, boardPoints, theme);
    board.buttons(svg, idGen, boardPoints);
    this._intersections = new glift.displays.board._Intersections(
        divId, svg, boardPoints, theme);
    this.flush();
    return this; // required
  },

  flush: function() {
    var svg = this._svg;
    $('#' + this.divId()).html(svg.render());
    this.intersections().flushEvents();
    return this;
  },

  /**
   * Destory the GUI portion of the GoBoard.  We just remove the SVG element.
   * This makes redrawing the GoBoard much quicker.
   */
  destroy: function() {
    $('#' + this.divId()).empty();
    this._svg = undefined;
    this._intersections = undefined;
    return this;
  },

  /**
   * Recreate the GoBoard. This means we create a completely new environment,
   * but we reuse the old Display object.
   *
   * TODO(kashomon): Why is this here?  Why not just give back a completely new
   * display?
   */
  recreate: function(options) {
    this.destroy();
    var processed = glift.displays.processOptions(options),
        environment = glift.displays.environment.get(processed);
    this._environment = environment;
    this._themeName = processed.theme
    this._theme = glift.themes.get(processed.theme);
    return this;
  }
};
/**
 * Create the background GoBoard object.  Essentially just a rectangle with a
 * fill color and a border.
 */
glift.displays.board.boardBase = function(svg, idGen, goBox, theme) {
  var svglib = glift.displays.svg;
  if (theme.board.imagefill) {
    svg.append(svglib.image()
      .attr('x', goBox.topLeft().x())
      .attr('y', goBox.topLeft().y())
      .attr('width', goBox.width())
      .attr('height', goBox.height())
      .attr('xlink:href', theme.board.imagefill)
      .attr('preserveAspectRatio', 'none'));
  }

  svg.append(svglib.rect()
    .attr('x', goBox.topLeft().x() + 'px')
    .attr('y', goBox.topLeft().y() + 'px')
    .attr('width', goBox.width() + 'px')
    .attr('height', goBox.height() + 'px')
    .attr('height', goBox.height() + 'px')
    .attr('fill', theme.board.imagefill ? 'none' : theme.board.fill)
    .attr('stroke', theme.board.stroke)
    .attr('stroke-width', theme.board['stroke-width'])
    .attr('id', idGen.board()));
};

glift.displays.board.initBlurFilter = function(divId, svg) {
  // svg.append("svg:defs")
    // .append("svg:filter")
      // .attr("id", divId + '_svg_blur')
    // .append("svg:feGaussianBlur")
      // .attr("stdDeviation", 2);
};
/**
 * Create transparent buttons that overlay each intersection.
 */
glift.displays.board.buttons = function(svg, idGen, boardPoints) {
  var svglib = glift.displays.svg;
  var container = svglib.group().attr('id', idGen.buttonGroup());
  svg.append(container);

  var data = boardPoints.data();
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.rect()
      .data(pt.intPt)
      .attr("x", pt.coordPt.x() - boardPoints.radius)
      .attr("y", pt.coordPt.y() - boardPoints.radius)
      .attr("width", boardPoints.spacing)
      .attr("height", boardPoints.spacing)
      .attr('opacity', 0)
      .attr('fill', 'red')
      .attr('stroke', 'red')
      .attr('stone_color', 'EMPTY')
      .attr('id', idGen.button(pt.intPt)));
  }
};
glift.displays.board._Intersections = function(divId, svg, boardPoints, theme) {
  this.divId = divId;
  this.svg = svg;
  this.theme = theme;
  this.boardPoints = boardPoints;
  this.idGen = glift.displays.ids.generator(this.divId);

  // Object of objects of the form
  //  {
  //    <buttonId>#<eventName>: {
  //      pt: <pt>,
  //      func: func
  //    }
  //  }
  // Note that the funcs take two parameters: event and icon.
  this.events = {};

  // Tracking for which intersections have been modified.
  this.markPts = [];
};

glift.displays.board._Intersections.prototype = {
  /**
   * Set the color of a stone. Returns 'this' for the possibility of chaining.
   */
  setStoneColor: function(pt, colorKey) {
    var key = pt.hash();
    if (this.theme.stones[colorKey] === undefined) {
      throw 'Unknown color key [' + colorKey + ']'
    }

    var stoneGroup = this.svg.child(this.idGen.stoneGroup());
    var stone = stoneGroup.child(this.idGen.stone(pt));
    if (stone !== undefined) {
      var stoneColor = this.theme.stones[colorKey];
      stone.attr('fill', stoneColor.fill)
        .attr('stroke', stoneColor.stroke || 1)
        .attr('stone_color', colorKey)
        .attr('opacity', stoneColor.opacity);
      var stoneShadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
      if (stoneShadowGroup  !== undefined) {
        var stoneShadow = stoneShadowGroup.child(this.idGen.stoneShadow(pt));
        if (stoneColor.opacity === 1) {
          stoneShadow.attr('opacity', 1);
        } else {
          stoneShadow.attr('opacity', 0);
        }
      }
    }
    this.flushStone(pt);
    return this;
  },

  flushStone: function(pt) {
    var stone = this.svg.child(this.idGen.stoneGroup())
        .child(this.idGen.stone(pt));
    $('#' + stone.attr('id')).attr(stone.attrObj());
    var stoneShadowGroup = this.svg.child(this.idGen.stoneShadowGroup());
    if (stoneShadowGroup !== undefined) {
      var stoneShadow = stoneShadowGroup.child(this.idGen.stoneShadow(pt));
      $('#' + stoneShadow.attr('id')).attr(stoneShadow.attrObj());
    }
    return this;
  },

  addMarkPt: function(pt, mark, label) {
    glift.displays.board.addMark(
        this.svg, this.idGen, this.boardPoints, this.theme, pt, mark, label);
    this.flushMark(pt, mark);
    return this;
  },

  flushMark: function(pt, mark) {
    var svg = this.svg;
    var idGen = this.idGen;
    if (glift.displays.board.reqClearForMark(svg, idGen, pt, mark)) {
      var starp  = svg.child(idGen.starpointGroup()).child(idGen.starpoint(pt))
      if (starp) {
        $('#' + starp.attr('id')).attr('opacity', starp.attr('opacity'));
      }
      var linept = svg.child(idGen.lineGroup()).child(idGen.line(pt))
      $('#' + linept.attr('id')).attr('opacity', linept.attr('opacity'));
    }
    var markGroup = svg.child(idGen.markGroup());
    markGroup.child(idGen.mark(pt)).attachToParent(markGroup.attr('id'));
    this.markPts.push(pt);
    return this;
  },

  clearMarks: function() {
    var idGen = this.idGen;
    for (var i = 0, len = this.markPts.length; i < len; i++) {
      var pt = this.markPts[i];
      var starpoint =
          this.svg.child(idGen.starpointGroup()).child(idGen.starpoint(pt))
      if (starpoint !== undefined) {
        $('#' + starpoint.attr('id')).attr('opacity', 1);
      }
      var line = this.svg.child(idGen.lineGroup()).child(idGen.line(pt))
      $('#' + line.attr('id')).attr('opacity', 1);
    }
    this.svg.child(this.idGen.markGroup()).emptyChildren();
    var markGroupId = this.idGen.markGroup();
    $('#' + this.idGen.markGroup()).empty();
    return this;
  },

  /**
   * Currently unused. Add guideLines for mobile devices.
   */
  addGuideLines: function(pt) {
    var elems = glift.enums.svgElements;
    var svglib = glift.displays.svg;
    var container = this.svg.child(this.idGen.markGroup());
    container.rmChild(this.idGen.guideLine());

    var bpt = this.boardPoints.getCoord(pt);
    var boardPoints = this.boardPoints;
    container.append(svglib.path()
      .attr('d', glift.displays.board.intersectionLine(
          bpt, boardPoints.radius * 8, boardPoints.numIntersections))
      .attr('stroke-width', 3)
      .attr('stroke', 'blue')
      .attr('id', this.idGen.guideLine()))
  },

  clearGuideLines: function() {
    var elems = glift.enums.svgElements;
    var container = this.svg.child(this.idGen.markGroup())
      .rmChild(this.idGen.guideLine());
    return this;
  },

  setGroupAttr: function(groupId, attrObj) {
    var g = this.svg.child(groupId);
    if (g !== undefined) {
      var children = g.children();
      for (var i = 0, ii = children.length; i < ii; i++) {
        for (var key in attrObj) {
          children[i].attr(key, attrObj[key]);
        }
      }
    }
    return this;
  },

  clearStones: function() {
    var stoneAttrs = {opacity: 0, stone_color: "EMPTY"};
    var shadowAttrs = {opacity: 0};
    this.setGroupAttr(this.idGen.stoneGroup(), stoneAttrs)
        .setGroupAttr(this.idGen.stoneShadowGroup(), shadowAttrs);
    $('.' + glift.enums.svgElements.STONE_SHADOW).attr(shadowAttrs);
    $('.' + glift.enums.svgElements.STONE).attr(stoneAttrs);
    return this;
  },

  clearAll: function() {
    this.clearMarks().clearStones();
    return this;
  },

  /**
   * Set events for the buttons.
   */
  setEvent: function(eventName, func) {
    var buttonGroup = this.svg.child(this.idGen.buttonGroup());
    var children = this.svg.child(this.idGen.buttonGroup()).children();
    for (var i = 0, ii = children.length; i < ii; i++) {
      var button = children[i];
      var id = button.attr('id');
      var pt = button.data();
      var eventsId = id + '#' + eventName;
      this.events[eventsId] = { pt: pt, func: func };
    }
    return this;
  },

  flushEvents: function() {
    for (var buttonId_event in this.events) {
      var splat = buttonId_event.split('#');
      var buttonId = splat[0];
      var eventName = splat[1];
      var eventObj = this.events[buttonId_event];
      this._flushOneEvent(buttonId, eventName, eventObj);
    }
  },

  _flushOneEvent: function(buttonId, eventName, eventObj) {
    $('#' + buttonId).on(eventName, function(event) {
      eventObj.func(event, eventObj.pt);
    });
  }
};
/**
 * Create the background lines. These are create at each individual intersection
 * rather than as a whole so that we can clear theme out when we to draw marks
 * on the raw board (rather than on stones).
 */
glift.displays.board.lines = function(svg, idGen, boardPoints, theme) {
  // Mapping from int point (e.g., 3,3) hash to id;
  var elementId = glift.displays.gui.elementId;
  var svglib = glift.displays.svg;

  var container = svglib.group().attr('id', idGen.lineGroup());
  svg.append(container);

  var data = boardPoints.data();
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.path()
      .attr('d', glift.displays.board.intersectionLine(
          pt, boardPoints.radius, boardPoints.numIntersections))
      .attr('stroke', theme.lines.stroke)
      .attr('stroke-width', theme.lines['stroke-width'])
      .attr('stroke-linecap', 'round')
      .attr('id', idGen.line(pt.intPt)));
  }
};

glift.displays.board.intersectionLine = function(
    boardPt, radius, numIntersections) {
  // minIntersects: 0 indexed,
  // maxIntersects: 0 indexed,
  // numIntersections: 1 indexed (it's the number of intersections)
  var minIntersects = 0,
      maxIntersects = numIntersections - 1,
      coordinate = boardPt.coordPt,
      intersection = boardPt.intPt,
      svgpath = glift.displays.svg.pathutils;
  var top = intersection.y() === minIntersects ?
      coordinate.y() : coordinate.y() - radius;
  var bottom = intersection.y() === maxIntersects ?
      coordinate.y() : coordinate.y() + radius;
  var left = intersection.x() === minIntersects ?
      coordinate.x() : coordinate.x() - radius;
  var right = intersection.x() === maxIntersects ?
      coordinate.x() : coordinate.x() + radius;
  var line =
      // Vertical Line
      svgpath.move(coordinate.x(), top) + ' '
      + svgpath.lineAbs(coordinate.x(), bottom) + ' '
      // Horizontal Line
      + svgpath.move(left, coordinate.y()) + ' '
      + svgpath.lineAbs(right, coordinate.y());
  return line;
};
/**
 * Create the mark container.  For layering purposes (i.e., for the z-index), a
 * dummy mark container is once as a place holder. Unlike all other elements,
 * the Marks are created / destroyed on demand, which is why we need a g
 * container.
 */
glift.displays.board.markContainer = function(svg, idGen, boardPoints, theme) {
  svg.append(glift.displays.svg.group().attr('id', idGen.markGroup()));
};

/**
 * Check whether the starpoints and lines need to be cleared.
 */
glift.displays.board.reqClearForMark = function(svg, idGen, pt, mark) {
  var marks = glift.enums.marks;
  var stoneColor = svg.child(idGen.stoneGroup())
      .child(idGen.stone(pt))
      .attr('stone_color');
  return stoneColor === 'EMPTY' && (mark === marks.LABEL
      || mark === marks.VARIATION_MARKER
      || mark === marks.CORRECT_VARIATION);
};

/**
 * Clear the starpoints and lines.
 */
glift.displays.board.clearForMark = function(svg, idGen, pt) {
  var starpoint = svg.child(idGen.starpointGroup()).child(idGen.starpoint(pt))
  if (starpoint) {
    starpoint.attr('opacity', 0);
  }
  svg.child(idGen.lineGroup())
      .child(idGen.line(pt))
      .attr('opacity', 0)
};

// This is a static method instead of a method on intersections because, due to
// the way glift is compiled together, there'no s guarantee what order the files
// come in (beyond the base package file).  So, either we need to combine
// intersections.js with board.js or we week this a separate static method.
glift.displays.board.addMark = function(
    svg, idGen, boardPoints, theme, pt, mark, label) {
  var svgpath = glift.displays.svg.pathutils;
  var svglib = glift.displays.svg;
  var rootTwo = 1.41421356237;
  var rootThree = 1.73205080757;
  var marks = glift.enums.marks;
  var coordPt = boardPoints.getCoord(pt).coordPt;

  var stoneColor = svg.child(idGen.stoneGroup())
      .child(idGen.stone(pt))
      .attr('stone_color');

  var marksTheme = theme.stones[stoneColor].marks;
  var container = svg.child(idGen.markGroup());
  var markId = idGen.mark(pt);

  // If necessary, clear out intersection lines and starpoints.  This only applies
  // when a stone hasn't yet been set (stoneColor === 'EMPTY').
  if (glift.displays.board.reqClearForMark(svg, idGen, pt, mark)) {
    glift.displays.board.clearForMark(svg, idGen, pt);
  }

  var fudge = boardPoints.radius / 8;
  // TODO(kashomon): Move the labels code to a separate function.  It's pretty
  // hacky right now.  It doesn't seem right that there should be a whole
  // separate coditional based on what are essentially color requirements.
  if (mark === marks.LABEL
      || mark == marks.VARIATION_MARKER
      || mark == marks.CORRECT_VARIATION) {
    if (mark === marks.VARIATION_MARKER) {
      marksTheme = marksTheme.VARIATION_MARKER;
    } else if (mark === marks.CORRECT_VARIATION) {
      marksTheme = marksTheme.CORRECT_VARIATION;
    }
    container.append(svglib.text()
        .text(label)
        .attr('fill', marksTheme.fill)
        .attr('stroke', marksTheme.stroke)
        .attr('text-anchor', 'middle')
        .attr('dy', '.33em') // for vertical centering
        .attr('x', coordPt.x()) // x and y are the anchor points.
        .attr('y', coordPt.y())
        .attr('font-family', theme.stones.marks['font-family'])
        .attr('font-size', boardPoints.spacing * 0.7)
        .attr('id', markId));

  } else if (mark === marks.SQUARE) {
    var baseDelta = boardPoints.radius / rootTwo;
    // If the square is right next to the stone edge, it doesn't look as nice
    // as if it's offset by a little bit.
    var halfWidth = baseDelta - fudge;
    container.append(svglib.rect()
        .attr('x', coordPt.x() - halfWidth)
        .attr('y', coordPt.y() - halfWidth)
        .attr('width', 2 * halfWidth)
        .attr('height', 2 * halfWidth)
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke', marksTheme.stroke)
        .attr('id', markId));

  } else if (mark === marks.XMARK) {
    var baseDelta = boardPoints.radius / rootTwo;
    var halfDelta = baseDelta - fudge;
    var topLeft = coordPt.translate(-1 * halfDelta, -1 * halfDelta);
    var topRight = coordPt.translate(halfDelta, -1 * halfDelta);
    var botLeft = coordPt.translate(-1 * halfDelta, halfDelta);
    var botRight = coordPt.translate(halfDelta, halfDelta);
    container.append(svglib.path()
        .attr('d',
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(topLeft) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(topRight) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(botLeft) + ' ' +
            svgpath.movePt(coordPt) + ' ' +
            svgpath.lineAbsPt(botRight))
        .attr('stroke-width', 2)
        .attr('stroke', marksTheme.stroke)
        .attr('id', markId));
  } else if (mark === marks.CIRCLE) {
    container.append(svglib.circle()
        .attr('cx', coordPt.x())
        .attr('cy', coordPt.y())
        .attr('r', boardPoints.radius / 2)
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke', marksTheme.stroke)
        .attr('id', markId));
  } else if (mark === marks.STONE_MARKER) {
    var stoneMarkerTheme = theme.stones.marks['STONE_MARKER'];
    container.append(svglib.circle()
        .attr('cx', coordPt.x())
        .attr('cy', coordPt.y())
        .attr('r', boardPoints.radius / 3)
        .attr('opacity', marksTheme.STONE_MARKER.opacity)
        .attr('fill', marksTheme.STONE_MARKER.fill)
        .attr('id', markId));
  } else if (mark === marks.TRIANGLE) {
    var r = boardPoints.radius - boardPoints.radius / 5;
    var rightNode = coordPt.translate(r * (rootThree / 2), r * (1 / 2));
    var leftNode  = coordPt.translate(r * (-1 * rootThree / 2), r * (1 / 2));
    var topNode = coordPt.translate(0, -1 * r);
    container.append(svglib.path()
        .attr('fill', 'none')
        .attr('d',
            svgpath.movePt(topNode) + ' ' +
            svgpath.lineAbsPt(leftNode) + ' ' +
            svgpath.lineAbsPt(rightNode) + ' ' +
            svgpath.lineAbsPt(topNode))
        .attr('stroke-width', 2)
        .attr('stroke', marksTheme.stroke)
        .attr('id', markId));
  } else {
    // do nothing.  I suppose we could throw an exception here.
  }
  return this;
};
/**
 * Create the star points.  See boardPoints.starPoints() for details about which
 * points are used
 */
glift.displays.board.starpoints = function(
    svg, idGen, boardPoints, theme) {
  var svglib = glift.displays.svg;
  var container = svglib.group().attr('id', idGen.starpointGroup());
  svg.append(container);

  var size = theme.starPoints.sizeFraction * boardPoints.spacing;
  var starPointData = boardPoints.starPoints();
  for (var i = 0, ii = starPointData.length; i < ii; i++) {
    var pt = starPointData[i];
    var coordPt = boardPoints.getCoord(pt).coordPt;
    container.append(svglib.circle()
      .attr('cx', coordPt.x())
      .attr('cy', coordPt.y())
      .attr('r', size)
      .attr('fill', theme.starPoints.fill)
      .attr('opacity', 1)
      .attr('id', idGen.starpoint(pt)));
  }
};
/**
 * Create the Go stones.  They are initially invisible to the user, but they
 * all exist at the time of GoBoard creation.
 */
glift.displays.board.stones = function(svg, idGen, boardPoints, theme) {
  var svglib = glift.displays.svg;
  var container = svglib.group().attr('id', idGen.stoneGroup());
  svg.append(container);
  var data = boardPoints.data()
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.circle()
      .attr("cx", pt.coordPt.x())
      .attr("cy", pt.coordPt.y())
      .attr("r", boardPoints.radius - .4) // subtract for stroke
      .attr("opacity", 0)
      .attr("stone_color", "EMPTY")
      .attr("fill", 'blue') // dummy color
      .attr('class', glift.enums.svgElements.STONE)
      .attr("id", idGen.stone(pt.intPt)));
  }
};

/**
 * Create the shadows for the Go stones.  They are initially invisible to the
 * user, but they may become visible later (e.g., via mousover).  Shadows are
 * only created if the theme has a shadow.
 */
glift.displays.board.shadows = function(svg, idGen, boardPoints, theme) {
  if (theme.stones.shadows === undefined) { return {}; }
  var svglib = glift.displays.svg;
  var container = svglib.group().attr('id', idGen.stoneShadowGroup());
  svg.append(container);
  var data = boardPoints.data();
  for (var i = 0, ii = data.length; i < ii; i++) {
    var pt = data[i];
    container.append(svglib.circle()
      .attr("cx", pt.coordPt.x() + boardPoints.radius / 7)
      .attr("cy", pt.coordPt.y() + boardPoints.radius / 7)
      .attr("r", boardPoints.radius - 0.4)
      .attr("opacity", 0)
      .attr("fill", theme.stones.shadows.fill)
      // .attr("stroke", theme.stones.shadows.stroke)
      // .attr("filter", 'url(#' + divId + "_svg_blur)")
      .attr('class', glift.enums.svgElements.STONE_SHADOW)
      .attr("id", idGen.stoneShadow(pt.intPt)));
  }
};
/**
 * Extra GUI methods and data.  This also contains pieces used by widgets.
 */
glift.displays.gui = {};
/**
 * Centers a bunch of icons (really, bounding boxes) within another bounding
 * box.
 *
 * Return pair of
 *  {
 *    transforms: [...]
 *    bboxes: [...]
 *    unfitTransforms: [...]
 *  }
 *
 * Note: The returned items are guaranteed to be in the order they appeared as
 * inputs.
 */
glift.displays.gui.rowCenterSimple = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing) {
  return glift.displays.gui._linearCentering(
      outerBox, inBboxes, vertMargin, horzMargin, minSpacing, 0, 'h');
};

glift.displays.gui.columnCenterSimple = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing) {
  return glift.displays.gui._linearCentering(
      outerBox, inBboxes, vertMargin, horzMargin, minSpacing, 0, 'v');
};

/**
 * Perform linearCentering either vertically or horizontally.
 */
glift.displays.gui._linearCentering = function(
    outerBox, inBboxes, vertMargin, horzMargin, minSpacing, maxSpacing, dir) {
  var outerWidth = outerBox.width(),
      innerWidth = outerWidth - 2 * horzMargin,
      outerHeight = outerBox.height(),
      minSpacing = minSpacing || 0,
      maxSpacing = maxSpacing || 0,
      innerHeight = outerHeight - 2 * vertMargin,
      transforms = [],
      newBboxes = [];
  var dir = (dir === 'v' || dir === 'h') ? dir : 'h';
  var getLongSide = function(bbox, dir) {
    return dir === 'h' ? bbox.width() : bbox.height();
  };

  var outsideLongSide = getLongSide(outerBox, dir);
  // Use some arbitrarily large number as an upper bound default
  maxSpacing = maxSpacing <= 0 ? 10000000 : maxSpacing;
  minSpacing = minSpacing <= 0 ? 0 : minSpacing;

  // Adjust all the bboxes so that they are the right scale.
  var totalElemLength = 0;
  for (var i = 0; i < inBboxes.length; i++) {
    if (innerHeight > innerWidth) {
      var scale = innerWidth / inBboxes[i].width();
    } else {
      var scale = innerHeight / inBboxes[i].height();
    }
    var partialTransform = { scale: scale };
    var newBbox = inBboxes[i].scale(scale);
    transforms.push(partialTransform);
    newBboxes.push(newBbox);
    totalElemLength += getLongSide(newBbox, dir);
    if (i < inBboxes.length - 1) {
      totalElemLength += minSpacing;
    }
  }

  // Pop off elements that don't fit.
  var unfitBoxes = [];
  while (outsideLongSide < totalElemLength) {
    var outOfBoundsBox = newBboxes.pop();
    transforms.pop();
    totalElemLength -= getLongSide(outOfBoundsBox, dir);
    totalElemLength -= minSpacing;
    unfitBoxes.push(outOfBoundsBox);
  }

  // Find how much space to use for which parts
  if (dir === 'h') {
    var extraSpace = innerWidth - totalElemLength;
  } else {
    var extraSpace = innerHeight - totalElemLength;
  }
  var extraSpacing = extraSpace / (transforms.length + 1);
  var elemSpacing = extraSpacing;
  var extraMargin = extraSpacing;
  if (extraSpacing > maxSpacing) {
    elemSpacing = maxSpacing;
    var totalExtraMargin = extraSpace - elemSpacing * (transforms.length - 1);
    extraMargin = totalExtraMargin / 2;
  }

  var left = outerBox.left() + horzMargin;
  var top = outerBox.top() + vertMargin;
  if (dir === 'h') {
    left += extraMargin;
  } else {
    top += extraMargin;
  }

  // Find the x and y translates.
  var finishedBoxes = []
  for (var i = 0; i < newBboxes.length; i++) {
    var newBbox = newBboxes[i];
    var partialTransform = transforms[i];
    var yTranslate = top - newBbox.top();
    var xTranslate = left - newBbox.left();
    partialTransform.xMove = xTranslate;
    partialTransform.yMove = yTranslate;
    finishedBoxes.push(newBbox.translate(xTranslate, yTranslate));
    if (dir === 'h') {
      left += newBbox.width() + elemSpacing;
    } else {
      top += newBbox.height() + elemSpacing;
    }
  }

  return { transforms: transforms, bboxes: finishedBoxes, unfit: unfitBoxes };
};

glift.displays.gui.centerWithin = function(
    outerBbox, bbox, vertMargin, horzMargin) {
  var outerWidth = outerBbox.width(),
      innerWidth = outerWidth - 2 * horzMargin,
      outerHeight = outerBbox.height(),
      innerHeight = outerHeight - 2 * vertMargin,
      transforms = undefined,
      newBboxes = undefined,
      elemWidth = 0;

  var scale = 1; // i.e., no scaling;
  if (innerHeight / innerWidth >
      bbox.height() / bbox.width()) {
    // Outer box is a 'more-tall' box than the inner-box.  So, we scale the
    // inner box by width (since the height has more wiggle room).
    scale = innerWidth / bbox.width();
  } else {
    scale = innerHeight / bbox.width();
  }
  var newBbox = bbox.scale(scale);
  var left = outerBbox.left() + horzMargin;
  if (newBbox.width() < innerWidth) {
    left = left + (innerWidth - newBbox.width()) / 2; // Center horz.
  }
  var top = outerBbox.top() + vertMargin;
  if (newBbox.height() < innerHeight) {
    top = top + (innerHeight -  newBbox.height()) / 2;
  }
  var transform = {
    xMove: left - newBbox.left(),
    yMove: top - newBbox.top(),
    scale: scale
  };
  newBbox = newBbox.translate(transform.xMove, transform.yMove);
  return { transform: transform, bbox: newBbox};
};
(function() {
// TODO(kashomon): Move to its own directory.
glift.displays.gui.commentBox = function(divId, themeName) {
  return new CommentBox(divId, themeName).draw();
};

// TODO(kashomon): Pass in an options argument.
var CommentBox = function(
    divId, themeName) {
  this.divId = divId;
  this.themeName = themeName;
  this.theme = glift.themes.get(themeName);
  this.commentBoxObj = undefined; // JQuery obj
};

CommentBox.prototype = {
  draw: function() {
    // TODO(kashomon): Remove JQuery References
    this.commentBoxObj = $('#' + this.divId);
    var commentBoxHeight = $('#' + this.divId).height();
    var padding = 10; // TODO(kashomon): Put in theme
    var borderWidth = 1;
    var boardBorder = this.theme.board['stroke-width'];
    // var fontSize = width / 25 < 15 ? 15 : width / 25;
    var fontSize = 16;
    // commentBoxHeight * .13 < 14 ? 14 : commentBoxHeight * .13;
    // fontSize = fontSize > 16 ? 16 : fontSize;
    this.commentBoxObj.css({
      // TODO(kashomon): Get the theme info from the theme
      background: '#CCCCFF',
      border: borderWidth + 'px solid',
      margin: 'auto',
      'font-family': 'Baskerville',
      'overflow-y': 'auto',
      'font-size': fontSize,

      // prevent Chrome/web kit from resizing the text (font boosting)
      // ... which doesn't work for me, unfortunately.
      // '-webkit-text-size-adjust': 'none',
      // 'min-height': '1px',
      // 'max-height': '5000em',
      // 'max-height': '1000000px',

      // Prevent padding from affecting width
      '-webkit-box-sizing': 'border-box', /* Safari/Chrome, other WebKit */
      '-moz-box-sizing': 'border-box',    /* Firefox, other Gecko */
      'box-sizing': 'border-box',         /* Opera/IE 8+ */
      'padding': padding
    });
    return this;
  },

  setText: function(text) {
    this.commentBoxObj.html('<p>' +
        text.replace(/\n/g, '<br>') + '</p>');
  },

  clearText: function() {
    this.commentBoxObj.html('');
  },

  destroy: function() {
    this.commentBoxObj.empty();
  }
};
})();
/**
 * A simple object representing a DivSplit.
 */
glift.displays.gui.DivSplit = function(id, start, length) {
  this.id = id;
  this.start = start;
  this.length = length;
};

/**
  * Take a div, create multiple sub divs, absolutely positioned.
  *
  * divId: divId to be split.
  * percents: Precent tall that each section is.  Note that the length of this
  * == the number of splits - 1;
  *
  * direction: defaults to 'horizontal'.  Also can split 'vertical'-ly.
  *
  * Note:
  *  X => XX (vertical split)
  *
  *  X => X  (horizontal split)
  *       X
  *
  * return: an array of useful div info:
  *  [{
  *    id: foo
  *    start: 0 // top for horz, left for vert
  *    length: 100 // height for horz, width for vert
  *  }, {...}
  *  ]
  */
glift.displays.gui.splitDiv = function(divId, percents, direction) {
  var bbox = glift.displays.bboxFromDiv(divId),
      totalPercent = 0;
  if (!direction) {
    direction = 'horizontal';
  } else if (direction !== 'vertical' && direction !== 'horizontal') {
    direction = 'horizontal'
  }

  for (var i = 0; i < percents.length; i++) {
    totalPercent += percents[i];
  }

  if (totalPercent > 1 || totalPercent < 0) {
    throw 'Percents must sum to a number be between 0 and 1.' +
        'Was ' + totalPercent;
  }
  percents.push(1 - totalPercent); // Add in last value.

  // Create Data for D3.
  var boxData = [];
  var currentStart = direction === 'horizontal' ? bbox.top() : bbox.left();
  var maxAmount = direction === 'horizontal' ? bbox.height() : bbox.width();
  for (var i = 0; i < percents.length; i++) {
    boxData.push(new glift.displays.gui.DivSplit(
      'glift_internal_div_' + glift.util.idGenerator.next(),
      currentStart, // e.g., Top
      maxAmount * percents[i] // e.g., Height
    ));
    currentStart = currentStart + maxAmount * percents[i];
  }
  for (var i = 0; i < boxData.length; i++) {
    $('#' + divId).append('<div id="' + boxData[i].id + '"></div>');
    var cssObj = {
      width: direction === 'horizontal' ? '100%' : boxData[i].length,
      height: direction === 'horizontal' ? boxData[i].length : '100%',
      position: 'absolute'
    };
    var posKey =  (direction === 'horizontal' ? 'top' : 'left' )
    cssObj[posKey] = boxData[i].start;
    $('#' + boxData[i].id).css(cssObj);
  }
  return boxData;
};
/**
 * Objects and methods having to do with icons.
 */
glift.displays.icons = {};
/**
 * Options:
 *    - divId (if need to create paper)
 *    - paper (if div already created)
 *    - bounding box (if paper already created)
 *    - icons (an array of icon names)
 *    - vertMargin (in pixels)
 *    - theme (default: DEFAULT)
 */
glift.displays.icons.bar = function(options) {
  var divId = options.divId,
      icons = options.icons || [],
      vertMargin = options.vertMargin || 0,
      horzMargin = options.horzMargin || 0,
      themeName = options.theme || 'DEFAULT',
      pbox = options.parentBbox;
  if (divId === undefined) {
    throw "Must define an options 'divId' as an option";
  }
  return new glift.displays.icons._IconBar(
      divId, themeName, icons, vertMargin, horzMargin, pbox).draw();
};

glift.displays.icons._IconBar = function(
    divId, themeName, iconsRaw, vertMargin, horzMargin, parentBbox) {
  this.divId = divId;
  this.themeName = themeName;
  // The parentBbox is useful for create a multiIconSelector.
  this.parentBbox = parentBbox;
  this.theme = glift.themes.get(themeName);
  // Array of wrapped icons. See wrapped_icon.js.
  this.icons = glift.displays.icons.wrapIcons(iconsRaw);
  this.nameMapping = {};
  this.vertMargin = vertMargin;
  this.horzMargin = horzMargin;
  this.svg = undefined; // initialized by draw
  this.divBbox = undefined; // initialized by draw
  this.idGen = glift.displays.ids.generator(this.divId);


  // Object of objects of the form
  //  {
  //    <buttonId>#<eventName>: {
  //      icon: <wrappedIcon>,
  //      func: func
  //    }
  //  }
  //
  // Note that the funcs take two parameters: event and icon.
  this.events = {};

  // Post constructor initializiation
  this._initIconIds(); // Set the ids for the icons above.
  this._initNameMapping(); // Init the name mapping.
};

glift.displays.icons._IconBar.prototype = {
  _initNameMapping: function() {
    var that = this;
    this.forEachIcon(function(icon) {
      that.nameMapping[icon.iconName] = icon;
    });
  },

  _initIconIds: function() {
    var that = this;
    this.forEachIcon(function(icon) {
      icon.setElementId(that.idGen.icon(icon.iconName));
    });
  },

  draw: function() {
    this.destroy();
    var svglib = glift.displays.svg;
    var divBbox = glift.displays.bboxFromDiv(this.divId),
        svgData = glift.displays.icons.svg,
        point = glift.util.point;
    this.bbox = divBbox;
    this.svg = svglib.svg()
      .attr("width", '100%')
      .attr("height", '100%');
    glift.displays.icons.rowCenterWrapped(
        divBbox, this.icons, this.vertMargin, this.horzMargin)
    this._createIcons();
    this._createIconButtons();
    this.flush();
    return this;
  },

  flush: function() {
    $('#' + this.divId).html(this.svg.render());
    this.flushEvents();
  },

  flushEvents: function() {
    var container = this.svg.child(this.idGen.buttonGroup());
    var that = this;
    for (var buttonId_event in this.events) {
      var splat = buttonId_event.split('#');
      var buttonId = splat[0];
      var eventName = splat[1];
      if (container.child(buttonId) !== undefined) {
        var eventObj = this.events[buttonId_event];
        this._flushOneEvent(buttonId, eventName, eventObj);
      }
    }
  },

  _flushOneEvent: function(buttonId, eventName, eventObj) {
    $('#' + buttonId).on(eventName, function(event) {
        eventObj.func(event, eventObj.icon);
    });
  },

  _createIcons: function() {
    var svglib = glift.displays.svg;
    var container = svglib.group().attr('id', this.idGen.iconGroup());
    this.svg.append(container);
    this.svg.append(svglib.group().attr('id', this.idGen.tempIconGroup()));
    for (var i = 0, ii = this.icons.length; i < ii; i++) {
      var icon = this.icons[i];
      container.append(svglib.path()
        .attr('d', icon.iconStr)
        .attr('fill', this.theme.icons['DEFAULT'].fill)
        .attr('id', icon.elementId)
        .attr('transform', icon.transformString()));
    }
  },

  _createIconButtons: function() {
    var svglib = glift.displays.svg;
    var container = svglib.group().attr('id', this.idGen.buttonGroup());
    this.svg.append(container);
    for (var i = 0, ii = this.icons.length; i < ii; i++) {
      var icon = this.icons[i];
      container.append(svglib.rect()
        .data(icon.iconName)
        .attr('x', icon.bbox.topLeft().x())
        .attr('y', icon.bbox.topLeft().y())
        .attr('width', icon.bbox.width())
        .attr('height', icon.bbox.height())
        .attr('fill', 'blue') // Color doesn't matter, but we need a fill.
        .attr('opacity', 0)
        .attr('id', this.idGen.button(icon.iconName)));
    }
  },

  /**
   * Add a temporary associated icon and center it.  If the parentIcon has a
   * subbox specified, then use that.  Otherwise, just center within the
   * parent icon's bbox.
   *
   * If the tempIcon is specified as a string, it is wrapped first.
   */
  addCenteredTempIcon: function(
      parentIconName, tempIcon, color, vMargin, hMargin) {
    // Move these defaults into the Theme.
    var svglib = glift.displays.svg;
    var hm = hMargin || 2,
        vm = vMargin || 2;
    var parentIcon = this.nameMapping[parentIconName];
    if (glift.util.typeOf(tempIcon) === 'string') {
      tempIcon = glift.displays.icons.wrappedIcon(tempIcon);
    }

    if (parentIcon.subboxIcon !== undefined) {
      tempIcon = parentIcon.centerWithinSubbox(tempIcon, vm, hm);
    } else {
      tempIcon = parentIcon.centerWithinIcon(tempIcon, vm, hm);
    }

    this.svg.child(this.idGen.tempIconGroup()).appendAndAttach(svglib.path()
      .attr('d', tempIcon.iconStr)
      .attr('fill', color) // that.theme.icons['DEFAULT'].fill)
      .attr('id', this.idGen.tempIcon(tempIcon.iconName))
      .attr('transform', tempIcon.transformString()));

    return this;
  },

  /**
   * Add some temporary text on top of an icon.
   */
  addTempText: function(iconName, text, color) {
    var svglib = glift.displays.svg;
    var bbox = this.getIcon(iconName).bbox;
    var fontSize = bbox.width() * .54;
    var id = this.idGen.tempIconText(iconName);
    var boxStrokeWidth = 7
    this.clearTempText(iconName);
    this.svg.child(this.idGen.tempIconGroup()).appendAndAttach(svglib.text()
      .text(text)
      .attr('fill', color)
      .attr('stroke', color)
      .attr('class', 'tempIcon')
      .attr('font-family', 'sans-serif') // TODO(kashomon): Put in themes.
      .attr('font-size', fontSize + 'px')
      .attr('x', bbox.center().x()) // + boxStrokeWidth + 'px')
      .attr('y', bbox.center().y()) //+ fontSize)
      .attr('dy', '.33em') // Move down, for centering purposes
      .attr('style', 'text-anchor: middle; vertical-align: middle;')
      .attr('id', this.idGen.tempIconText(iconName))
      .attr('lengthAdjust', 'spacing')); // also an opt: spacingAndGlyphs
    return this;
  },

  clearTempText: function(iconName) {
    this.svg.rmChild(this.idGen.tempIconText(iconName));
    $('#' + this.idGen.tempIconText(iconName)).remove();
  },

  createIconSelector: function(baseIcon, icons) {
    // TODO(kashomon): Implement
  },

  destroyIconSelector: function() {
    // TODO(kashomon): Implement
  },

  destroyTempIcons: function() {
    this.svg.child(this.idGen.tempIconGroup()).emptyChildren();
    return this;
  },

  /** Get the Element ID of the button. */
  buttonId: function(iconName) {
    return glift.displays.gui.elementId(
        this.divId, glift.enums.svgElements.BUTTON, iconName);
  },

  /**
   * Assign an event handler to the icon named with 'iconName'.  Note, that the
   * function 'func' will always be sent the object resulting from getIcon,
   * namely,
   *
   * {
   *  name: name of the icon
   *  iconId: the element id of the icon (for convenience).
   * }
   */
  setEvent: function(iconName, event, func) {
    var button = this.svg.child(this.idGen.buttonGroup())
        .child(this.idGen.button(iconName));
    var id = button.attr('id');
    var name = button.data();
    var icon = this.nameMapping[name];
    this._setEvent(id, icon, event, func);
    return this;
  },

  /** Similar to setEvent, but grab the icon based on the index. */
  setEventIndexedIcon: function(index, event, func) {
    var icon = this.icons[index]
    if (icon === undefined) { return this; }
    var buttonId = this.idGen.button(icon.iconName);
    this._setEvent(buttonId, icon, event, func);
    return this;
  },

  _setEvent: function(buttonId, icon, event, func) {
    var id = buttonId + '#' + event;
    this.events[id] = { icon: icon, func: func };
    return this;
  },

  /**
   * Convenience mothod for adding hover events.  Equivalent to adding mouseover
   * and mouseout.
   */
  setHover: function(name, hoverin, hoverout) {
    this.setEvent(name, 'mouseover', hoverin);
    this.setEvent(name, 'mouseout', hoverout);
  },

  /**
   * Return whether the iconBar has instantiated said icon or not
   */
  hasIcon: function(name) {
    return this.newIconBboxes[name] === undefined;
  },

  /**
   * Return a wrapped icon.
   */
  getIcon: function(name) {
    return this.nameMapping[name];
  },

  /**
   * Return a index
   */
  getIconFromIndex: function(index) {
    return this.icons[index || 0];
  },

  /**
   * Convenience method to loop over each icon, primarily for the purpose of
   * adding events.
   */
  forEachIcon: function(func) {
    for (var i = 0, ii = this.icons.length; i < ii; i++) {
      func(this.icons[i]);
    }
  },

  redraw: function() {
    this.destroy();
    this.draw();
  },

  destroy: function() {
    this.divId && $('#' + this.divId).empty();
    this.bbox = undefined;
    return this;
  }
};
/**
 * Row-Center an array of wrapped icons.
 */
glift.displays.icons.rowCenterWrapped = function(
    divBbox, wrappedIcons, vMargin, hMargin, minSpacing) {
  return glift.displays.icons._centerWrapped(
      divBbox, wrappedIcons, vMargin, hMargin, minSpacing, 'h');
}

/**
 * Column-Center an array of wrapped icons.
 */
glift.displays.icons.columnCenterWrapped = function(
    divBbox, wrappedIcons, vMargin, hMargin, minSpacing) {
  return glift.displays.icons._centerWrapped(
      divBbox, wrappedIcons, vMargin, hMargin, minSpacing, 'v');
}

/**
 * Center an array of wrapped icons.
 */
glift.displays.icons._centerWrapped = function(
    divBbox, wrappedIcons, vMargin, hMargin, minSpacing, direction) {
  var bboxes = [];
  if (direction !== 'h' && direction !== 'v') {
    direction = 'h'
  }
  for (var i = 0; i < wrappedIcons.length; i++) {
    bboxes.push(wrappedIcons[i].bbox);
  }
  var minSpacing = minSpacing || 5;

  // Row center returns: { transforms: [...], bboxes: [...] }
  if (direction === 'h') {
    var centeringData = glift.displays.gui.rowCenterSimple(
        divBbox, bboxes, vMargin, hMargin, minSpacing);
  } else {
    var centeringData = glift.displays.gui.columnCenterSimple(
        divBbox, bboxes, vMargin, hMargin, minSpacing)
  }
  var transforms = centeringData.transforms;

  // TODO(kashomon): Can the transforms be less than the centerede icons? I
  // think so.  In any case, this case probably needs to be handled.
  for (var i = 0; i < transforms.length && i < wrappedIcons.length; i++) {
    wrappedIcons[i].performTransform(transforms[i]);
  }
  return transforms;
};
glift.displays.icons.iconSelector = function(parentDivId, iconBar, icon) {
  return new glift.displays.icons._IconSelector(parentDivId, iconBar, icon)
      .draw();
};

glift.displays.icons._IconSelector = function(parentDivId, iconBar, icon) {
  // The assumption is currently that there can only be one IconSelector.  This
  // may be incorrect, but it can easily be reevaluated later.
  this.baseId = 'iconSelector_' + parentDivId;
  this.iconBar = iconBar;
  this.parentDivId = parentDivId;
  this.icon = icon; // base icon.

  this.displayedIcons = undefined; // defined on draw.

  this.columnIdList = [];
  this.svgColumnList = []; // defined on draw.
};

glift.displays.icons._IconSelector.prototype = {
  draw: function() {
    this.destroy();
    var that = this;
    var svglib = glift.displays.svg;
    var parentBbox = glift.displays.bboxFromDiv(this.parentDivId);
    var iconBarBbox = this.iconBar.bbox;
    var iconBbox = this.icon.bbox;

    var columnWidth = iconBbox.width();
    // This assumes that the iconbar is always on the bottom.
    var columnHeight = parentBbox.height() - iconBarBbox.height();

    var paddingPx = 5;
    var rewrapped = [];

    for (var i = 0; i < this.icon.associatedIcons.length; i++) {
      rewrapped.push(this.icon.associatedIcons[i].rewrapIcon());
    }
    var $parentDiv = $('#' + this.parentDivId);

    var columnIndex = 0;
    while (rewrapped.length > 0) {
      var columnId = this.baseId + '_column_' + columnIndex;
      this.columnIdList.push(columnId);

      $parentDiv.append('<div id="' + columnId + '"></div>')
      $('#' + columnId).css({
        bottom: iconBarBbox.height(),
        height: columnHeight,
        left: (parentBbox.width() - iconBarBbox.width()) +
            columnIndex * iconBbox.width(),
        width: iconBbox.width(),
        position: 'absolute',
        background: '#CCCCCC'
      });

      var columnBox = glift.displays.bboxFromDiv(columnId);
      var transforms = glift.displays.icons.columnCenterWrapped(
          columnBox, rewrapped, paddingPx, paddingPx);

      var svgId = columnId + '_svg';
      var svg = svglib.svg()
          .attr('id', columnId + '_svg')
          .attr('height', '100%')
          .attr('width', '100%');
      for (var i = 0, len = transforms.length; i < len; i++) {
        var icon = rewrapped.shift();
        svg.append(svglib.path()
            .attr('d', icon.iconStr)
            .attr('fill', 'red')
            .attr('transform', icon.transformString())
            .attr('id', svgId + '_' + icon.iconName))
      }

      svg.attachToParent(columnId);
      this.svgColumnList.push(svg);
      columnIndex++;
    }
  },

  destroy: function() {
    $('#' + this.id).remove();
  }
};
/**
 * The bounding boxes are precalculated by running BboxFinder.html
 */
glift.displays.icons.svg = {
   // http://raphaeljs.com/icons/#cross
  cross: {
    string: "M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z",
    bbox: {
      "x":8.116,
      "y":7.585,
      "x2":24.778,
      "y2":24.248,
      "width":16.662,
      "height":16.663
    }
  },

  // http://raphaeljs.com/icons/#check
  check: {
    string: "M2.379,14.729 5.208,11.899 12.958,19.648 25.877,6.733 28.707,9.561 12.958,25.308z",
    bbox: {
      "x":2.379,
      "y":6.733,
      "x2":28.707,
      "y2":25.308,
      "width":26.328,
      "height":18.575
    }
  },

  // http://raphaeljs.com/icons/#refresh
  refresh: {
    string: "M24.083,15.5c-0.009,4.739-3.844,8.574-8.583,8.583c-4.741-0.009-8.577-3.844-8.585-8.583c0.008-4.741,3.844-8.577,8.585-8.585c1.913,0,3.665,0.629,5.09,1.686l-1.782,1.783l8.429,2.256l-2.26-8.427l-1.89,1.89c-2.072-1.677-4.717-2.688-7.587-2.688C8.826,3.418,3.418,8.826,3.416,15.5C3.418,22.175,8.826,27.583,15.5,27.583S27.583,22.175,27.583,15.5H24.083z",
    bbox: {
      "x":3.416,
      "y":3.415,
      "x2":27.583,
      "y2":27.583,
      "width":24.167,
      "height":24.168
    }
  },

  // http://raphaeljs.com/icons/#undo
  undo: {
    string: "M12.981,9.073V6.817l-12.106,6.99l12.106,6.99v-2.422c3.285-0.002,9.052,0.28,9.052,2.269c0,2.78-6.023,4.263-6.023,4.263v2.132c0,0,13.53,0.463,13.53-9.823C29.54,9.134,17.952,8.831,12.981,9.073z",
    bbox: {"x":0.875,"y":6.817,"x2":29.54,"y2":27.042158,"width":28.665,"height":20.225158}
  },

  // http://raphaeljs.com/icons/#arrowright2
  'chevron-right': {
    string: "M10.129,22.186 16.316,15.999 10.129,9.812 13.665,6.276 23.389,15.999 13.665,25.725z",
    bbox: {
      "x":10.129,
      "y":6.276,
      "x2":23.389,
      "y2":25.725,
      "width":13.26,
      "height":19.449
    }
  },

  // http://raphaeljs.com/icons/#arrowleft2
  'chevron-left': {
    string: "M21.871,9.814 15.684,16.001 21.871,22.188 18.335,25.725 8.612,16.001 18.335,6.276z",
    bbox: { "x":8.612,"y":6.276,"x2":21.871,"y2":25.725,"width":13.259,"height":19.449
    }
  },

  // http://raphaeljs.com/icons/#smallgear
  'small-gear': {
    string: "M31.229,17.736c0.064-0.571,0.104-1.148,0.104-1.736s-0.04-1.166-0.104-1.737l-4.377-1.557c-0.218-0.716-0.504-1.401-0.851-2.05l1.993-4.192c-0.725-0.91-1.549-1.734-2.458-2.459l-4.193,1.994c-0.647-0.347-1.334-0.632-2.049-0.849l-1.558-4.378C17.165,0.708,16.588,0.667,16,0.667s-1.166,0.041-1.737,0.105L12.707,5.15c-0.716,0.217-1.401,0.502-2.05,0.849L6.464,4.005C5.554,4.73,4.73,5.554,4.005,6.464l1.994,4.192c-0.347,0.648-0.632,1.334-0.849,2.05l-4.378,1.557C0.708,14.834,0.667,15.412,0.667,16s0.041,1.165,0.105,1.736l4.378,1.558c0.217,0.715,0.502,1.401,0.849,2.049l-1.994,4.193c0.725,0.909,1.549,1.733,2.459,2.458l4.192-1.993c0.648,0.347,1.334,0.633,2.05,0.851l1.557,4.377c0.571,0.064,1.148,0.104,1.737,0.104c0.588,0,1.165-0.04,1.736-0.104l1.558-4.377c0.715-0.218,1.399-0.504,2.049-0.851l4.193,1.993c0.909-0.725,1.733-1.549,2.458-2.458l-1.993-4.193c0.347-0.647,0.633-1.334,0.851-2.049L31.229,17.736zM16,20.871c-2.69,0-4.872-2.182-4.872-4.871c0-2.69,2.182-4.872,4.872-4.872c2.689,0,4.871,2.182,4.871,4.872C20.871,18.689,18.689,20.871,16,20.871z",
    bbox: {
      "x":0.667,"y":0.667,"x2":31.333,"y2":31.333,"width":30.666,"height":30.666
    }
  },

  // http://raphaeljs.com/icons/#talke
  'question-bubble': {
    string: "M16,4.938c-7.732,0-14,4.701-14,10.5c0,1.981,0.741,3.833,2.016,5.414L2,25.272l5.613-1.44c2.339,1.316,5.237,2.106,8.387,2.106c7.732,0,14-4.701,14-10.5S23.732,4.938,16,4.938zM16.982,21.375h-1.969v-1.889h1.969V21.375zM16.982,17.469v0.625h-1.969v-0.769c0-2.321,2.641-2.689,2.641-4.337c0-0.752-0.672-1.329-1.553-1.329c-0.912,0-1.713,0.672-1.713,0.672l-1.12-1.393c0,0,1.104-1.153,3.009-1.153c1.81,0,3.49,1.121,3.49,3.009C19.768,15.437,16.982,15.741,16.982,17.469z",
    bbox: {
      "x":2,"y":4.938,"x2":30,"y2":25.938,"width":28,"height":21
    }
  },

  // http://raphaeljs.com/icons/#roadmap
  roadmap: {
    string: "M23.188,3.735c0-0.975-0.789-1.766-1.766-1.766s-1.766,0.791-1.766,1.766s1.766,4.267,1.766,4.267S23.188,4.71,23.188,3.735zM20.578,3.734c0-0.466,0.378-0.843,0.844-0.843c0.467,0,0.844,0.377,0.844,0.844c0,0.466-0.377,0.843-0.844,0.843C20.956,4.578,20.578,4.201,20.578,3.734zM25.281,18.496c-0.562,0-1.098,0.046-1.592,0.122L11.1,13.976c0.199-0.181,0.312-0.38,0.312-0.59c0-0.108-0.033-0.213-0.088-0.315l8.41-2.239c0.459,0.137,1.023,0.221,1.646,0.221c1.521,0,2.75-0.485,2.75-1.083c0-0.599-1.229-1.083-2.75-1.083s-2.75,0.485-2.75,1.083c0,0.069,0.021,0.137,0.054,0.202L9.896,12.2c-0.633-0.188-1.411-0.303-2.265-0.303c-2.088,0-3.781,0.667-3.781,1.49c0,0.823,1.693,1.489,3.781,1.489c0.573,0,1.11-0.054,1.597-0.144l11.99,4.866c-0.19,0.192-0.306,0.401-0.306,0.623c0,0.188,0.096,0.363,0.236,0.532L8.695,25.415c-0.158-0.005-0.316-0.011-0.477-0.011c-3.241,0-5.87,1.037-5.87,2.312c0,1.276,2.629,2.312,5.87,2.312c3.241,0,5.87-1.034,5.87-2.312c0-0.22-0.083-0.432-0.229-0.633l10.265-5.214c0.37,0.04,0.753,0.066,1.155,0.066c2.414,0,4.371-0.771,4.371-1.723C29.65,19.268,27.693,18.496,25.281,18.496z",
    bbox: {
      "x":2.348,"y":1.969,"x2":29.65,"y2":30.028,"width":27.302,"height":28.059
    }
  },

  /////////////////////////////
  // Icons used for GameView //
  /////////////////////////////

  // http://raphaeljs.com/icons/#play
  play: {
    string: "m 58.250001,41.61219 0,40 34.69375,-20.03045 z",
    bbox:{"x":58.250001,"y":41.61219,"x2":92.94375099999999,"y2":81.61219,"width":34.693749999999994,"height":40}
  },

  // My own creation.  See themes/assets.
  unplay: {
    string: "m 74.987245,22.583592 0,39.978487 L 40,42.362183 z",
    bbox: {"x":40,"y":22.583592,"x2":74.987245,"y2":62.562079,"width":34.987245,"height":39.978487}
  },

  // http://raphaeljs.com/icons/#end
  end: {
    string: "M21.167,5.5,21.167,13.681,6.684,5.318,6.684,25.682,21.167,17.318,21.167,25.5,25.5,25.5,25.5,5.5z",
    bbox: {"x":6.684,"y":5.318,"x2":25.5,"y2":25.682,"width":18.816,"height":20.364}
  },

  // http://raphaeljs.com/icons/#start
  start: {
    string: "M24.316,5.318,9.833,13.682,9.833,5.5,5.5,5.5,5.5,25.5,9.833,25.5,9.833,17.318,24.316,25.682z",
    bbox: {"x":5.5,"y":5.318,"x2":24.316,"y2":25.682,"width":18.816,"height":20.364}
  },

  // http://raphaeljs.com/icons/#arrowup
  arrowup: {
    string: "M23.963,20.834L17.5,9.64c-0.825-1.429-2.175-1.429-3,0L8.037,20.834c-0.825,1.429-0.15,2.598,1.5,2.598h12.926C24.113,23.432,24.788,22.263,23.963,20.834z",
    bbox: {"x":7.684895,"y":8.56825,"x2":24.315105,"y2":23.432,"width":16.630209,"height":14.86375}
  },

  // http://raphaeljs.com/icons/#arrowright
  arrowright: {
    string: "M11.166,23.963L22.359,17.5c1.43-0.824,1.43-2.175,0-3L11.166,8.037c-1.429-0.826-2.598-0.15-2.598,1.5v12.926C8.568,24.113,9.737,24.789,11.166,23.963z",
    bbox: {"x":8.568,"y":7.684457,"x2":23.4315,"y2":24.315543,"width":14.8635,"height":16.631086}
  },

  // http://raphaeljs.com/icons/#arrowleft
  arrowleft: {
    string: "M20.834,8.037L9.641,14.5c-1.43,0.824-1.43,2.175,0,3l11.193,6.463c1.429,0.826,2.598,0.15,2.598-1.5V9.537C23.432,7.887,22.263,7.211,20.834,8.037z",
    bbox: {"x":8.5685,"y":7.684457,"x2":23.432,"y2":24.315543,"width":14.8635,"height":16.631086}
  },

  // http://raphaeljs.com/icons/#detour
  detour: {
    string: "M29.342,15.5l-7.556-4.363v2.614H18.75c-1.441-0.004-2.423,1.002-2.875,1.784c-0.735,1.222-1.056,2.561-1.441,3.522c-0.135,0.361-0.278,0.655-0.376,0.817c-1.626,0-0.998,0-2.768,0c-0.213-0.398-0.571-1.557-0.923-2.692c-0.237-0.676-0.5-1.381-1.013-2.071C8.878,14.43,7.89,13.726,6.75,13.75H2.812v3.499c0,0,0.358,0,1.031,0h2.741c0.008,0.013,0.018,0.028,0.029,0.046c0.291,0.401,0.634,1.663,1.031,2.888c0.218,0.623,0.455,1.262,0.92,1.897c0.417,0.614,1.319,1.293,2.383,1.293H11c2.25,0,1.249,0,3.374,0c0.696,0.01,1.371-0.286,1.809-0.657c1.439-1.338,1.608-2.886,2.13-4.127c0.218-0.608,0.453-1.115,0.605-1.314c0.006-0.01,0.012-0.018,0.018-0.025h2.85v2.614L29.342,15.5zM10.173,14.539c0.568,0.76,0.874,1.559,1.137,2.311c0.04,0.128,0.082,0.264,0.125,0.399h2.58c0.246-0.697,0.553-1.479,1.005-2.228c0.252-0.438,0.621-0.887,1.08-1.272H9.43C9.735,14.003,9.99,14.277,10.173,14.539z",
    bbox: {"x":2.812,"y":11.137,"x2":29.342,"y2":23.37325,"width":26.53,"height":12.23625}
  },

  checkbox: {
    string: "M26,27.5H6c-0.829,0-1.5-0.672-1.5-1.5V6c0-0.829,0.671-1.5,1.5-1.5h20c0.828,0,1.5,0.671,1.5,1.5v20C27.5,26.828,26.828,27.5,26,27.5zM7.5,24.5h17v-17h-17V24.5z",
    bbox: {"x":4.5,"y":4.5,"x2":27.5,"y2":27.5,"width":23,"height":23}
  },

  edit: {
    string: "M27.87,7.863L23.024,4.82l-7.889,12.566l4.842,3.04L27.87,7.863zM14.395,21.25l-0.107,2.855l2.527-1.337l2.349-1.24l-4.672-2.936L14.395,21.25zM29.163,3.239l-2.532-1.591c-0.638-0.401-1.479-0.208-1.882,0.43l-0.998,1.588l4.842,3.042l0.999-1.586C29.992,4.481,29.802,3.639,29.163,3.239zM25.198,27.062c0,0.275-0.225,0.5-0.5,0.5h-19c-0.276,0-0.5-0.225-0.5-0.5v-19c0-0.276,0.224-0.5,0.5-0.5h13.244l1.884-3H5.698c-1.93,0-3.5,1.57-3.5,3.5v19c0,1.93,1.57,3.5,3.5,3.5h19c1.93,0,3.5-1.57,3.5-3.5V11.097l-3,4.776V27.062z",
    bbox: {"x":2.198,"y":1.4388,"x2":29.80125,"y2":30.562,"width":27.60325,"height":29.12316}
  },

  // http://raphaeljs.com/icons/#ff
  ff: {
    string: "M25.5,15.5,15.2,9.552,15.2,15.153,5.5,9.552,5.5,21.447,15.2,15.847,15.2,21.447z",
    bbox: {}
  },

  // http://raphaeljs.com/icons/#rw
  rw: {
    string: "M5.5,15.499,15.8,21.447,15.8,15.846,25.5,21.447,25.5,9.552,15.8,15.152,15.8,9.552z",
    bbox: {}
  },

  ///////////////////////////////
  // Icons used for GameEditor //
  ///////////////////////////////

  // My own creation
  twostones: {
    string: "m 42.894737,29.335869 c 0,6.540213 -5.301891,11.842106 -11.842105,11.842106 -6.540214,0 -11.842105,-5.301893 -11.842105,-11.842106 0,-6.540214 5.301891,-11.842105 11.842105,-11.842105 6.540214,0 11.842105,5.301891 11.842105,11.842105 z M 31.052632,16.309553 c -7.194236,0 -13.026316,5.83208 -13.026316,13.026316 0,7.194233 5.83208,13.026314 13.026316,13.026314 3.733917,0 7.098575,-1.575815 9.473684,-4.092928 2.375029,2.516206 5.740532,4.092928 9.473684,4.092928 7.194235,0 13.026316,-5.832081 13.026316,-13.026314 0,-7.194236 -5.832081,-13.026316 -13.026316,-13.026316 -3.733152,0 -7.098655,1.56932 -9.473684,4.085526 -2.374906,-2.51483 -5.741698,-4.085526 -9.473684,-4.085526 z",
    bbox: {"x":18.026316,"y":16.309553,"x2":63.026316,"y2":42.362183,"width":45,"height":26.05263}
  },

  // My own creation.  For layered icons (multi-icons).
  multiopen: {
    string: "m 130,73.862183 6.5,-13 6.5,13 z M 70.709141,37.871643 c -5.658849,0 -10.21875,4.412745 -10.21875,9.90625 l 0,43.3125 c 0,5.493505 4.559901,9.906247 10.21875,9.906247 l 44.624999,0 c 5.65885,0 10.21875,-4.412742 10.21875,-9.906247 l 0,-43.3125 c 0,-5.493505 -4.5599,-9.90625 -10.21875,-9.90625 l -44.624999,0 z m 2.0625,3.125 40.468749,0 c 5.12994,0 9.25,3.959703 9.25,8.90625 l 0,39 c 0,4.946547 -4.12006,8.9375 -9.25,8.9375 l -40.468749,0 c -5.129943,0 -9.25,-3.990953 -9.25,-8.9375 l 0,-39 c 0,-4.946547 4.120057,-8.90625 9.25,-8.90625 z",
    bbox: {"x":60.490391,"y":37.871643,"x2":143,"y2":100.99664,"width":82.509609,"height":63.124997},
    subboxName: 'multiopen-boxonly-inside'
  },

  // The above minus the arrow.
  "multiopen-boxonly": {
    string: "m 71.1875,38.25 c -5.658849,0 -10.21875,4.412745 -10.21875,9.90625 l 0,43.3125 c 0,5.493505 4.559901,9.90625 10.21875,9.90625 l 44.625,0 c 5.65885,0 10.21875,-4.412745 10.21875,-9.90625 l 0,-43.3125 c 0,-5.493505 -4.5599,-9.90625 -10.21875,-9.90625 l -44.625,0 z m 2.0625,3.125 40.46875,0 c 5.12994,0 9.25,3.959703 9.25,8.90625 l 0,39 c 0,4.946547 -4.12006,8.9375 -9.25,8.9375 l -40.46875,0 c -5.129943,0 -9.25,-3.990953 -9.25,-8.9375 l 0,-39 C 64,45.334703 68.120057,41.375 73.25,41.375 z",
    bbox: {"x":60.96875,"y":38.25,"x2":126.03125,"y2":101.375,"width":65.0625,"height":63.125},
    subboxName: 'multiopen-boxonly-inside'
  },

  // Used to indicate where the inside box lives, which is in turn used to
  // position icons with the box.
  "multiopen-boxonly-inside": {
    string: "m 73.259825,41.362183 40.445075,0 c 5.12994,0 9.25982,3.982238 9.25982,8.928785 l 0,38.999149 c 0,4.946547 -4.12988,8.928786 -9.25982,8.928786 l -40.445075,0 C 68.129882,98.218903 64,94.236664 64,89.290117 l 0,-38.999149 c 0,-4.946547 4.129882,-8.928785 9.259825,-8.928785 z",
    bbox: {"x":64,"y":41.362183,"x2":122.96472,"y2":98.218903,"width":58.96472,"height":56.85672}
  }
};
/**
 * Create a wrapper icon.
 */
glift.displays.icons.wrappedIcon = function(iconName) {
  return new glift.displays.icons._WrappedIcon(iconName);
};

/**
 * Wrap an array of iconNames.
 */
glift.displays.icons.wrapIcons = function(iconsRaw) {
  var out = [];
  for (var i = 0; i < iconsRaw.length; i++) {
    var item = iconsRaw[i];
    if (glift.util.typeOf(item) === 'string') {
      out.push(glift.displays.icons.wrappedIcon(item));
    } else if (glift.util.typeOf(item) === 'array') {
      var subIcons = item;
      var outerIcon = glift.displays.icons.wrappedIcon('multiopen')
      for (var j = 0; j < subIcons.length; j++) {
        outerIcon.addAssociatedIcon(subIcons[j]);
      }
      out.push(outerIcon);
    }
  }
  return out;
};

/**
 * Validate that an iconName is valid.
 */
glift.displays.icons.validateIcon = function(iconName) {
  if (iconName === undefined ||
      glift.displays.icons.svg[iconName] === undefined) {
    throw "Icon unknown: [" + iconName + "]";
  }
  return iconName;
};

/**
 * Icon wrapper for convenience.  All you need is:
 *  - The name of the icon
 */
glift.displays.icons._WrappedIcon = function(iconName) {
  this.iconName = glift.displays.icons.validateIcon(iconName);
  var iconData = glift.displays.icons.svg[iconName];
  this.iconStr = iconData.string;
  this.originalBbox = glift.displays.bboxFromPts(
      glift.util.point(iconData.bbox.x, iconData.bbox.y),
      glift.util.point(iconData.bbox.x2, iconData.bbox.y2));
  this.associatedIcons = [];
  this.activeAssociated = 0; // Index into the above array
  this.bbox = this.originalBbox; // can change on "translate"
  this.transformObj = undefined; // Set if the icon is transformed
  this.elementId = undefined; // set with setElementId.  The id in the DOM.
  this.subboxIcon = undefined; // Set from setSubboxIcon(...);
  if (iconData.subboxName !== undefined) {
    this.setSubboxIcon(iconData.subboxName);
  }
};

/**
 * Wrapped icon methods.
 */
glift.displays.icons._WrappedIcon.prototype = {
  /**
   * Add an associated icon and return the new icon.
   */
  addAssociatedIcon: function(iconName) {
    var newIcon = glift.displays.icons.wrappedIcon(iconName)
    this.associatedIcons.push(newIcon);
    return newIcon;
  },

  /**
   * Add an associated icon and return the icon (for parity with the above).
   */
  _addAssociatedWrapped: function(wrapped) {
    if (wrapped.originalBbox === undefined) {
      throw "Wrapped icon not actually a wrapped icon: " + wrapped;
    }
    this.associatedIcons.push(wrapped);
    return wrapped;
  },

  /**
   * Clear the associated icons, returning the old list.
   */
  clearAssociatedIcons: function() {
    var oldIcons = this.associatedIcons;
    this.associatedIcons = [];
    return oldIcons;
  },

  /**
   * Return a the wrapped icon from the associated icon list. If index isn't
   * specified, the assumption is that the index is the active index;
   */
  getAssociated: function(index) {
    index = index || this.activeAssociated;
    return this.associatedIcons[index];
  },

  /**
   * Get the active associated icon.
   */
  getActive: function() {
    return this.associatedIcons[this.activeAssociated];
  },

  /**
   * Set the div element id.
   */
  setElementId: function(id) {
    this.elementId = id;
  },

  /**
   * Set a subbox, so we can center icons within the subbox.  A caveat is that
   * the subbox must be specified as an icon.
   */
  setSubboxIcon: function(iconName) {
    this.subboxIcon = glift.displays.icons.wrappedIcon(iconName);
    return this.subboxIcon;
  },

  /**
   * Center a icon (specified as a wrapped icon) within a subbox. Returns the
   * wrapped icon with the proper scaling.
   */
  centerWithinSubbox: function(wrapped, vMargin, hMargin) {
    if (this.subboxIcon === undefined) {
      throw "No subbox defined, so cannot centerWithin.";
    }
    var centerObj = glift.displays.gui.centerWithin(
        this.subboxIcon.bbox, wrapped.bbox, vMargin, hMargin);
    wrapped.performTransform(centerObj.transform);
    return wrapped;
  },

  /**
   * Center a icon (specified as a wrapped icon) within the current icon.
   * Returns the wrapped icon with the proper scaling.
   */
  centerWithinIcon: function(wrapped, vMargin, hMargin) {
    var centerObj = glift.displays.gui.centerWithin(
        this.bbox, wrapped.bbox, vMargin, hMargin);
    wrapped.performTransform(centerObj.transform);
    return wrapped;
  },

  /**
   * The transform parameter looks like the following:
   *  {
   *    scale: num,
   *    xMove: num,
   *    yMove: num
   *  }
   *
   * This translates the bounding box of the icon.
   *
   * Note that the scale is performed first, then the translate is performed.
   */
  performTransform: function(transformObj) {
    if (transformObj.scale) {
      this.bbox = this.bbox.scale(transformObj.scale)
    }
    if (transformObj.xMove && transformObj.yMove) {
      this.bbox = this.bbox.translate(transformObj.xMove, transformObj.yMove);
    }
    if (this.subboxIcon !== undefined) {
      this.subboxIcon.performTransform(transformObj);
    }
    // TODO(kashomon): Should we transform the associated icons?
    this.transformObj = transformObj;
    return this;
  },

  /**
   * Reset the bounding box to the initial position.
   */
  resetTransform: function() {
    this.bbox = this.originalBbox;
    this.transformObj = undefined;
    return this;
  },

  /**
   * Get the scaling string to be used as a SVG transform parameter.
   */
  transformString: function() {
    if (this.transformObj != undefined) {
      return 'translate(' + this.transformObj.xMove + ','
          + this.transformObj.yMove + ') '
          + 'scale(' + this.transformObj.scale + ')';
    } else {
      return "";
    }
  },

  /**
  * Create a new wrapper icon.  This 'forgets' all
  */
  rewrapIcon: function() {
    return glift.displays.icons.wrappedIcon(this.iconName);
  }
};
glift.displays.diagrams = {};
/**
 * Create a gooe-font diagram.
 */
glift.displays.diagrams.gooe = {
  charMapping: {
    // BASE
    TL_CORNER: '\\0??<',
    TR_CORNER: '\\0??>',
    BL_CORNER: '\\0??,',
    BR_CORNER: '\\0??.',
    TOP_EDGE: '\\0??(',
    BOT_EDGE: '\\0??)',
    LEFT_EDGE: '\\0??[',
    RIGHT_EDGE: '\\0??]',
    CENTER: '\\0??+',
    CENTER_STARPOINT: '\\0??*',
    BSTONE: '\\0??@',
    WSTONE: '\\0??!',

    EMPTY: '\\eLbl{_}',

    // Marks and StoneMarks
    BSTONE_TRIANGLE: '\\0??S',
    WSTONE_TRIANGLE: '\\0??s',
    TRIANGLE: '\\0??3',
    BSTONE_SQUARE: '\\0??S',
    WSTONE_SQUARE: '\\0??s',
    SQUARE: '\\0??2',
    BSTONE_CIRCLE: '\\0??C',
    WSTONE_CIRCLE: '\\0??c',
    CIRCLE: '\\0??1',
    BSTONE_XMARK: '\\0??X',
    WSTONE_XMARK: '\\0??x',
    XMARK: '\\0??4',
    BSTONE_TEXTLABEL: '\\goBsLbl{%s}',
    WSTONE_TEXTLABEL: '\\goWsLbl{%s}',
    TEXTLABEL: '\\eLbl{%s}'

    // BigBoard TextLabels
    // BSTONE_LABEL_BIG: '\goBsLblBig{%s}',
    // WSTONE_LABEL_BIG: '\goWsLblBig{%s}',
    // TEXTLABEL_BIG: '\eLblBig{%s}',

    // Formatting.  Should these be there?
    // BSTONE_INLINE: '\goinBsLbl{%s}',
    // WSTONE_INLINE: '\goinWsLbl{%s}',
    // MISC_STONE_INLINE: '\goinChar{%s}',
  },

  diagramArray: function(flattened) {
    var symbolFromEnum = glift.bridge.flattener.symbolFromEnum;
    var symb = glift.bridge.flattener.symbols;
    var cmap = glift.displays.diagrams.gooe.charMapping;
    var symbolPairs = flattened.symbolPairs;
    var repl = function(text, toInsert) {
      return text.replace("%s", toInsert);
    };
    var header = "{\\goo";
    var footer = "}";
    var lines = [[header]];
    for (var i = 0; i < symbolPairs.length; i++) {
      var symbolRow = symbolPairs[i];
      var outRow = [];
      for (var j = 0; j < symbolRow.length; j++) {
        var pair = symbolRow[j];
        var pt = glift.util.point(j, i);
        var intPt = flattened.ptToIntpt(pt);
        
        var base = pair.base;
        var baseName = symbolFromEnum(base);
        var mark = pair.mark;
        var markName = symbolFromEnum(mark);
        var combinedName = baseName + '_' + markName;
        // glift.util.logz(combined)

        var outChar = cmap.EMPTY;
        if (mark === symb.TEXTLABEL) {
          var lbl = flattened.getLabel(pt);
          switch(pair.base) {
            case symb.WSTONE:
              outChar = repl(cmap.WSTONE_TEXTLABEL, lbl); break;
            case symb.BSTONE:
              outChar = repl(cmap.BSTONE_TEXTLABEL, lbl); break;
            default: 
              outChar = repl(cmap.TEXTLABEL, lbl);
          }
        } else if (cmap[combinedName] !== undefined) {
          outChar = cmap[combinedName];
        } else if (cmap[markName] !== undefined && markName !== "EMPTY") {
          outChar = cmap[markName]; // For marks on EMPTY intersections.
        } else if (cmap[baseName] !== undefined) {
          outChar = cmap[baseName];
        }
        outRow.push(outChar);
      }
      lines.push(outRow);
    }
    lines.push([footer]);
    return lines;
  },

  diagramArrToString: function(diagramArray) {
    outArr = [];
    for (var i = 0; i < diagramArray.length; i++) {
      outArr.push(diagramArray[i].join(""));
    }
    return outArr.join("\n");
  },

  defs: {
    basicHeader: [
      '\\documentclass[a5paper]{book}',
      '\\usepackage{gooemacs}',
      '\\usepackage{xcolor}',
      '\\usepackage{wrapfig}',
      '\\usepackage{unicode}',
      '\\usepackage[margin=1in]{geometry}',
      '\\begin{document}'
    ],
    basicFooter: ['\\end{document}'],

    problemHeader: ['\\begin{center}'],
    problemFooter: ['\\end{center}'],

    sizeDefs: [
      '% Size definitions',
      '\\newdimen\\bigRaise',
      '\\bigRaise=4.3pt',
      '\\newdimen\\smallRaise',
      '\\smallRaise=3.5pt',
      '\\newdimen\\inlineRaise',
      '\\inlineRaise=3.5pt'
    ],
    bigBoardDefs: [
      '% Big-sized board defs',
      '\\def\\eLblBig#1{\\leavevmode\\hbox to \\goIntWd{\\hss\\raise\\bigRaise\\hbox{\\rm \\tenpointeleven{#1}}\\hss}}',
      '\\def\\goWsLblBig#1{\\setbox0=\\hbox{\\0??!}\\rlap{\\0??!}\\raise\\bigRaise\\hbox to \\wd0{\\hss\\tenpointeleven{#1}\\hss}}',
      '\\def\\goBsLblBig#1{\\setbox0=\\hbox{\\0??@}\\rlap{\\0??@}\\raise\\bigRaise\\hbox to \\wd0{\\hss\\color{white}\\tenpointeleven{#1}\\color{white}\\hss}}'
    ],
    normalBoardDefs: [
      '% Normal-sized board defs',
      '\\def\\eLbl#1{\\leavevmode\\hbox to \\goIntWd{\\hss\\raise\\smallRaise\\hbox{\\rm \\tenpoint{#1}}\\hss}}',
      '\\def\\goWsLbl#1{\\leavevmode\\setbox0=\\hbox{\\0??!}\\rlap{\\0??!}\\raise\\smallRaise\\hbox to \\wd0{\\hss\\eightpointnine{#1}\\hss}}',
      '\\def\\goBsLbl#1{\\leavevmode\\setbox0=\\hbox{\\0??@}\\rlap{\\0??@}\\raise\\smallRaise\\hbox to \\wd0{\\hss\\color{white}\\eightpointnine{#1}\\color{white}\\hss}}'
    ]
  },

  documentHeader: function(baseFont) {
    var baseFont = baseFont || 'cmss';
    var fontDefsBase = [
      '% Gooe font definitions',
      '\\font\\tenpoint=' + baseFont + '10',
      '\\font\\tenpointeleven=' + baseFont + '10 at 11pt',
      '\\font\\eightpoint=' + baseFont + '8',
      '\\font\\eightpointnine=' + baseFont + '8 at 9pt'
    ]
    var defs = glift.displays.diagrams.gooe.defs;
    var out = [].concat(defs.basicHeader)
      .concat(fontDefsBase)
      .concat(defs.sizeDefs)
      .concat(defs.normalBoardDefs)
    return out.join("\n");
  }
};
/**
 * Create a PDF diagram.
 *
 */
glift.displays.diagrams.pdf = {
  // TODO(kashomon): Support PDF generation.
};
/*
 * My own SVG utilities.  The only dependency is on JQuery.
 */
glift.displays.svg = {
  /**
   * Refresh the SVG.  When we append SVG via JQuery, the browser thinks the
   * content is HTML. When we reappend the SVG, the browser automatically does
   * the namespace conversion to true SVG. Alternatively, the browser gives us
   * several methods for adding SVG content. However, for efficiency, we want to
   * add all the elements at once.
   *
   * See:
   * http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element
   */
  refreshSvg:  function(id) {
    $('#' + id).html($('#' + id).html());
  }
};
glift.displays.svg.pathutils = {
  /**
   * Move the current position to X,Y.  Usually used in the context of creating a
   * path.
   */
  move: function(x, y) {
    return "M" + x + " " + y;
  },

  movePt: function(pt) {
    return glift.displays.svg.pathutils.move(pt.x(), pt.y());
  },

  /**
   * Create a relative SVG line, starting from the 'current' position.
   */
  lineRel: function(x, y) {
    return "l" + x + " " + y;
  },

  lineRelPt: function(pt) {
    return glift.displays.svg.pathutils.lineRel(pt.x(), pt.y());
  },

  /**
   * Create an absolute SVG line -- different from lower case.
   * This form is usually preferred.
   */
  lineAbs: function(x, y) {
    return "L" + x + " " + y;
  },

  // Create an absolute SVG line -- different from lower case.
  lineAbsPt: function(pt) {
    return glift.displays.svg.pathutils.lineAbs(pt.x(), pt.y());
  }
};
glift.displays.svg.createObj = function(type, attrObj) {
   return new glift.displays.svg.SvgObj(type, attrObj);
};

glift.displays.svg.svg = function(attrObj) {
  return new glift.displays.svg.SvgObj('svg', attrObj)
      .attr('version', '1.1')
      .attr('xmlns', 'http://www.w3.org/2000/svg');
};

glift.displays.svg.circle = function(attrObj) {
  return new glift.displays.svg.SvgObj('circle', attrObj);
};

glift.displays.svg.path = function(attrObj) {
  return new glift.displays.svg.SvgObj('path', attrObj);
};

glift.displays.svg.rect = function(attrObj) {
  return new glift.displays.svg.SvgObj('rect', attrObj);
};

glift.displays.svg.image = function(attrObj) {
  return new glift.displays.svg.SvgObj('image', attrObj);
};

glift.displays.svg.text = function(attrObj) {
  return new glift.displays.svg.SvgObj('text', attrObj);
};

glift.displays.svg.group = function() {
  return new glift.displays.svg.SvgObj('g');
};

glift.displays.svg.SvgObj = function(type, attrObj) {
  this._type = type;
  this._attrMap =  attrObj || {};
  this._children = [];
  this._idMap = {};
  this._text = '';
  this._data = undefined;
};

glift.displays.svg.SvgObj.prototype = {
  /**
   * Attach content to a div.
   */
  attachToParent: function(divId) {
    var svgContainer = document.getElementById(divId);
    if (svgContainer) {
      svgContainer.appendChild(this.asElement());
    }
  },

  /**
   * Turn this node (and all children nodes) into SVG elements.
   */
  asElement: function() {
    var elem = document.createElementNS(
        "http://www.w3.org/2000/svg", this._type);
    for (var attr in this._attrMap) {
      elem.setAttribute(attr, this._attrMap[attr]);
    }
    if (this._type === 'text') {
      var textNode = document.createTextNode(this._text);
      elem.appendChild(textNode);
    }
    for (var i = 0, len = this._children.length; i < len; i++) {
      elem.appendChild(this._children[i].asElement());
    }
    return elem;
  },

  /**
   * Append content to a div.  This requires that the element have a ID and
   * already be attached to the DOM.
   */
  flush: function() {
    // TODO(kashomon): Write...?
  },

  /**
   * Return the string form of the svg object.
   */
  render: function() {
    var base = '<' + this._type;
    for (var key in this._attrMap) {
      base += ' ' + key + '="' + this._attrMap[key] + '"';
    }
    base += '>' + this._text;
    if (this._children.length > 0) {
      var baseBuffer = [base];
      for (var i = 0, ii = this._children.length; i < ii; i++) {
        baseBuffer.push(this._children[i].render());
      }
      baseBuffer.push('</' + this._type + '>');
      base = baseBuffer.join("\n");
    } else {
      base += '</' + this._type + '>';
    }
    return base;
  },

  /**
   * Set or get an SVG attribute.
   */
  attr: function(key, value) {
    if (value !== undefined) {
      this._attrMap[key] = value;
      return this;
    } else {
      return this._attrMap[key];
    }
  },

  /**
   * Set or get all the an SVG attributes.
   */
  attrObj: function(obj) {
    if (obj !== undefined && glift.util.typeOf(obj) === 'object') {
      this._attrMap = obj;
      return this;
    } else {
      return this._attrMap;
    }
  },

  /**
   * Set some internal data. Note: this data is not attached when the element is
   * generated.
   */
  data: function(data) {
    if (data !== undefined) {
      this._data = data;
      return this;
    } else {
      return this._data
    }
  },

  /**
   * Append some text. Ususally only for the 'text' element.
   */
  text: function(text) {
    if (text !== undefined) {
      this._text = "" + text
      return this;
    } else {
      return this._text;
    }
  },

  /**
   * Get child from an Id.
   */
  child: function(id) {
    return this._idMap[id];
  },

  /**
   * Get child from an Id.
   */
  rmChild: function(id) {
    delete this._idMap[id];
    return this;
  },

  /**
   * Get all the Children.
   */
  children: function() {
    return this._children;
  },

  /**
   * Empty out all the children.
   */
  emptyChildren: function() {
    this._children = [];
    return this;
  },

  /**
   * Add an already existing child.
   *
   * Returns the object
   */
  append: function(obj) {
    if (obj.attr('id') !== undefined) {
      this._idMap[obj.attr('id')] = obj;
    }
    this._children.push(obj);
    return this;
  },

  /**
   * Add a new svg object child.
   */
  appendNew: function(type, attrObj) {
    var obj = glift.displays.svg.createObj(type, attrObj);
    return this.append(obj);
  },

  /**
   * Append an SVG element and attach to the DOM.
   */
  appendAndAttach: function(obj) {
    this.append(obj);
    if (this.attr('id')) {
      obj.attachToParent(this.attr('id'))
    }
  },

  copyNoChildren: function() {
    var newAttr = {};
    for (var key in this._attrMap) {
      newAttr[key] = this._attrMap[key];
    }
    return glift.displays.svg.createObj(this._type, newAttr);
  }
};
/**
 * Objects and methods that enforce the basic rules of Go.
 */
glift.rules = {};
(function(){
glift.rules.goban = {
  /**
   * Create a Goban instance, just with intersections.
   */
  getInstance: function(intersections) {
    var ints = intersections || 19;
    return new Goban(ints);
  },

  /**
   * Create a goban, from a move tree and (optionally) a treePath, which defines
   * how to get from the start to a given location.  Usually, the treePath is
   * the initialPosition, but not necessarily.
   *
   * returns:
   *  {
   *    goban: Goban,
   *    stoneDeltas: [StoneDelta, StoneDelta, ...]
   *  }
   */
  getFromMoveTree: function(mt, treepath) {
    var goban = new Goban(mt.getIntersections()),
        movetree = mt.getTreeFromRoot(),
        treepath = treepath || [],
        captures = []; // array of captures.
    goban.loadStonesFromMovetree(movetree); // Load root placements.
    for (var i = 0; i < treepath.length; i++) {
      movetree.moveDown(treepath[i]);
      captures.push(goban.loadStonesFromMovetree(movetree));
    }
    return {
      goban: goban,
      captures: captures
    };
  }
};

/**
 * The Goban tracks the state of the stones.
 *
 * Note that, for our purposes,
 * x: refers to the column.
 * y: refers to the row.
 *
 * Thus, to get a particular "stone" you must do
 * stones[y][x]. Also, stones are 0-indexed.
 *
 * 0,0    : Upper Left
 * 0,19   : Lower Left
 * 19,0   : Upper Right
 * 19,19  : Lower Right
 *
 * As a historical note, this is the oldest part of Glift.
 */
var Goban = function(ints) {
  if (ints <= 0) throw "Intersections must be greater than 0";
  this.ints = ints;
  this.stones = initStones(ints);
};

Goban.prototype = {
  intersections: function() {
    return this.ints;
  },

  /**
   * getStone helps abstract the nastiness and trickiness of having to use the x/y
   * indices in the reverse order.
   *
   * Returns: a Color from glift.enums.states.
   */
  getStone: function(point) {
    return this.stones[point.y()][point.x()];
  },

  /**
   * Get all the placed stones on the board (BLACK or WHITE)
   * Returns an array of the form:
   *  [ {point:<point>, color:<color>}, {...}, ...]
   */
  getAllPlacedStones: function() {
    var out = [];
    for (var i = 0; i < this.stones.length; i++) {
      var row = this.stones[i];
      for (var j = 0; j < row.length; j++) {
        var point = glift.util.point(j, i);
        var color = this.getStone(point);
        if (color === glift.enums.states.BLACK ||
            color === glift.enums.states.WHITE) {
          out.push({point:point, color:color});
        }
      }
    }
    return out;
  },

  // Returns true or false:
  // True = stone can be placed
  // False = can't
  placeable: function(point, color) {
    // Currently, color is unused, but there are plans to use it because
    // self-capture is disallowed.
    return this.inBounds(point)
        && this.getStone(point) === glift.enums.states.EMPTY;
  },

  // Returns true if out-of-bounds.  False, otherwise
  outBounds: function(point) {
    return glift.util.outBounds(point.x(), this.ints)
        || glift.util.outBounds(point.y(), this.ints);
  },

  // Returns true if in-bounds. False, otherwise
  inBounds: function(point) {
    return glift.util.inBounds(point.x(), this.ints)
        && glift.util.inBounds(point.y(), this.ints);
  },

  // Simply set the intersection back to EMPTY
  clearStone: function(point) {
    this._setColor(point, glift.enums.states.EMPTY);
  },

  clearSome: function(points) {
    for (var i = 0; i < points.length; i++) {
      this.clearStone(points[i]);
    }
  },

  _setColor: function(point, color) {
    this.stones[point.y()][point.x()] = color;
  },

  /**
   * addStone: Add a stone to the GoBoard (0-indexed).  Requires the
   * intersection (a point) where the stone is to be placed, and the color of
   * the stone to be placed.
   *
   * addStone always returns a StoneResult object.
   *
   * A diagram of a StoneResult:
   * {
   *    successful: true or false   // Was placing a stone successful?
   *    captures : [ ... points ... ]  // the intersections of stones captured
   *        by placing a stone at the intersection (pt).
   * }
   *
   */
  addStone: function(pt, color) {
    if (!glift.util.colors.isLegalColor(color)) throw "Unknown color: " + color;

    // Add stone fail.  Return a failed StoneResult.
    if (this.outBounds(pt) || !this.placeable(pt))
      return new StoneResult(false);

    this._setColor(pt, color); // set stone as active
    var captures = new CaptureTracker();
    var oppColor = glift.util.colors.oppositeColor(color);

    this._getCaptures(captures, glift.util.point(pt.x() + 1, pt.y()), oppColor);
    this._getCaptures(captures, glift.util.point(pt.x() - 1, pt.y()), oppColor);
    this._getCaptures(captures, glift.util.point(pt.x(), pt.y() - 1), oppColor);
    this._getCaptures(captures, glift.util.point(pt.x(), pt.y() + 1), oppColor);

    if (captures.numCaptures <= 0) {
      // We are now in a state where placing this stone results in 0 liberties.
      // Now, we check if move is self capture -- i.e., if the move doesn't
      // capture any stones.
      this._getCaptures(captures, pt, color);
      if (captures.numCaptures > 0) {
        // Onos! The move is self capture.
        this.clearStone(pt);
        return new StoneResult(false);
      }
    }

    var actualCaptures = captures.getCaptures();
    // Remove the captures from the board.
    this.clearSome(actualCaptures);
    return new StoneResult(true, actualCaptures);
  },

  // Get the captures.  We return nothing because state is stored in 'captures'
  _getCaptures: function(captures, pt, color) {
    this._findConnected(captures, pt, color);
    if (captures.liberties <= 0) captures.consideringToCaptures();
    captures.clearExceptCaptures();
  },

  // find the stones of the same color connected to eachother.  The color to
  // find is the param color. We return nothing because state is stored in
  // 'captures'.
  _findConnected: function(captures, pt, color) {
    var util = glift.util;
    // check to make sure we haven't already seen a stone
    // and that the point is not out of bounds.  If
    // either of these conditions fail, return immediately.
    if (captures.seen[pt.hash()] !== undefined || this.outBounds(pt)) {
      // we're done -- there's no where to go.
    } else {
      // note that we've seen the point
      captures.seen[pt.hash()] = true;
      var stoneColor = this.getStone(pt);
      if (stoneColor === glift.enums.states.EMPTY)    {
        // add a liberty if the point is empty and return
        captures.liberties++;
      } else if (stoneColor === util.colors.oppositeColor(color)) {
        // return and don't add liberties.  This works because we assume that
        // the stones start out with 0 liberties, and then we go along and add
        // the liberties as we see them.
      } else if (stoneColor === color) {
        // recursively add connected stones
        captures.considering.push(pt);
        this._findConnected(captures, util.point(pt.x() + 1, pt.y()), color);
        this._findConnected(captures, util.point(pt.x() - 1, pt.y()), color);
        this._findConnected(captures, util.point(pt.x(), pt.y() + 1), color);
        this._findConnected(captures, util.point(pt.x(), pt.y() - 1), color);
      } else {
        // Sanity check.
        throw "Unknown color error: " + stoneColor;
      }
    }
  },

  /**
   * For the current position in the movetree, load all the stone values into
   * the goban. This includes placements [AW,AB] and moves [B,W].
   *
   * returns captures -- an object that looks like the following
   * {
   *    WHITE: [{point},{point},{point},...],
   *    BLACK: [{point},{point},{point},...]
   * }
   */
  loadStonesFromMovetree: function(movetree) {
    var colors = [ glift.enums.states.BLACK, glift.enums.states.WHITE ];
    var captures = { BLACK : [], WHITE : [] };
    for (var i = 0; i < colors.length; i++) {
      var color = colors[i]
      var placements = movetree.properties().getPlacementsAsPoints(color);
      for (var j = 0; j < placements.length; j++) {
        this._loadStone({point: placements[j], color: color}, captures);
      }
    }
    this._loadStone(movetree.properties().getMove(), captures);
    return captures;
  },

  _loadStone: function(mv, captures) {
    // note: if mv is defined, but mv.point is undefined, this is a PASS.
    if (mv !== glift.util.none && mv.point !== undefined) {
      var result = this.addStone(mv.point, mv.color);
      if (result.successful) {
        var oppositeColor = glift.util.colors.oppositeColor(mv.color);
        for (var k = 0; k < result.captures.length; k++) {
          captures[oppositeColor].push(result.captures[k]);
        }
      }
    }
  },

  /**
   * Back out a movetree addition (used for going back a move).
   *
   * Recall that stones and captures both have the form:
   *  { BLACK: [..pts..], WHITE: [..pts..] };
   */
  // TODO(kashomon): Add testing for this in goban_test
  unloadStones: function(stones, captures) {
    var colors = [ glift.enums.states.BLACK, glift.enums.states.WHITE ];
    for (var color in stones) {
      for (var j = 0; j < stones[color].length; j++) {
        this.clearStone(stones[color][j]);
      }
    }
    for (var color in captures) {
      for (var i = 0; i < captures[color].length; i++) {
        this.addStone(captures[color][i], color);
      }
    }
  },

  // for debug, of course =)
  _debug: function() {
    glift.util.logz(this.stones);
  }
}

// Utiity functions

// Private function to initialize the stones.
var initStones = function(ints) {
  var stones = [];
  for (var i = 0; i < ints; i++) {
    var newRow = [];
    for (var j = 0; j < ints; j++) {
      newRow[j] = glift.enums.states.EMPTY;
    }
    stones[i] = newRow
  }
  return stones;
};


// CaptureTracker is a utility object that assists in keeping track of captures.
// As an optimization, we keep track of points we've seen for efficiency.
var CaptureTracker = function() {
  this.toCapture = {}; // set of points to capture (mapping pt.hash() -> true)
  this.numCaptures = 0;
  this.considering = []; // list of points we're considering to capture
  this.seen = {}; // set of points we've seen (mapping pt.hash() -> true)
  this.liberties = 0;
};

CaptureTracker.prototype = {
  clearExceptCaptures: function() {
    this.considering =[];
    this.seen = {};
    this.liberties = 0;
  },

  consideringToCaptures: function() {
    for (var i = 0; i < this.considering.length; i++) {
      var value = this.considering[i];
      if (this.toCapture[value.hash()] === undefined) {
        this.toCapture[value.hash()] = true;
        this.numCaptures++;
      }
    }
  },

  addLiberties: function(x) {
    this.liberties += x;
  },

  addSeen: function(point) {
    this.seen[point.hash()] = true;
  },

  getCaptures: function() {
    var out = [];
    for (var key in this.toCapture) {
      out.push(glift.util.pointFromHash(key));
    }
    return out;
  }
};

// The stone result keeps track of whether placing a stone was successful and what
// stones (if any) were captured.
var StoneResult = function(success, captures) {
  this.successful = success;
  if (success) {
    this.captures = captures;
  } else {
    this.captures = [];
  }
};

})();
glift.rules.movenode = function(properties, children, nodeId, parentNode) {
  return new glift.rules._MoveNode(properties, children, nodeId, parentNode);
};

glift.rules._MoveNode = function(properties, children, nodeId, parentNode) {
  this._properties = properties || glift.rules.properties();
  this.children = children || [];
  // nodeId has the form { nodeNum: 0, varNum: 0 };
  this._nodeId = nodeId || { nodeNum: 0, varNum: 0 };
  this._parentNode = parentNode;
};

glift.rules._MoveNode.prototype = {
  properties:  function() {
    return this._properties;
  },

  /**
   * Set the NodeId. Each node has an ID based on the depth and variation
   * number.
   *
   * Great caution should be exercised when using this method.  If you
   * don't adjust the surrounding nodes, the movetree will get into a funky
   * state.
   */
  _setNodeId: function(nodeNum, varNum) {
    this._nodeId = { nodeNum: nodeNum, varNum: varNum };
    return this;
  },

  /**
   * Get the node number (i.e., the depth number).  For our purposes, we
   * consider passes to be moves, but this is a special enough case that it
   * shouldn't matter for most situations.
   */
  getNodeNum: function() {
    return this._nodeId.nodeNum
  },

  /**
   * Get the variation number.
   */
  getVarNum: function() {
    return this._nodeId.varNum
  },

  /**
   * Get the number of children.  This the same semantically as the number of
   * variations.
   */
  numChildren: function() {
    return this.children.length;
  },

  /**
   * Add a new child node.
   */
  addChild: function() {
    this.children.push(glift.rules.movenode(
      glift.rules.properties(),
      [], // children
      { nodeNum: this.getNodeNum() + 1, varNum: this.numChildren() },
      this));
    return this;
  },

  /**
   * Get the next child node.  This the same semantically as moving down the
   * movetree.
   */
  getChild: function(variationNum) {
    if (variationNum === undefined) {
      return this.children[0];
    } else {
      return this.children[variationNum];
    }
  },

  /**
   * Return the parent node. Returns util.none if no parent node exists.
   */
  getParent: function() {
    if (this._parentNode ) {
      return this._parentNode;
    } else {
      return glift.util.none;
    }
  },

  /**
   * Renumber the nodes.  Useful for when nodes are deleted during SGF editing.
   */
  renumber: function() {
    numberMoves(this, this._nodeId.nodeNum, this._nodeId.varNum);
    return this;
  }
};

// Private number moves function
var numberMoves = function(move, nodeNum, varNum) {
  move._setNodeId(nodeNum, varNum);
  for (var i = 0; i < move.children.length; i++) {
    var next = move.children[i];
    numberMoves(next, nodeNum + 1, i);
  }
  return move;
};
/**
 * When an SGF is parsed by the parser, it is transformed into the following:
 *
 *MoveTree {
 * _currentNode
 * _rootNode
 *}
 *
 * And where a MoveNode looks like the following:
 * MoveNode: {
 *    nodeId: { ... },
 *    properties: Properties,
 *    children: [MoveNode, MoveNode, MoveNode],
 *    parent: MoveNode
 *  }
 *}
 *
 * Additionally, each node in the movetree has an ID property that looks like:
 *
 * node : {
 *  nodeId : <num>,  // The vertical position in the tree.
 *  varId  : <num>,  // The variation number, which is identical to the position
 *                   // in the 'nodes' array.  Also, the 'horizontal' position .
 * }
 *
 * If you are familiar with the SGF format, this should look very similar to the
 * actual SGF format, and is easily converted back to a SGF. And so, The
 * MoveTree is a simple wrapper around the parsed SGF.
 *
 * Each move is an object with two properties: tokens and nodes, the
 * latter of which is a list to capture the idea of multiple variations.
 */
glift.rules.movetree = {
  /** Create an empty MoveTree */
  getInstance: function(intersections) {
    var mt = new glift.rules._MoveTree(glift.rules.movenode());
    if (intersections !== undefined) {
      mt.setIntersections(intersections);
    }
    return mt;
  },

  /** Create a MoveTree from an SGF. */
  getFromSgf: function(sgfString, initPosition) {
    initPosition = initPosition || []; // treepath.
    if (sgfString === undefined || sgfString === "") {
      return glift.rules.movetree.getInstance(19);
    }
    // var mt = new MoveTree(glift.sgf.parser.parse($.trim(sgfString)));
    var mt = glift.sgf.parse(sgfString);
    for (var i = 0; i < initPosition.length; i++) {
      mt.moveDown(initPosition[i]);
    }
    return mt;
  },

  /**
   * Since a MoveTree is a tree of connected nodes, we can create a sub-tree
   * from any position in the tree.  This can be useful for recursion.
   */
  getFromNode: function(node) {
    return new glift.rules._MoveTree(node);
  },

  /** Seach nodes with a Depth First Search. */
  searchMoveTreeDFS: function(moveTree, func) {
    func(moveTree);
    for (var i = 0; i < moveTree.node().numChildren(); i++) {
      glift.rules.movetree.searchMoveTreeDFS(moveTree.moveDown(i), func);
    }
    moveTree.moveUp();
  }
};

/**
 * A MoveTree is a tree of movenodes played.  The movetree is (usually) a
 * processed parsed SGF, but could be created organically.
 *
 * Semantically, a MoveTree can be thought of as a game, but could also be a
 * problem, demonstration, or example.  Thus, this is the place where such moves
 * as currentPlayer or lastMove.
 */
glift.rules._MoveTree = function(rootNode, currentNode) {
  this._rootNode = rootNode;
  this._currentNode = currentNode || rootNode;
};

glift.rules._MoveTree.prototype = {
  /** Get a new move tree instance from the root node. */
  getTreeFromRoot: function() {
    return glift.rules.movetree.getFromNode(this._rootNode);
  },

  /**
   * Get a new tree reference.  The underlying tree remains the same, but this
   * is a lightway to create new references so the current node position can be
   * changed.
   */
  newTreeRef: function() {
    return new glift.rules._MoveTree(this._rootNode, this._currentNode);
  },

  /**
   * Get the current node -- that is, the node at the current position.
   */
  node: function() {
    return this._currentNode;
  },

  /**
   * Get the properties object on the current node.
   */
  properties: function() {
    return this.node().properties();
  },

  /**
   * Given a point and a color, find the variation number corresponding to the
   * branch that has the sepceified move.
   *
   * return either the number or glift.util.none;
   */
  findNextMove: function(point, color) {
    var nextNodes = this.node().children,
        token = glift.sgf.colorToToken(color),
        ptSet = {};
    for (var i = 0; i < nextNodes.length; i++) {
      var node = nextNodes[i];
      if (node.properties().contains(token)) {
        if (node.properties().getOneValue(token) == "") {
          // This is a 'PASS'.  Ignore
        } else {
          ptSet[node.properties().getAsPoint(token).hash()] =
            node.getVarNum();
        }
      }
    }
    if (ptSet[point.hash()] !== undefined) {
      return ptSet[point.hash()];
    } else {
      return glift.util.none;
    }
  },

  /**
   * Get the last move ([B] or [W]). This is a convenience method, since it
   * delegates to properties().getMove();
   *
   * Returns a simple object:
   *  {
   *    color:
   *    point:
   *  }
   *
   * returns glift.util.none if property doesn't exist.  There are two cases
   * where this can occur:
   *  - The root node.
   *  - When, in the middle of the game, stone-placements are added for
   *  illustration (AW,AB).
   */
  getLastMove: function() {
    return this.properties().getMove();
  },

  /**
   * Get the next moves (i.e., nodes with either B or W properties);
   *
   * returns an array of dicts with the moves, e.g.,
   *
   *  [{
   *    color: <BLACK or WHITE>
   *    point: point
   *  },
   *  {...}]
   *
   *  The ordering of the moves is guranteed to be the ordering of the
   *  variations at the time of creation.
   */
  nextMoves: function() {
    var curNode = this.node();
    var nextMoves = [];
    for (var i = 0; i < curNode.numChildren(); i++) {
      var nextNode = curNode.getChild(i);
      var move = nextNode.properties().getMove();
      if (move !== glift.util.none) {
        nextMoves.push(move);
      }
    }
    return nextMoves;
  },

  /**
   * Get the current player.  This is exactly the opposite of the last move that
   * was played -- i.e., the move on the current node.
   */
  getCurrentPlayer: function() {
    var move = this.properties().getMove();
    var enums = glift.enums;
    if (move === glift.util.none) {
      return enums.states.BLACK;
    } else if (move.color === enums.states.BLACK) {
      return enums.states.WHITE;
    } else if (move.color === enums.states.WHITE) {
      return enums.states.BLACK;
    } else {
      // TODO(kashomon): This is not the right way to do this.  Really, we need
      // to traverse up the tree until we see a color, and return the opposite.
      // If we reach the root, _then_ we can return BLACK.
      return enums.states.BLACK;
    }
  },

  /**
   * Move down, but only if there is an available variation.  variationNum can
   * be undefined for convenicence, in which case it defaults to 0.
   */
  moveDown: function(variationNum) {
    var num = variationNum === undefined ? 0 : variationNum;
    if (this.node().getChild(num) !== undefined) {
      this._currentNode = this.node().getChild(num);
    }
    return this;
  },

  /**
   * Move up a move, but only if you are not in the intial (0th) move.
   */
  moveUp: function() {
    var parent = this._currentNode.getParent();
    if (parent !== undefined && parent !== glift.util.none) {
      this._currentNode = parent;
    }
    return this;
  },

  // Move to the root node
  moveToRoot: function() {
    this._currentNode = this._rootNode;
    return this;
  },

  /**
   * Add a newNode and move to that position.  This is convenient becuase it
   * means you can start adding properties.
   */
  addNode: function() {
    this.node().addChild();
    this.moveDown(this.node().numChildren() - 1);
    return this;
  },

  // TODO(kashomon): Finish this.
  deleteCurrentNode: function() {
    // var nodeId = glift.rules.movetree.getNodeId();
    // VarNum = this.getVarNum();
    // this.moveUp();
    // var theMoves = this.getAllNextNodes();
    //delete theMoves(nodeId,VarNum); // This is currently a syntax error
    throw "Unfinished";
  },

  recurse: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this, func);
  },

  recurseFromRoot: function(func) {
    glift.rules.movetree.searchMoveTreeDFS(this.getTreeFromRoot(), func);
  },

  // TODO(kashomon): Add this.
  toSgf: function() {
    var out = "";
    for (var propKey in this.getAllProps()) {
      //TODO
    }
  },

  debugLog: function(spaces) {
    if (spaces === undefined) {
      spaces = "  ";
    }
    glift.util.logz(spaces + this.node(i).getVarNum() + '-'
        + this.node(i).getNodeNum());
    for (var i = 0; i < this.node().numChildren(); i++) {
      this.moveDown(i);
      this.debugLog(spaces);
      this.moveUp();
    }
  },

  //---------------------//
  // Convenience methods //
  //---------------------//
  setIntersections: function(intersections) {
    var mt = this.getTreeFromRoot(),
        allProperties = glift.sgf.allProperties;
    if (!mt.properties().contains(allProperties.SZ)) {
      this.properties().add(allProperties.SZ, intersections + "");
    }
    return this;
  },

  getIntersections: function() {
    var mt = this.getTreeFromRoot(),
        allProperties = glift.sgf.allProperties;
    if (mt.properties().contains(allProperties.SZ)) {
      var ints = parseInt(mt.properties().getAllValues(allProperties.SZ));
      return ints;
    } else {
      return undefined;
    }
  }
};
glift.rules.problems = {
  /**
   * Determines if a 'move' is correct. Takes a movetree and a series of
   * conditions, which is a map of properties to an array of possible substring
   * matches.  Only one conditien must be met
   *
   * Some Examples:
   *    Correct if there is a GB property or the words 'Correct' or 'is correct' in
   *    the comment. This is the default.
   *    { GB: [], C: ['Correct', 'is correct'] }
   *
   *    Nothing is correct
   *    {}
   *
   *    Correct as long as there is a comment tag.
   *    { C: [] }
   *
   *    Correct as long as there is a black stone (a strange condition).
   *    { B: [] }
   *
   * Returns one of enum.problemResults (CORRECT, INDETERMINATE, INCORRECT).
   */
  isCorrectPosition: function(movetree, conditions) {
    var problemResults = glift.enums.problemResults;
    if (movetree.properties().matches(conditions)) {
      return problemResults.CORRECT;
    } else {
      var flatPaths = glift.rules.treepath.flattenMoveTree(movetree);
      var successTracker = {};
      for (var i = 0; i < flatPaths.length; i++) {
        var path = flatPaths[i];
        var newmt = glift.rules.movetree.getFromNode(movetree.node());
        var pathCorrect = false
        for (var j = 0; j < path.length; j++) {
          newmt.moveDown(path[j]);
          if (newmt.properties().matches(conditions)) {
            pathCorrect = true;
          }
        }
        if (pathCorrect) {
          successTracker[problemResults.CORRECT] = true;
        } else {
          successTracker[problemResults.INCORRECT] = true;
        }
      }
      if (successTracker[problemResults.CORRECT] &&
          !successTracker[problemResults.INCORRECT]) {
        return problemResults.CORRECT;
      } else if (successTracker[problemResults.CORRECT] &&
          successTracker[problemResults.INCORRECT]) {
        return problemResults.INDETERMINATE;
      } else {
        return problemResults.INCORRECT;
      }
    }
  },

  /**
   * Get the correct next moves.
   *
   * returns: the 'correct' next moves. In other words
   *
   * [{ point: <point>, color: <color>  },..
   * ]
   */
  correctNextMoves: function(movetree, conditions) {
    var nextMoves = movetree.nextMoves();
    var INCORRECT = glift.enums.problemResults.INCORRECT;
    var correctNextMoves = [];
    for (var i = 0; i < nextMoves.length; i++) {
      movetree.moveDown(i);
      if (glift.rules.problems.isCorrectPosition(movetree, conditions)
          !== INCORRECT) {
        correctNextMoves.push(nextMoves[i]);
      }
      movetree.moveUp(); // reset the position
    }
    return correctNextMoves;
  }
};
(function() {
glift.rules.properties = function(map) {
  return new Properties(map);
};

var Properties = function(map) {
  if (map === undefined) {
    this.propMap = {};
  } else {
    this.propMap = map;
  }
}

Properties.prototype = {
  /**
   * Add an SGF Property to the current move. Return the 'this', for
   * convenience, so that you can chain addProp calls.
   *
   * Eventually, each sgf property should be matched to a datatype.  For now,
   * the user is allowed to put arbitrary data into a property.
   *
   * Note that this does not overwrite an existing property - for that, the user
   * has to delete the existing property. If the property already exists, we add
   * another data element onto the array.
   */
  add: function(prop, value) {
    // Return if the property is not string or a real property
    if (glift.sgf.allProperties[prop] === undefined) {
      throw "Can't add undefined properties";
    } else if (glift.util.typeOf(value) !== 'string' &&
        glift.util.typeOf(value) !== 'array') {
      // The value has to be either a string or an array.
      value = value.toString();
    }
    value = glift.util.typeOf(value) === 'string' ? [value] : value;

    // If the type is a string, make into an array or concat.
    if (this.contains(prop)) {
      this.propMap[prop] = this.getAllValues(prop).concat(value);
    } else {
      this.propMap[prop] = value;
    }
    return this;
  },

  /**
   * Return an array of data associated with a property key
   */
  getAllValues: function(strProp) {
    if (glift.sgf.allProperties[strProp] === undefined) {
      return glift.util.none; // Not a valid Property
    } else if (this.propMap[strProp] !== undefined) {
      return this.propMap[strProp];
    } else {
      return glift.util.none;
    }
  },

  /**
   * Get one piece of data associated with a property. Default to the first
   * element in the data associated with a property.
   *
   * Since the getOneValue() always returns an array, it's sometimes useful to
   * return the first property in the list.  Like getOneValue(), if a property
   * or value can't be found, util.none is returned.
   */
  getOneValue: function(strProp, index) {
    var index = (index !== undefined
        && typeof index === 'number' && index >= 0) ? index : 0;
    var arr = this.getAllValues(strProp);
    if (arr !== glift.util.none && arr.length >= 1) {
      return arr[index];
    } else {
      return glift.util.none;
    }
  },

  /**
   * Get a value from a property and return the point representation.
   * Optionally, the user can provide an index, since each property points to an
   * array of values.
   */
  getAsPoint: function(strProp, index) {
    var out = this.getOneValue(strProp, index);
    if (out === glift.util.none) {
      return out;
    } else {
      return glift.util.pointFromSgfCoord(out);
    }
  },

  /**
   * contains: Return true if the current move has the property "prop".  Return
   * false otherwise.
   */
  contains: function(prop) {
    return this.getAllValues(prop) !== glift.util.none;
  },

  /** Delete the prop and return the value. */
  remove: function(prop) {
    if (this.contains(prop)) {
      var allValues = this.getAllValues(prop);
      delete this.propMap[prop];
      return allValues;
    } else {
      return glift.util.none;
    }
  },

  /**
   * Sets current value, even if the property already exists.
   */
  set: function(prop, value) {
    if (prop !== undefined && value !== undefined) {
      if (glift.util.typeOf(value) === 'string') {
        this.propMap[prop] = [value]
      } else if (glift.util.typeOf(value) === 'array') {
        this.propMap[prop] = value
      }
    }
    return this;
  },

  //---------------------//
  // Convenience methods //
  //---------------------//

  // Get all the placements for a color (BLACK or WHITE).  Return as an array.
  getPlacementsAsPoints: function(color) {
    var prop = "";
    if (color === glift.enums.states.BLACK) {
      prop = glift.sgf.allProperties.AB;
    } else if (color === glift.enums.states.WHITE) {
      prop = glift.sgf.allProperties.AW;
    }
    if (prop === "" || !this.contains(prop)) {
      return [];
    }
    return glift.sgf.allSgfCoordsToPoints(this.getAllValues(prop));
  },

  getComment: function() {
    if (this.contains('C')) {
      return this.getOneValue('C');
    } else {
      return glift.util.none;
    }
  },

  /**
   * Get the current Move.  Returns util.none if no move exists.
   *
   * Specifically, returns a dict:
   *  {
   *    color: <BLACK / WHITE>
   *    point: point
   *  }
   *
   * If the move is a pass, then in the SGF, we'll see B[] or W[].  Thus,
   * we will return { color: BLACK } or { color: WHITE }, but we won't have any
   * point associated with this.
   */
  getMove: function() {
    var BLACK = glift.enums.states.BLACK;
    var WHITE = glift.enums.states.WHITE;
    if (this.contains('B')) {
      if (this.getOneValue('B') === "") {
        return { color: BLACK }; // This is a PASS
      } else {
        return { color: BLACK, point: this.getAsPoint('B') }
      }
    } else if (this.contains('W')) {
      if (this.getOneValue('W') === "") {
        return { color: WHITE }; // This is a PASS
      } else {
        return { color: WHITE, point: this.getAsPoint('W') };
      }
    } else {
      return glift.util.none;
    }
  },

  /**
   * Test whether this set of properties match a series of conditions.  Returns
   * true or false.  Conditions have the form:
   *
   * { <property>: [series,of,conditions,to,match], ... }
   *
   * Example:
   *    Matches if there is a GB property or the words 'Correct' or 'is correct' in
   *    the commentj
   *    { GB: [], C: ['Correct', 'is correct'] }
   *
   * Note: This is an O(lnm) ~ O(n^3).  But practice, you'll want to test
   * against singular properties, so it's more like O(n^2)
   */
  matches: function(conditions) {
    for (var key in conditions) {
      if (this.contains(key)) {
        var substrings = conditions[key];
        if (substrings.length === 0) {
          return true;
        }
        var allValues = this.getAllValues(key);
        for (var i = 0; i < allValues.length; i++) {
          for (var j = 0; j < substrings.length; j++) {
            var value = allValues[i];
            var substr = substrings[j];
            if (value.indexOf(substr) !== -1) {
              return true;
            }
          }
        }
      }
    }
    return false
  },

  /**
   * Get all the stones (placements and moves).  This ignores 'PASS' moves.
   *
   * returns:
   *  {
   *    BLACK: <pts>
   *    WHITE: <pts>
   *  }
   */
  getAllStones: function() {
    var states = glift.enums.states,
        out = {},
        BLACK = states.BLACK,
        WHITE = states.WHITE;
    out[BLACK] = this.getPlacementsAsPoints(states.BLACK);
    out[WHITE] = this.getPlacementsAsPoints(states.WHITE);
    var move = this.getMove();
    if (move != glift.util.none && move.point !== undefined) {
      out[move.color].push(move.point);
    }
    return out;
  }
};

})();
/**
 * The treepath is specified by a String, which tells how to get to particular
 * position in a game / problem.
 *
 * Note: Both moves and and variations are 0 indexed.
 *
 * Some examples:
 * 0         - Start at the 0th move (the root node)
 * 53        - Start at the 53rd move, taking the primary path
 * 2.3       - Start at the 3rd variation on move 2 (actually move 3)
 * 3         - Start at the 3rd move
 * 2.0       - Start at the 3rd move
 * 0.0.0.0   - Start at the 3rd move
 * 2.3-4.1   - Start at the 1st variation of the 4th move, arrived at by traveling
 *             through the 3rd varition of the 2nd move
 *
 * Note: '+' is a special symbol which means "go to the end via the first
 * variation."
 *
 * The init position returned is an array of variation numbers traversed through.
 * The move number is precisely the length of the array.
 *
 * So:
 * 0       becomes []
 * 1       becomes [0]
 * 0.1     becomes [1]
 * 53      becomes [0,0,0,...,0] (53 times)
 * 2.3     becomes [0,0,3]
 * 0.0.0.0 becomes [0,0,0]
 * 2.3-4.1 becomes [0,0,3,0,1]
 * 1+      becomes [0,0,...(500 times)]
 * 0.1+    becomes [1,0,...(500 times)]
 * 0.2.6+  becomes [2,6,0,...(500 times)]
 */
glift.rules.treepath = {
  parseInitPosition: function(initPos) {
    var errors = glift.errors
    if (initPos === undefined) {
      return [];
    } else if (glift.util.typeOf(initPos) === 'number') {
      initPos = "" + initPos;
    } else if (glift.util.typeOf(initPos) === 'array') {
      return initPos;
    } else if (glift.util.typeOf(initPos) === 'string') {
      // Fallthrough and parse the path.  This is the expected behavior.
    } else {
      return [];
    }

    if (initPos === '+') {
      return this.toEnd();
    }

    var out = [];
    var lastNum = 0;
    // "2.3-4.1+"
    var sect = initPos.split('-');
    // [2.3, 4.1+]
    for (var i = 0; i < sect.length; i++) {
      // 4.1 => [4,1+]
      var v = sect[i].split('\.');
      // Handle the first number (e.g., 4);
      for (var j = 0; j < v[0] - lastNum; j++) {
        out.push(0);
      }
      var lastNum = v[0];
      // Handle the rest of the numbers (e.g., 1+)
      for (var j = 1; j < v.length; j++) {
        // Handle the last number. 1+
        var testNum = v[j];
        if (testNum.charAt(testNum.length - 1) === '+') {
          testNum = testNum.slice(0, testNum.length - 1);
          out.push(parseInt(testNum));
          // + must be the last character.
          out = out.concat(glift.rules.treepath.toEnd());
          return out;
        } else {
          out.push(parseInt(testNum));
        }
        lastNum++;
      }
    }
    return out;
  },

  /**
   * Return an array of 500 0-th variations.  This is sort of a hack, but
   * changing this would involve rethinking what a treepath is.
   */
  toEnd: function() {
    if (glift.rules.treepath._storedToEnd !== undefined) {
      return glift.rules.treepath._storedToEnd;
    }
    var storedToEnd = []
    for (var i = 0; i < 500; i++) {
      storedToEnd.push(0);
    }
    glift.rules.treepath._storedToEnd = storedToEnd;
    return glift.rules.treepath._storedToEnd;
  },

  // Flatten the move tree variations into a list of lists, where the sublists
  // are each a treepath.
  //
  // TODO(kashomon): Why does this exist?
  flattenMoveTree: function(movetree) {
    var out = [];
    for (var i = 0; i < movetree.node().numChildren(); i++) {
      movetree.moveDown(i);
      var result = glift.rules.treepath._flattenMoveTree(movetree, []);
      movetree.moveUp();
      for (var j = 0; j < result.length; j++) {
        out.push(result[j])
      }
    }
    return out;
  },

  _flattenMoveTree: function(movetree, pathToHere) {
    if (pathToHere === undefined) pathToHere = [];
    pathToHere.push(movetree.node().getVarNum());
    var out = [];
    for (var i = 0; i < movetree.node().numChildren(); i++) {
      movetree.moveDown(i)
      var thisout = glift.rules.treepath._flattenMoveTree(
          movetree, pathToHere.slice());
      out = out.concat(thisout)
      movetree.moveUp(i)
    }
    if (out.length == 0) out.push(pathToHere);
    return out;
  }
};
/**
 * The SGF library contains functions for dealing with SGFs.
 *
 * sgf_grammar.js: sgf parser generated, generated from the pegjs grammar.
 *  -> This is called with glift.rules.parser.parse(...);
 *
 * sgf_grammar.pegjs. To regenerate the parser from the peg grammar, use
 * depgen.py.
 */
glift.sgf = {
  colorToToken: function(color) {
    if (color === glift.enums.states.WHITE) {
      return 'W';
    } else if (color === glift.enums.states.BLACK) {
      return 'B';
    } else {
      throw "Unknown color-to-token conversion for: " + color;
    }
  },

  allSgfCoordsToPoints: function(arr) {
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      out.push(glift.util.pointFromSgfCoord(arr[i]));
    }
    return out;
  },

  convertFromLabelData: function(data) {
    var parts = data.split(":"),
        pt = glift.util.pointFromSgfCoord(parts[0]),
        value = parts[1];
    return {point: pt, value: value};
  },

  convertFromLabelArray: function(arr) {
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      out.push(glift.sgf.convertFromLabelData(arr[i]));
    }
    return out;
  },

  pointToSgfCoord: function(pt) {
    var a = 'a'.charCodeAt(0);
    return String.fromCharCode(pt.x() +  a) + String.fromCharCode(pt.y() + a);
  }
};
/**
 * The new Glift SGF parser!
 * Takes a string, returns a movetree.  Probably needs refactoring.
 */
glift.sgf.parse = function(sgfString) {
  var states = {
    BEGINNING: 1,
    PROPERTY: 2, // e.g., 'AB[oe]' or 'A_B[oe]' or 'AB_[oe]'
    PROP_DATA: 3, // 'AB[o_e]'
    BETWEEN: 4 // 'AB[oe]_', '_AB[oe]'
  };
  var statesToString = {
    1: 'BEGINNING',
    2: 'PROPERTY',
    3: 'PROP_DATA',
    4: 'BETWEEN'
  };
  var syn = {
    LBRACE:  '[',
    RBRACE:  ']',
    LPAREN:  '(',
    RPAREN:  ')',
    SCOLON:  ';'
  };

  var wsRegex = /\s|\n/;
  var propRegex = /[A-Z]/;

  var curstate = states.BEGINNING;
  var movetree = glift.rules.movetree.getInstance();
  var charBuffer = []; // List of characters.
  var propData = []; // List of Strings.
  var branchMoveNums = []; // used for when we pop up.
  var curProp = '';
  var curchar = '';
  var i = 0; // defined here for closing over
  var lineNum = 0;
  var colNum = 0;

  var perror = function(msg) {
    glift.sgf.parseError(lineNum, colNum, curchar, msg);
  };

  var flushCharBuffer = function() {
    var strOut = charBuffer.join("");
    charBuffer = [];
    return strOut;
  };

  var flushPropDataIfNecessary = function() {
    if (curProp.length > 0) {
      movetree.properties().add(curProp, propData);
      propData = [];
      curProp = '';
    }
  };

  (function() {
    // Run everything inside an anonymous function so we can use 'return' as a
    // fullstop break.
    for (var i = 0; i < sgfString.length; i++) {
      colNum++; // This means that columns are 1 indexed.
      curchar = sgfString.charAt(i);

      if (curchar === "\n" ) {
        lineNum++;
        colNum = 0;
        if (curstate !== states.PROP_DATA) {
          continue;
        }
      }

      switch (curstate) {
        case states.BEGINNING:
          if (curchar === syn.LPAREN) {
            branchMoveNums.push(movetree.node().getNodeNum()); // Should Be 0.
          } else if (curchar === syn.SCOLON) {
            curstate = states.BETWEEN; // The SGF Begins!
          } else if (wsRegex.test(curchar)) {
            // We can ignore whitespace.
          } else {
            perror("Unexpected character");
          }
          break;
        case states.PROPERTY:
          if (propRegex.test(curchar)) {
            charBuffer.push(curchar);
            if (charBuffer.length > 2) {
              perror("Expected: length two proprety. Found: " + charBuffer);
            }
          } else if (curchar === syn.LBRACE) {
            curProp = flushCharBuffer();
            if (glift.sgf.allProperties[curProp] === undefined) {
              perror('Unknown property: ' + curProp);
            }
            curstate = states.PROP_DATA;
          } else if (wsRegex.test(curchar)) {
            // Should whitespace be allowed here?
            perror('Unexpected whitespace in Property')
          } else {
            perror('Unexpected character');
          }
          break;
        case states.PROP_DATA:
          if (curchar === syn.RBRACE
              && charBuffer[charBuffer.length - 1] === '\\') {
            charBuffer.push(curchar);
          } else if (curchar === syn.RBRACE) {
            propData.push(flushCharBuffer());
            curstate = states.BETWEEN;
          } else {
            charBuffer.push(curchar);
          }
          break;
        case states.BETWEEN:
          if (propRegex.test(curchar)) {
            flushPropDataIfNecessary();
            charBuffer.push(curchar);
            curstate = states.PROPERTY;
          } else if (curchar === syn.LBRACE) {
            if (curProp.length > 0) {
              curstate = states.PROP_DATA; // more data to process
            } else {
              perror("Unexpected token.  Orphan property data.");
            }
          } else if (curchar === syn.LPAREN) {
            flushPropDataIfNecessary();
            branchMoveNums.push(movetree.node().getNodeNum());
          } else if (curchar === syn.RPAREN) {
            flushPropDataIfNecessary();
            if (branchMoveNums.length === 0) {
              while (movetree.node().getNodeNum() !== 0) {
                movetree.moveUp(); // Is this necessary?
              }
              return movetree;
            }
            var parentBranchNum = branchMoveNums.pop();
            while (movetree.node().getNodeNum() !== parentBranchNum) {
              movetree.moveUp();
            }
          } else if (curchar === syn.SCOLON) {
            flushPropDataIfNecessary();
            movetree.addNode();
          } else if (wsRegex.test(curchar)) {
            // Do nothing.  Whitespace can be ignored here.
          } else {
            perror('Unknown token');
          }
          break;
        default:
          perror("Fatal Error: Unknown State!"); // Shouldn't get here.
      }
    }
    if (movetree.node().getNodeNum() !== 0) {
      perror('Expected to end up at start.');
    }
  })();
  return movetree;
};

/**
 * Throw a parser error.  The message is optional.
 */
glift.sgf.parseError =  function(lineNum, colNum, curchar, message) {
  var err = 'SGF Parsing Error: At line [' + lineNum + '], column [' + colNum
      + '], char [' + curchar + '], ' + message;
  glift.util.logz(err); // Should this error be logged this way?
  throw err;
};
// The allProperties object is used to check to make sure that a given property is
// actually a real property
glift.sgf.allProperties = {
AB: "AB", AE: "AE", AN: "AN", AP: "AP", AR: "AR", AS: "AS", AW: "AW", B: "B",
BL: "BL", BM: "BM", BR: "BR", BS: "BS", BT: "BT", C: "C", CA: "CA", CH: "CH",
CP: "CP", CR: "CR", DD: "DD", DM: "DM", DO: "DO", DT: "DT", EL: "EL", EV: "EV",
EX: "EX", FF: "FF", FG: "FG", GB: "GB", GC: "GC", GM: "GM", GN: "GN", GW: "GW",
HA: "HA", HO: "HO", ID: "ID", IP: "IP", IT: "IT", IY: "IY", KM: "KM", KO: "KO",
L: "L", LB: "LB", LN: "LN", LT: "LT", M: "M", MA: "MA", MN: "MN", N: "N", OB:
"OB", OH: "OH", OM: "OM", ON: "ON", OP: "OP", OT: "OT", OV: "OV", OW: "OW", PB:
"PB", PC: "PC", PL: "PL", PM: "PM", PW: "PW", RE: "RE", RG: "RG", RO: "RO", RU:
"RU", SC: "SC", SE: "SE", SI: "SI", SL: "SL", SO: "SO", SQ: "SQ", ST: "ST", SU:
"SU", SZ: "SZ", TB: "TB", TC: "TC", TE: "TE", TM: "TM", TR: "TR", TW: "TW", UC:
"UC", US: "US", V: "V", VW: "VW", W: "W", WL: "WL", WR: "WR", WS: "WS", WT: "WT"
};
/*
 * The controllers logical parts (the Brains!) of a Go board widget.  You can
 * use the movetree and rules directly, but it's usually easier to use the
 * controller layer to abstract dealing with the rules.  It's especially useful
 * for testing logic as distinct from UI changes.
 */
glift.controllers = {};
(function() {
glift.controllers.base = function() {
  return new BaseController();
};

/**
 * The BaseConstructor provides, in classical-ish inheritance style, an abstract
 * base implementation for interacting with SGFs.  Typically, those objects
 * extending this base class will implement addStone and [optionally]
 * extraOptions.
 *
 * The options are generall set either with initOptions or initialize;
 */
var BaseController = function() {
  // Options set with initOptions and intended to be immutable during the
  // lifetime of the controller.
  this.sgfString = "";
  this.initialPosition = [];
  this.problemConditions = {};

  // State variables that are defined on initialize and that could are
  // necessarily mutable.
  this.treepath = undefined;
  this.movetree = undefined;
  this.goban = undefined;
};

BaseController.prototype = {
  /**
   * Initialize both the options and the controller's children data structures.
   *
   * Note that these options should be protected by the options parsing (see
   * options.js in this same directory).  Thus, no special checks are made here.
   */
  initOptions: function(sgfOptions) {
    if (sgfOptions === undefined) {
      throw "Options is undefined!  Can't create controller"
    }
    this.sgfString = sgfOptions.sgfString || "";
    this.initialPosition = sgfOptions.initialPosition || [];
    this.problemConditions = sgfOptions.problemConditions || undefined;
    this.extraOptions(sgfOptions); // Overridden by implementers
    this.initialize();
    return this;
  },

  /**
   * It's expected that this will be implemented by those extending this base
   * class.  This is called during initOptions above.
   */
  extraOptions: function(opt) { /* Implemented by other controllers. */ },

  /**
   * Add a stone.  This is intended to be overwritten.
   */
  addStone: function(point, color) { throw "Not Implemented"; },

  /**
   * Applies captures and increments the move number
   *
   * Captures is expected to have the form
   *
   * {
   *  WHITE: []
   *  BLACK: []
   * }
   */
  // TODO(kashomon): Maybe this shouldn't increment move number?
  recordCaptures: function(captures) {
    this.currentMoveNumber++;
    this.captureHistory.push(captures)
    return this;
  },

  /**
   * Initialize the:
   *  - initPosition -- description of where to start
   *  - treepath -- the path to the current position.  An array of variaton
   *  numbers
   *  - movetree -- tree of move nodes from the SGF
   *  - goban -- data structure describing the go board.  Really, the goban is
   *  useful for telling you where stones can be placed, and (after placing)
   *  what stones were captured.
   *  - capture history -- the history of the captures
   */
  initialize: function() {
    var rules = glift.rules;
    this.treepath = rules.treepath.parseInitPosition(this.initialPosition);
    this.currentMoveNumber  = this.treepath.length
    this.movetree = rules.movetree.getFromSgf(this.sgfString, this.treepath);
    var gobanData = rules.goban.getFromMoveTree(this.movetree, this.treepath);
    this.goban = gobanData.goban;
    this.captureHistory = gobanData.captures;
    return this;
  },

  /**
   * Return the entire intersection data, including all stones, marks, and
   * comments.  This format allows the user to completely populate some UI of
   * some sort.
   *
   * The output looks like:
   *  {
   *    points: {
   *      "1,2" : {
   *        point: {1, 2},
   *        STONE: "WHITE"
   *      }
   *      ... etc ...
   *    }
   *    comment : "foo"
   *  }
   */
  getEntireBoardState: function() {
    return glift.bridge.intersections.getFullBoardData(
        this.movetree, this.goban, this.problemConditions);
  },

  /**
   * Return only the necessary information to update the board
   */
  getNextBoardState: function() {
    return glift.bridge.intersections.nextBoardData(
        this.movetree, this.getCaptures(), this.problemConditions);
  },

  /**
   * Get the captures that occured for the current move.
   */
  getCaptures: function() {
    if (this.captureHistory.length === 0) {
      return { BLACK: [], WHITE: [] };
    }
    return this.captureHistory[this.currentMoveNumber - 1];
  },

  /**
   * Return true if a Stone can (probably) be added to the board and false
   * otherwise.
   *
   * Note, this method isn't always totally accurate. This method must be very
   * fast since it's expected that this will be used for hover events.
   *
   */
  canAddStone: function(point, color) {
    return this.goban.placeable(point,color);
  },

  /**
   * Returns a State (either BLACK or WHITE). Needs to be fast since it's used
   * to display the hover-color in the display.
   *
   * This will be undefined until initialize is called, so the clients of the
   * controller must make sure to always initialize the board position
   * first.
   */
  getCurrentPlayer: function() {
    return this.movetree.getCurrentPlayer();
  },

  /**
   * Returns the number of intersections.  Should be known at load time.
   */
  getIntersections: function() {
    return this.movetree.getIntersections();
  },

  /**
   * Get the Next move in the game.  If the player has already traversed a path,
   * then we follow this previous path.
   *
   * If varNum is undefined, we try to 'guess' the next move based on the
   * contents of the treepath.
   *
   * Proceed to the next move.  This is slightly trickier than you might
   * imagine:
   *   - We need to either add to the Movetree or, if the movetree is readonly,
   *   we need to make sure the move exists.
   *   - We need to update the Goban.
   *   - We need to store the captures.
   *   - We need to update the current move number.
   */
  nextMove: function(varNum) {
    if (this.treepath[this.currentMoveNumber] !== undefined &&
        (varNum === undefined ||
        this.treepath[this.currentMoveNumber] === varNum)) {
      this.movetree.moveDown(this.treepath[this.currentMoveNumber]);
    } else {
      varNum = varNum === undefined ? 0 : varNum;
      if (varNum >= 0 &&
          varNum <= this.movetree.nextMoves().length - 1) {
        this.setNextVariation(varNum);
        this.movetree.moveDown(varNum);
      } else {
        // TODO(kashomon): Add case for non-readonly goboard.
        return glift.util.none; // No moves available
      }
    }
    var captures = this.goban.loadStonesFromMovetree(this.movetree)
    this.recordCaptures(captures);
    return this.getNextBoardState();
  },

  /**
   * Go back a move.
   */
  prevMove: function() {
    if (this.currentMoveNumber === 0) {
      return glift.util.none;
    }
    var captures = this.getCaptures();
    var allCurrentStones = this.movetree.properties().getAllStones();
    this.captureHistory = this.captureHistory.slice(
        0, this.currentMoveNumber - 1);
    this.goban.unloadStones(allCurrentStones, captures);
    this.currentMoveNumber = this.currentMoveNumber === 0 ?
        this.currentMoveNumber : this.currentMoveNumber - 1;
    this.movetree.moveUp();
    var displayData = glift.bridge.intersections.previousBoardData(
        this.movetree, allCurrentStones, captures, this.problemConditions);
    return displayData;
  },

  /**
   * Set what the next variation will be.  The number is applied modulo the
   * number of possible variations.
   */
  setNextVariation: function(num) {
    // Recall that currentMoveNumber  s the same as the depth number ==
    // this.treepath.length (if at the end).  Thus, if the old treepath was
    // [0,1,2,0] and the currentMoveNumber was 2, we'll have [0, 1, num].
    this.treepath = this.treepath.slice(0, this.currentMoveNumber);
    this.treepath.push(num % this.movetree.node().numChildren());
    return this;
  },

  /**
   * Go back to the beginning.
   */
  toBeginning: function() {
    this.movetree = this.movetree.getTreeFromRoot();
    this.goban = glift.rules.goban.getFromMoveTree(this.movetree, []).goban;
    this.captureHistory = []
    this.currentMoveNumber = 0;
    return this.getEntireBoardState();
  },

  /**
   * Go to the end.
   */
  toEnd: function() {
    while (this.nextMove() !== glift.util.none) {
      // All the action happens in nextMoveNoState.
    }
    return this.getEntireBoardState();
  }
};
})();
glift.controllers.boardEditor = function(sgfOptions) {
  var controllers = glift.controllers;
  var baseController = glift.util.beget(controllers.base());
  // var newController = glift.util.setMethods(baseController,
          // glift.controllers.StaticProblemMethods);
  baseController.initOptions(sgfOptions);
  return baseController;
};
(function() {
/**
 * A GameViewer encapsulates the idea of traversing a read-only SGF.
 */
glift.controllers.gameViewer = function(sgfOptions) {
  var controllers = glift.controllers,
      baseController = glift.util.beget(controllers.base()),
      newController = glift.util.setMethods(baseController, methods),
      _ = newController.initOptions(sgfOptions);
  return newController;
};

var methods = {
  /**
   * Called during initOptions, in the BaseController.
   *
   * This creates a treepath (a persisted treepath) and an index into the
   * treepath.  This allows us to 'remember' the last variation taken by the
   * player, which seems to be the standard behavior.
   */
  extraOptions: function(options) {},

  /**
   * Find the variation associated with the played move.
   */
  addStone: function(point, color) {
    var possibleMap = this._possibleNextMoves();
    var key = point.toString() + '-' + color;
    if (possibleMap[key] === undefined) {
      return glift.util.none;
    }
    var nextVariationNum = possibleMap[key];
    return this.nextMove(nextVariationNum);
  },

  /**
   * Based on the game path, get what the next variation number to be retrieved
   * will be.
   */
  getNextVariationNumber: function() {
    if (this.currentMoveNumber > this.treepath.length ||
        this.treepath[this.currentMoveNumber] === undefined) {
      return 0;
    } else {
      return this.treepath[this.currentMoveNumber];
    }
  },

  /**
   * Move up what variation will be next retrieved.
   */
  moveUpVariations: function() {
    return this.setNextVariation((this.getNextVariationNumber() + 1)
        % this.movetree.node().numChildren());
  },

  /**
   * Move down  what variation will be next retrieved.
   */
  moveDownVariations: function() {
    // Module is defined incorrectly for negative numbers.  So, we need to add n
    // to the result.
    return this.setNextVariation((this.getNextVariationNumber() - 1 +
        + this.movetree.node().numChildren())
        % this.movetree.node().numChildren());
  },

  /**
   * Get the possible next moves.  Used to verify that a click is actually
   * reasonable.
   *
   * Implemented as a map from point-string+color to variationNumber:
   *  e.g., pt-BLACK : 1.  For pass, we use 'PASS' as the point string.  This is
   *  sort of a hack and should maybe be rethought.
   */
  _possibleNextMoves: function() {
    var possibleMap = {};
    var nextMoves = this.movetree.nextMoves();
    for (var i = 0; i < nextMoves.length; i++) {
      var move = nextMoves[i];
      var firstString = move.point !== undefined
          ? move.point.toString() : 'PASS'
      var key = firstString + '-' + (move.color);
      possibleMap[key] = i;
    }
    return possibleMap;
  }
};
})();
/**
 * The static problem controller encapsulates the idea of trying to solve a
 * problem.  Thus, when a player adds a stone, the controller checks to make
 * sure that:
 *
 *  - There is actually a variation with that position / color.
 *  - There is actually a node somewhere beneath the variation that results in a
 *  'correct' outcome.
 */
glift.controllers.staticProblem = function(sgfOptions) {
  var controllers = glift.controllers;
  var baseController = glift.util.beget(controllers.base());
  var newController = glift.util.setMethods(baseController,
          glift.controllers.StaticProblemMethods);
  newController.initOptions(sgfOptions);
  return newController;
};

glift.controllers.StaticProblemMethods = {
  /**
   * Reload the problems.
   *
   * TODO(kashomon): Remove this?  Or perhaps rename initialize() to load() or
   * reload() or something.
   */
  reload: function() {
    this.initialize();
  },

  /**
   * Add a stone to the board.  Since this is a problem, we check for
   * 'correctness', which we check whether all child nodes are labeled (in some
   * fashion) as correct.
   *
   * Note: color must be one of enums.states (either BLACK or WHITE).
   *
   * TODO(kashomon): Refactor this into something less ridiculous -- i.e.,
   * shorter and easier to understand.
   */
  addStone: function(point, color) {
    var problemResults = glift.enums.problemResults;
    var CORRECT = problemResults.CORRECT;
    var INCORRECT = problemResults.INCORRECT;
    var INDETERMINATE = problemResults.INDETERMINATE;
    var FAILURE = problemResults.FAILURE;

    // Reminder -- the goban returns:
    //  {
    //    successful: <boolean>
    //    captures: [ points]
    //  }
    var addResult = this.goban.addStone(point, color);
    if (!addResult.successful) {
      return { result: FAILURE };
    } else {
      var toRecord = {};
      toRecord[color] = addResult.captures;
      this.recordCaptures(toRecord);
    }

    // At this point, the move is allowed by the rules of Go.  Now the task is
    // to determine whether tho move is 'correct' or not based on the data in
    // the movetree, presumably from an SGF.
    var nextVarNum = this.movetree.findNextMove(point, color);

    // There are no variations corresponding to the move made, so we assume that
    // the move is INCORRECT. However, we still add the move down the movetree,
    // adding a node if necessary.  This allows us to maintain a consistent
    // state.
    if (nextVarNum === glift.util.none) {
      this.movetree.addNode();
      this.movetree.properties().add(
          glift.sgf.colorToToken(color),
          point.toSgfCoord());
      var outData = this.getNextBoardState();
      outData.result = INCORRECT;
      return outData;
    } else {
      this.movetree.moveDown(nextVarNum);

      var correctness = glift.rules.problems.isCorrectPosition(
          this.movetree, this.problemConditions);
      if (correctness === CORRECT || correctness == INCORRECT) {
        var outData = this.getNextBoardState();
        outData.result = correctness;
        return outData;
      } else if (correctness === INDETERMINATE) {
        var prevOutData = this.getNextBoardState();
        // Play for the opposite player. Should this be deterministic?
        var randNext = glift.math.getRandomInt(
            0, this.movetree.node().numChildren() - 1);
        this.movetree.moveDown(randNext);
        var nextMove = this.movetree.properties().getMove();
        var result = this.goban.addStone(nextMove.point, nextMove.color);
        var toRecord = {};
        toRecord[nextMove.color] = result.captures;
        this.recordCaptures(toRecord);
        var outData = this.getNextBoardState();
        for (var color in prevOutData.stones) {
          for (var i = 0; i < prevOutData.stones[color].length; i++) {
            outData.stones[color].push(prevOutData.stones[color][i]);
          }
        }
        outData.result = INDETERMINATE;
        return outData;
      }
      else {
        throw "Unexpected result output: " + correctness
      }
    }
  }
};
/**
 * The bridge is the only place where display and rules/widget code can
 * mingle.
 */
glift.bridge = {
  /**
   * Set/create the various components in the UI.
   *
   * For a more detailed discussion, see intersections in glift.bridge.
   */
  // TODO(kashomon): move showVariations to intersections.
  setDisplayState: function(boardData, display, showVariations) {
    display.intersections().clearMarks();
    if (boardData.displayDataType === glift.enums.displayDataTypes.FULL) {
      display.intersections().clearAll();
    }
    for (var color in boardData.stones) {
      for (var i = 0; i < boardData.stones[color].length; i++) {
        var pt = boardData.stones[color][i];
        display.intersections().setStoneColor(pt, color);
      }
    }

    var variationMap = {};
    if (glift.bridge.shouldShowNextMoves(boardData, showVariations)) {
      variationMap = glift.bridge.variationMapping(boardData.nextMoves);
    }

    var marks = glift.enums.marks;
    for (var markType in boardData.marks) {
      for (var i = 0; i < boardData.marks[markType].length; i++) {
        var markData = boardData.marks[markType][i];
        if (markType === marks.LABEL) {
          if (variationMap[markData.point.toString()] !== undefined) {
            display.intersections().addMarkPt(
                markData.point, marks.VARIATION_MARKER, markData.value);
            delete variationMap[markData.point.toString()];
          } else {
            display.intersections().addMarkPt(
                markData.point, marks.LABEL, markData.value);
          }
        } else {
          display.intersections().addMarkPt(markData, markType);
        }
      }
    }

    var i = 1;
    var correctNextMap =
        glift.bridge.variationMapping(boardData.correctNextMoves);
    for (var ptstring in variationMap) {
      var pt = variationMap[ptstring];
      if (pt in correctNextMap) {
        display.intersections().addMarkPt(pt, marks.CORRECT_VARIATION, i);
      } else {
        display.intersections().addMarkPt(pt, marks.VARIATION_MARKER, i);
      }
      i += 1;
    }

    if (boardData.lastMove &&
        boardData.lastMove !== glift.util.none &&
        boardData.lastMove.point !== undefined) {
      var lm = boardData.lastMove;
      display.intersections().addMarkPt(lm.point, marks.STONE_MARKER);
    }
    // display.flush();
  },

  /**
   * Logic for determining whether the next variations should be (automatically)
   * shown.
   */
  shouldShowNextMoves: function(boardData, showVariations) {
    return boardData.nextMoves &&
      ((boardData.nextMoves.length > 1 &&
          showVariations === glift.enums.showVariations.MORE_THAN_ONE) ||
      (boardData.nextMoves.length >= 1 &&
          showVariations === glift.enums.showVariations.ALWAYS));
  },

  /**
   * Make the next variations into in an object map.  This prevents us from
   * adding variations twice, which can happen if variations are automatically
   * shown and the SGF has explicit markings.  This happens quite frequently in
   * the case of game reviews.
   */
  variationMapping: function(variations) {
    var out = {};
    for (var i = 0; i < variations.length; i++) {
      var nextMove = variations[i];
      if (nextMove.point !== undefined) {
        out[nextMove.point.toString()] = nextMove.point;
      } else {
        // This is a 'pass'
      }
    }
    return out;
  }
};

/**
 * Takes a movetree and returns the optimal BoardRegion for cropping purposes.
 */
glift.bridge.getCropFromMovetree = function(movetree) {
  var bbox = glift.displays.bboxFromPts;
  var point = glift.util.point;
  var boardRegions = glift.enums.boardRegions;
  // Intersections need to be 0 rather than 1 indexed for this method.
  var ints = movetree.getIntersections() - 1;
  var middle = Math.ceil(ints / 2);

  // Quads is a map from BoardRegion to the points that the board region
  // represents.
  var quads = {};

  // Tracker is a mapfrom
  var tracker = {};
  var numstones = 0;

  // TODO(kashomon): Reevaluate this later.  It's not clear to me if we should
  // be cropping boards smaller than 19.  It usually looks pretty weird.
  if (movetree.getIntersections() !== 19) {
    return glift.enums.boardRegions.ALL;
  }
  quads[boardRegions.TOP_LEFT] =
      bbox(point(0, 0), point(middle, middle));
  quads[boardRegions.TOP_RIGHT] =
      bbox(point(middle, 0), point(ints, middle));
  quads[boardRegions.BOTTOM_LEFT] =
      bbox(point(0, middle), point(middle, ints));
  quads[boardRegions.BOTTOM_RIGHT] =
      bbox(point(middle, middle), point(ints, ints));
  movetree.recurseFromRoot(function(mt) {
    var stones = mt.properties().getAllStones();
    for (var color in stones) {
      var points = stones[color];
      for (var i = 0; i < points.length; i++) {
        var pt = points[i];
        numstones += 1
        for (var quadkey in quads) {
          var box = quads[quadkey];
          if (middle === pt.x() || middle === pt.y()) {
            // Ignore points right on the middle.  It shouldn't make a different
            // for cropping, anyway.
          } else if (box.contains(pt)) {
            if (tracker[quadkey] === undefined) tracker[quadkey] = [];
            tracker[quadkey].push(pt);
          }
        }
      }
    }
  });
  return glift.bridge._getRegionFromTracker(tracker, numstones);
};

glift.bridge._getRegionFromTracker = function(tracker, numstones) {
  var regions = [], br = glift.enums.boardRegions;
  for (var quadkey in tracker) {
    var quadlist = tracker[quadkey];
    regions.push(quadkey);
  }
  if (regions.length === 1) {
    return regions[0];
  }
  if (regions.length !== 2) {
    return glift.enums.boardRegions.ALL;
  }
  var newset = glift.util.intersection(
    glift.util.regions.getComponents(regions[0]),
    glift.util.regions.getComponents(regions[1]));
  // there should only be one element at this point or nothing
  for (var key in newset) {
    return key;
  }
  return glift.boardRegions.ALL;
};
/**
 * Helps flatten a go board into a diagram definition.
 */
glift.bridge.flattener = {
  symbols: {
    //----------------------------------------//
    // First Layer Symbols (lines and stones) //
    //----------------------------------------//
    // Base board marks
    TL_CORNER: 1,
    TR_CORNER: 2,
    BL_CORNER: 3,
    BR_CORNER: 4,
    TOP_EDGE: 5,
    BOT_EDGE: 6,
    LEFT_EDGE: 7,
    RIGHT_EDGE: 8,
    CENTER: 9,
    // Center + starpoint
    CENTER_STARPOINT: 10,
    // Stones
    BSTONE: 11,
    WSTONE: 12,

    // A dummy symbol so we can create dense arrays of mark symbols.  Also used
    // for removed the first layer when we wish to add text labels.
    EMPTY: 13,

    //-----------------------------------------//
    // Second Layer Symbols (labels and marks) //
    //-----------------------------------------//
    // Marks and StoneMarks
    TRIANGLE: 14,
    SQUARE: 15,
    CIRCLE: 16,
    XMARK: 17,
    // Text Labeling (numbers or letters)
    TEXTLABEL: 18,
    // Extra marks, used for display.  These are not specified by the SGF
    // specification, but they are often useful.
    LASTMOVE: 19, // Should probably never be used, but is useful
    // It's useful to destinguish between standard TEXTLABELs and NEXTVARIATION
    // labels.
    NEXTVARIATION: 20
  },

  symbolFromEnum: function(value) {
    if (glift.bridge.flattener._reverseSymbol !== undefined) {
      return glift.bridge.flattener._reverseSymbol[value];
    }
    var reverse = {};
    var symb = glift.bridge.flattener.symbols;
    for (var key in glift.bridge.flattener.symbols) {
      reverse[symb[key]] = key;
    }
    glift.bridge.flattener._reverseSymbol = reverse;
    return glift.bridge.flattener._reverseSymbol[value];
  },

  /**
   * Flatten the combination of movetree, goban, cropping, and treepath into an
   * array (really a 2D array) of symbols, (a _Flattened object).
   *
   * Some notes about the parameters:
   *  - The goban is used for extracting all the inital stones.
   *  - The movetree is used for extracting:
   *    -> The marks
   *    -> The next moves
   *    -> The previous move
   *    -> subsequent stones, if a nextMovesTreepath is present.  These are
   *    given labels.
   *  - The boardRegion indicates how big to make the board (i.e., the 2D array)
   *
   * Optional parameters:
   *  - nextMovesTreepath.  Defaults to [].  This is typically only used for
   *    printed diagrams.
   *  - Cropping.  Defaults to nextMovesCropping
   */
  flatten: function(
      movetreeInitial,
      goban,
      boardRegion,
      showNextVariationsType,
      nextMovesTreepath,
      startingMoveNum) {
    var s = glift.bridge.flattener.symbols;
    var mt = movetreeInitial.newTreeRef();
    var showVars = showNextVariationsType || glift.enums.showVariations.NEVER;
    var nmtp = nextMovesTreepath || [];
    if (glift.util.typeOf(nmtp) !== 'array') {
      nmtp = glift.rules.treepath.parseInitPosition(nmtp);
    }
    var mvNum = startingMoveNum || 1;
    var boardRegion = boardRegion || glift.enums.boardRegions.ALL;
    if (boardRegion === glift.enums.boardRegions.AUTO) {
      boardRegion = glift.bridge.getCropFromMovetree(mt);
    }
    var cropping = glift.displays.cropbox.getFromRegion(
        boardRegion, mt.getIntersections());

    // Map of ptString
    var stoneMap = glift.bridge.flattener._stoneMap(goban);
    // Map of ptString
    var labels = {};
    // Array of moves, augmented with labels where the collisions happened, so
    // that users can say things. 5 at 3.
    // i.e.,
    // {
    //  point: <point>,
    //  color: <color>,
    //  label: <label>,
    //  collision: {
    //    point: <point>,
    //    color: <color>,
    //    label: <label>
    //  }
    // }
    var collisions = [];
    // Only for reference.  Map of point to mark.
    var marks = {};

    // Apply the treepath to the movetree.
    // Move this to another function.
    // The extra labels bit is quite a hack.
    var extraLabels = 'abcdefghijklmnopqrstuvwxyz';
    var extraIdx = 0
    for (var i = 0; i < nmtp.length && mt.node().numChildren() > 0; i++) {
      mt.moveDown(nmtp[i]);
      // move is of the form {point: <pt>, color: <color>}.  Point is absent if
      // move is a pass.
      var move = mt.properties().getMove();
      if (move !== glift.util.none && move.point && move.color) {
        var ptString = move.point.toString();
        if (stoneMap[ptString] !== undefined) {
          // The only reason why we should see collisions would because we
          // placed a stone somwhere in this loop.
          var label = labels[ptString];
          var cmove = stoneMap[ptString]
          if (label === undefined) {
            // This can happen after multi-stone captures.  In this case, we
            // create a new label, for convenience.
            move.collision = cmove;
            labels[ptString] = extraLabels.charAt(extraIdx);
            marks[ptString] = s.TEXTLABEL;
            extraIdx++;
          } else {
            move.collision = cmove;
            move.label = "" + mvNum;
          }
          move.moveNum = mvNum;
          collisions.push(move);
        } else {
          stoneMap[ptString] = move;
          labels[ptString] = "" + mvNum;
          marks[ptString] = s.TEXTLABEL;
        }
      }
      mvNum += 1;
    }

    var mksOut = glift.bridge.flattener._markMap(mt);
    for (var l in mksOut.labels) {
      labels[l] = mksOut.labels[l];
    }
    for (var m in mksOut.marks) {
      marks[m] = mksOut.marks[m];
    }

    var sv = glift.enums.showVariations
    if (showVars === sv.ALWAYS ||
        (showVars === sv.MORE_THAN_ONE && mt.node().numChildren() > 1)) {
      for (var i = 0; i < mt.node().numChildren(); i++) {
        var move = mt.node().getChild(i).properties().getMove();
        if (move && move.point) {
          var pt = move.point;
          var ptStr = pt.toString();
          if (labels[ptStr] === undefined) {
            labels[ptStr] = "" + (i + 1);
          }
          marks[ptStr] = s.NEXTVARIATION;
        }
      }
    }

    // Finally! Generate the symbols array.
    var symbolPairs = glift.bridge.flattener._generateSymbolArr(
        cropping, stoneMap, marks, mt.getIntersections());

    var comment = mt.properties().getComment();
    if (comment === glift.util.none || comment === undefined) { comment = ""; }
    return new glift.bridge._Flattened(
        symbolPairs, labels, collisions, comment, boardRegion, cropping);
  },

  /**
   * Get map from pt string to stone {point: <point>, color: <color>}.
   */
  _stoneMap: function(goban) {
    var out = {};
    // Array of {color: <color>, point: <point>}
    var gobanStones = goban.getAllPlacedStones();
    for (var i = 0; i < gobanStones.length; i++) {
      var stone = gobanStones[i];
      out[stone.point.toString()] = stone;
    }
    return out;
  },

  /**
   * Get the relevant marks.  Returns an object containing two fields: marks,
   * which is a map from ptString to Symbol ID. and labels, which is a map
   * from ptString to text label.
   *
   * If there are two marks on the same intersection specified, the behavior is
   * undefined.  Either mark might succeed in being placed.
   *
   * Example
   * {
   *  marks: {
   *    "12.5": 13
   *    "12.3": 23
   *  }
   *  labels: {
   *    "12,3": "A"
   *    "12,4": "B"
   *  }
   * }
   */
  _markMap: function(movetree) {
    var s = glift.bridge.flattener.symbols;
    var propertiesToSymbols = {
      CR: s.CIRCLE,
      LB: s.TEXTLABEL,
      MA: s.XMARK,
      SQ: s.SQUARE,
      TR: s.TRIANGLE
    };
    var out = { marks: {}, labels: {} };
    for (var prop in propertiesToSymbols) {
      var symbol = propertiesToSymbols[prop];
      if (movetree.properties().contains(prop)) {
        var data = movetree.properties().getAllValues(prop);
        for (var i = 0; i < data.length; i++) {
          if (prop === glift.sgf.allProperties.LB) {
            var lblPt = glift.sgf.convertFromLabelData(data[i]);
            var key = lblPt.point.toString();
            out.marks[key] = symbol;
            out.labels[key] = lblPt.value;
          } else {
            var pt = glift.util.pointFromSgfCoord(data[i]);
            out.marks[pt.toString()] = symbol;
          }
        }
      }
    }
    return out;
  },

  /**
   * Returns:
   *  [
   *    [
   *      {base: 3, mark: 20},
   *      ...
   *    ],
   *    [...],
   *    ...
   * ]
   *
   */
  _generateSymbolArr: function(cropping, stoneMap, marks, ints) {
    var cb = cropping.cbox();
    var point = glift.util.point;
    var symbols = [];
    for (var y = cb.top(); y <= cb.bottom(); y++) {
      var row = [];
      for (var x = cb.left(); x <= cb.right(); x++) {
        var pt = point(x, y);
        var ptStr = pt.toString();
        var stone = stoneMap[ptStr];
        var mark = marks[ptStr];
        row.push(this._getSymbolPair(pt, stone, mark, ints));
      }
      symbols.push(row);
    }
    return symbols;
  },

  /**
   * pt: Point of interest.
   * stone: {point: <point>, color: <color>} or undefined,
   */
  _getSymbolPair: function(pt, stone, mark, intersections) {
    var s = glift.bridge.flattener.symbols;
    var BLACK = glift.enums.states.BLACK;
    var WHITE = glift.enums.states.WHITE;
    var EMPTY = glift.enums.states.EMPTY;
    var base = undefined;
    var outMark = s.EMPTY;
    if (mark !== undefined) {
      var color = EMPTY
      if (stone !== undefined) { color = stone.color; }
      switch(mark) {
        case s.TRIANGLE: outMark = s.TRIANGLE; break;
        case s.SQUARE: outMark = s.SQUARE; break;
        case s.CIRCLE: outMark = s.CIRCLE; break;
        case s.XMARK: outMark = s.XMARK; break;
        case s.LASTMOVE: outMark = s.LASTMOVE; break;
        case s.TEXTLABEL:
          outMark = s.TEXTLABEL;
          if (color === EMPTY) {
            base = s.EMPTY;
          }
          break;
        case s.NEXTVARIATION:
          outMark = s.NEXTVARIATION;
          if (color === EMPTY) {
            base = s.EMPTY;
          }
          break;
      }
    }
    var ints = intersections - 1;
    if (base === s.EMPTY) {
      // Do nothing.
    } else if (stone !== undefined && stone.color === BLACK) {
      base = s.BSTONE;
    } else if (stone !== undefined && stone.color === WHITE) {
      base = s.WSTONE;
    } else if (pt.x() === 0 && pt.y() === 0) {
      base = s.TL_CORNER;
    } else if (pt.x() === 0 && pt.y() === ints) {
      base = s.BL_CORNER;
    } else if (pt.x() === ints && pt.y() === 0) {
      base = s.TR_CORNER;
    } else if (pt.x() === ints && pt.y() === ints) {
      base = s.BR_CORNER;
    } else if (pt.y() === 0) {
      base = s.TOP_EDGE;
    } else if (pt.x() === 0) {
      base = s.LEFT_EDGE;
    } else if (pt.x() === ints) {
      base = s.RIGHT_EDGE;
    } else if (pt.y() === ints) {
      base = s.BOT_EDGE;
    } else if (this._isStarpoint(pt, intersections)) {
      base = s.CENTER_STARPOINT;
    } else {
      base = s.CENTER;
    }
    return {base: base, mark: outMark};
  },

  _starPointSets: {
    9 : [{2:true, 6:true}, {4:true}],
    13 : [{3:true, 9:true}, {6:true}],
    19 : [{3:true, 9:true, 15:true}]
  },

  /**
   * Determine whether a pt is a starpoint.  Intersections is 1-indexed, but the
   * pt is 0-indexed.
   */
  _isStarpoint: function(pt, intersections) {
    var starPointSets = glift.bridge.flattener._starPointSets[intersections];
    for (var i = 0; i < starPointSets.length; i++) {
      var set = starPointSets[i];
      if (set[pt.x()] && set[pt.y()]) {
        return true;
      }
    }
    return false;
  }
};

/**
 * Data used to populate either a display or diagram.
 */
glift.bridge._Flattened = function(
    symbolPairs, lblData, coll, comment, boardRegion, cropping) {
  // Dense two level array designating what the base layer of the board looks like.
  // Example:
  //  [
  //    [
  //      {mark: EMPTY, base: TR_CORNER},
  //      {mark: EMPTY, base: BSTONE},
  //      {mark: TRIANGLE, base: WSTONE},
  //      ...
  //    ], [
  //      ...
  //    ]
  //    ...
  //  ]
  this.symbolPairs = symbolPairs;

  // Map from ptstring to label data.
  // Example:
  //  {
  //    "12,3": "A",
  //    ...
  //  }
  this.labelData = lblData;

  // Collisions.  In other words, we record stones that couldn't be placed on
  // the board, if
  this.collisions = coll;

  // Comment string.
  // Example:
  //  Black to move and make life.
  this.comment = comment;

  // The board region this flattened representation is meant to display.
  this.boardRegion = boardRegion;

  // The cropping object.
  this.cropping = cropping;
};

glift.bridge._Flattened.prototype = {
  /**
   * Provide a SGF Point (intersection-point) and retrieve the relevant symbol.
   * Note, this uses the SGF indexing as opposed to the indexing in the array,
   * so if the cropping is provided
   */
  getSymbolPairIntPt: function(pt) {
    var row = this.symbolPairs[pt.y() - this.cropping.cbox().top()];
    if (row === undefined) { return row; }
    return row[pt.x() - this.cropping.cbox().left()];
  },

  /**
   * Get a symbol from a the symbol pair table.
   */
  getSymbolPair: function(pt) {
    var row = this.symbolPairs[pt.y()];
    if (row === undefined) { return row; }
    return row[pt.x()];
  },

  /**
   * Get a Int pt Label Point, using an integer point.
   */
  getLabelIntPt: function(pt) {
    return this.labelData[pt.toString()];
  },

  /*
   * Get a Int pt Label Point
   */
  getLabel: function(pt) {
    return this.getLabelIntPt(this.ptToIntpt(pt));
  },

  /**
   * Turn a 0 indexed pt to an intersection point.
   */
  ptToIntpt: function(pt) {
    return glift.util.point( 
        pt.x() + this.cropping.cbox().left(),
        pt.y() + this.cropping.cbox().top());
  }
};
/*
 * Intersection Data is the precise set of information necessary to display the
 * Go Board, which is to say, it is the set of stones and display information.
 *
 * The IntersectionData is just an object containing intersection information, of
 * the form:
 *
 *   {
 *     points: [
 *       pthash: {stone: "BLACK" , TRIANGLE: true, point: pt},
 *       pthash: {stone: "WHITE", point: pt},
 *       pthash: {LABEL: "A", point: pt}
 *     ],
 *     comment: "This is a good move",
 *   }
rules *
 * In the points array, each must object contain a point, and each should contain a
 * mark or a stone.  There can only be a maximum of one stone and one mark
 * (glift.enums.marks).
 */
glift.bridge.intersections = {
  propertiesToMarks: {
    CR: glift.enums.marks.CIRCLE,
    LB: glift.enums.marks.LABEL,
    MA: glift.enums.marks.XMARK,
    SQ: glift.enums.marks.SQUARE,
    TR: glift.enums.marks.TRIANGLE
  },

  /**
   * Returns property data -- everything minus the stone data.  The empty stone
   * data object is still supplied so that users can fill in the rest of the
   * data.
   *
   * Ex. of returned object:
   *  {
   *    stones: {
   *      WHITE: [],
   *      BLACK: [],
   *      EMPTY: [] // useful for clearing out captures
   *    },
   *    marks: {
   *      TRIANGLE: [pt, pt, ...],
   *      // It's unfortunate that labels need their own structure.
   *      LABEL: [{point:pt, value: 'val'}, ...]
   *    }
   *    comment : "foo",
   *    lastMove : { color: <color>, point: <point> }
   *    nextMoves : [ { color: <color>, point: <point> }, ...]
   *    correctNextMoves : [ {color: <color>, point: <point> }, ...]
   *    displayDataType : <Either PARTIAL or FULL>.  Defaults to partial.
   *  }
   */
  // TODO(kashomon): Make this a proper object constructor with accessors and
  // methods and whatnot.  It's getting far too complicated.
  basePropertyData: function(movetree, problemConditions) {
    var out = {
      stones: {
        WHITE: [],
        BLACK: [],
        EMPTY: []
      },
      marks: {},
      comment: glift.util.none,
      lastMove: glift.util.none,
      nextMoves: [],
      correctNextMoves: [],
      captures: [],
      displayDataType: glift.enums.displayDataTypes.PARTIAL
    };
    out.comment = movetree.properties().getComment();
    out.lastMove = movetree.getLastMove();
    out.marks = glift.bridge.intersections.getCurrentMarks(movetree);
    out.nextMoves = movetree.nextMoves();
    out.correctNextMoves = problemConditions !== undefined
        ? glift.rules.problems.correctNextMoves(movetree, problemConditions)
        : [];
    return out;
  },

  /**
   * Extends the basePropertyData with stone data.
   */
  getFullBoardData: function(movetree, goban, problemConditions) {
    var baseData = glift.bridge.intersections.basePropertyData(
        movetree, problemConditions);
    baseData.displayDataType = glift.enums.displayDataTypes.FULL;
    var gobanStones = goban.getAllPlacedStones();
    for (var i = 0; i < gobanStones.length; i++) {
      var stone = gobanStones[i];
      baseData.stones[stone.color].push(stone.point);
    }
    return baseData;
  },

  /**
   * CurrentCaptures is expected to look like:
   *
   * {
   *    BLACK: [..pts..],
   *    WHITE: [..pts..]
   * }
   */
  nextBoardData: function(movetree, currentCaptures, problemConditions) {
    var baseData = glift.bridge.intersections.basePropertyData(
        movetree, problemConditions);
    baseData.stones = movetree.properties().getAllStones();
    baseData.stones.EMPTY = [];
    for (var color in currentCaptures) {
      for (var i = 0; i < currentCaptures[color].length; i++) {
        baseData.stones.EMPTY.push(currentCaptures[color][i]);
      }
    }
    return baseData;
  },

  /**
   * Ascertain the previous board state.  This requires knowing what the 'next'
   * moves (stones) and captures were.
   */
  // TODO(kashomon): Reduce duplication with nextBoardData.
  previousBoardData: function(movetree, stones, captures,
      problemConditions) {
    var baseData = glift.bridge.intersections.basePropertyData(
        movetree, problemConditions);
    baseData.stones = captures;
    baseData.stones.EMPTY = [];
    for (var color in stones) {
      for (var i = 0; i < stones[color].length; i++) {
        baseData.stones.EMPTY.push(stones[color][i]);
      }
    }
    return baseData;
  },

  /**
   * Create an object with the current marks at the current position in the
   * movetree.
   *
   * returns: map from
   */
  getCurrentMarks: function(movetree) {
    var outMarks = {};
    for (var prop in glift.bridge.intersections.propertiesToMarks) {
      var mark = glift.bridge.intersections.propertiesToMarks[prop];
      if (movetree.properties().contains(prop)) {
        var marksToAdd = [];
        var data = movetree.properties().getAllValues(prop);
        for (var i = 0; i < data.length; i++) {
          if (prop === glift.sgf.allProperties.LB) {
            // Labels have the form { point: pt, value: 'A' }
            marksToAdd.push(glift.sgf.convertFromLabelData(data[i]));
          } else {
            // A single point
            marksToAdd.push(glift.util.pointFromSgfCoord(data[i]));
          }
        }
        outMarks[mark] = marksToAdd;
      }
    }
    return outMarks;
  }
};
/**
 * Widgets are toplevel objects, which combine display and
 * controller/rules bits together.
 */
glift.widgets = {
  /**
   * Returns a widgetManager.
   */
  create: function(options) {
    options = glift.widgets.options.setBaseOptionDefaults(options);
    if (options.sgf && options.sgfList.length === 0) {
      options.sgfList = [options.sgf];
    }
    return new glift.widgets.WidgetManager(
      options.sgfList,
      options.initialListIndex,
      options.allowWrapAround,
      options.sgfDefaults,
      glift.widgets.options.getDisplayOptions(options)).draw();
  }
};
/**
 * The base web UI widget.  It can be extended, if necessary.
 */
glift.widgets.BaseWidget = function(sgfOptions, displayOptions, manager) {
  this.type = sgfOptions.type;
  this.sgfOptions = glift.util.simpleClone(sgfOptions);
  this.displayOptions = glift.util.simpleClone(displayOptions);
  this.manager = manager;

  // Used for problems, exclusively
  this.correctness = undefined;
  this.correctNextSet = undefined;
  this.numCorrectAnswers = undefined;
  this.totalCorrectAnswers = undefined;

  this.wrapperDiv = displayOptions.divId; // We split the wrapper div.
  this.controller = undefined; // Initialized with draw.
  this.display = undefined; // Initialized by draw.
  this.iconBar = undefined; // Initialized by draw.
  this.boardRegion = undefined; // Initialized by draw.
};

glift.widgets.BaseWidget.prototype = {
  /**
   * Draw the widget.
   */
  draw: function() {
    this.controller = this.sgfOptions.controllerFunc(this.sgfOptions);
    this.displayOptions.intersections = this.controller.getIntersections();
    var comps = glift.enums.boardComponents;
    var requiredComponents = [comps.BOARD];
    this.displayOptions.boardRegion =
        this.sgfOptions.boardRegion === glift.enums.boardRegions.AUTO
        ? glift.bridge.getCropFromMovetree(this.controller.movetree)
        : this.sgfOptions.boardRegion;
    if (this.displayOptions.useCommentBar) {
      requiredComponents.push(comps.COMMENT_BOX);
    }
    if (this.sgfOptions.icons.length > 0) {
      requiredComponents.push(comps.ICONBAR);
    }
    var parentDivBbox = glift.displays.bboxFromDiv(this.wrapperDiv);
    var positioning = glift.displays.positionWidget(
      parentDivBbox,
      this.displayOptions.boardRegion,
      this.displayOptions.intersections,
      requiredComponents);
    var divIds = this._createDivsForPositioning(positioning, this.wrapperDiv);

    // TODO(kashomon): Remove these hacks. We shouldn't be modifying
    // displayOptions.
    this.displayOptions.divId = divIds.boardBoxId;
    this.display = glift.displays.create(this.displayOptions);
    divIds.commentBoxId && this._createCommentBox(divIds.commentBoxId);
    if (divIds.iconBarBoxId) {
      this.iconBar = this._createIconBar(
          divIds.iconBarBoxId, this.sgfOptions.icons, parentDivBbox);
    }

    divIds.iconBarBoxId && this._initIconActions(this.iconBar);
    this._initStoneActions();
    this._initKeyHandlers();
    this._initProblemData();
    this.applyBoardData(this.controller.getEntireBoardState());
    return this;
  },

  _createDivsForPositioning: function(positioning, wrapperDiv) {
    var expectedKeys = [
        'boardBox', 'iconBarBox', 'commentBox', 'extraIconBarBox' ];
    var out = {};
    var that = this;
    var createDiv = function(bbox) {
      var newId = 'glift_internal_div_' + glift.util.idGenerator.next();
      $('#' + wrapperDiv).append('<div id="' + newId + '"></div>');
      that._setNotSelectable(newId);
      var cssObj = {
        top: bbox.top(),
        left: bbox.left(),
        width: bbox.width(),
        height: bbox.height(),
        position: 'absolute'
      };
      $('#' + newId).css(cssObj);
      return newId;
    };
    for (var i = 0; i < expectedKeys.length; i++) {
      if (positioning[expectedKeys[i]]) {
        out[expectedKeys[i] + 'Id'] = createDiv(positioning[expectedKeys[i]]);
      }
    }
    return out;
  },

  _getProblemType: function() {
    var props = this.controller.movetree.properties();
    var probTypes = glift.enums.problemTypes;
    if (props.contains('EV')) {
      var value = props.getOneValue('EV').toUpperCase();
      if (probTypes[value] !== undefined && value !== probTypes.AUTO) {
        return value;
      }
    }
    if (this.controller.movetree.nextMoves().length === 0) {
      return probTypes.EXAMPLE;
    }
    return probTypes.STANDARD;
  },

  _setNotSelectable: function(divId) {
    $('#' + divId).css({
        '-webkit-touch-callout': 'none',
        '-webkit-user-select': 'none',
        '-khtml-user-select': 'none',
        '-moz-user-select': 'moz-none',
        '-ms-user-select': 'none',
        'user-select': 'none',
        '-webkit-highlight': 'none',
        '-webkit-tap-highlight-color': 'rgba(0,0,0,0)',
        'cursor': 'default'
    });
    return this;
  },

  _createCommentBox: function(commentBoxId) {
    this.commentBox = glift.displays.gui.commentBox(
        commentBoxId, this.displayOptions.theme);
  },

  _createIconBar: function(iconId, icons, parentBbox) {
    return glift.displays.icons.bar({
      themeName: this.displayOptions.theme,
      divId: iconId,
      vertMargin: 5, // For good measure
      horzMargin: 5,
      icons: icons,
      parentBbox: parentBbox
    });
  },

  _initIconActions: function(iconBar) {
    var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
    var that = this;
    var iconActions = this.displayOptions.iconActions;
    iconBar.forEachIcon(function(icon) {
      var iconName = icon.iconName;
      if (!iconActions.hasOwnProperty(icon.iconName)) {
        // Make sure that there exists an action specified in the
        // displayOptions, before we add any options.
        return
      }
      var actionsForIcon = {};

      actionsForIcon.click = iconActions[iconName].click;
      actionsForIcon.mouseover = iconActions[iconName].mouseover ||
        function(event, widgetRef, icon) {
          $('#' + icon.elementId).attr('fill', 'red');
        };
      actionsForIcon.mouseout = iconActions[iconName].mouseout ||
        function(event, widgetRef, icon) {
          $('#' + icon.elementId)
            .attr('fill', widgetRef.iconBar.theme.icons.DEFAULT.fill);
        };
      // TODO(kashomon): Add touch events conditionally based on the detected
      // browser.
      // actionsForIcon.touchstart = iconActions[iconName].touchstart ||
          // function(d3Event,  widgetRef, iconObj) {
            // d3Event.preventDefault && d3Event.preventDefault();
            // d3Event.stopPropagation && d3Event.stopPropagation();
            // widgetRef.displayOptions.iconActions[
                // iconObj.iconName].click(d3Event, widgetRef, iconObj);
          // };
      for (var eventName in actionsForIcon) {
        var eventFunc = actionsForIcon[eventName];
        // We init each action separately so that we avoid the lazy binding of
        // eventFunc.
        that._initOneIconAction(iconBar, iconName, eventName, eventFunc);
      }
    });
    iconBar.flushEvents();
  },

  _initOneIconAction: function(iconBar, iconName, eventName, eventFunc) {
    var widget = this;
    iconBar.setEvent(iconName, eventName, function(event, icon) {
      eventFunc(event, widget, icon, iconBar);
    });
  },

  /**
   * Initialize the stone actions.
   */
  _initStoneActions: function() {
    var stoneActions = this.displayOptions.stoneActions;
    stoneActions.click = this.sgfOptions.stoneClick;
    var that = this;
    for (var eventName in stoneActions) {
      this._initOneStoneAction(eventName, stoneActions[eventName]);
    }
    this.display.intersections().flushEvents();
  },

  _initOneStoneAction: function(eventName, func) {
    var that = this;
    this.display.intersections().setEvent(eventName, function(event, pt) {
      func(event, that, pt);
    });
  },

  /**
   * Assign Key actions to some other action.
   */
  _initKeyHandlers: function() {
    var that = this;
    this.keyHandlerFunc = function(e) {
      var name = glift.keyMappings.codeToName(e.which);
      if (name && that.sgfOptions.keyMappings[name] !== undefined) {
        var actionName = that.sgfOptions.keyMappings[name];
        // actionNamespaces look like: icons.arrowleft.mouseup
        var actionNamespace = actionName.split('.');
        var action = that.displayOptions[actionNamespace[0]];
        for (var i = 1; i < actionNamespace.length; i++) {
          action = action[actionNamespace[i]];
        }
        action(e, that);
      }
    };
    $('body').keydown(this.keyHandlerFunc);
  },

  /**
   * Initialize properties based on problem type.
   */
  _initProblemData: function() {
    if (this.sgfOptions.widgetType ===
        glift.enums.widgetTypes.CORRECT_VARIATIONS_PROBLEM) {
      var correctNext = glift.rules.problems.correctNextMoves(
          this.controller.movetree, this.sgfOptions.problemConditions);
      // A Set: i.e., a map of points to true
      this.correctNextSet = this.correctNextSet || {};
      this.numCorrectAnswers = this.numCorrectAnswers || 0;
      this.totalCorrectAnswers = this.totalCorrectAnswers
          || this.sgfOptions.totalCorrectVariationsOverride
          || correctNext.length;
      // TODO(kashomon): Remove this hack: The icon should be specified with
      // some sort of options.
      this.iconBar.addTempText(
          'multiopen-boxonly',
          this.numCorrectAnswers + '/' + this.totalCorrectAnswers,
          'black');
    }
  },

  /**
   * Apply the BoardData to both the comments box and the board. Uses
   * glift.bridge to communicate with the display.
   */
  applyBoardData: function(boardData) {
    if (boardData && boardData !== glift.util.none) {
      this.setCommentBox(boardData.comment);
      glift.bridge.setDisplayState(
          boardData, this.display, this.sgfOptions.showVariations);
    }
  },

  /**
   * Set the CommentBox with some specified text, if the comment box exists.
   */
  setCommentBox: function(text) {
    if (this.commentBox === undefined) {
      // Do nothing -- there is no comment box to set.
    } else if (text && text !== glift.util.none) {
      this.commentBox.setText(text);
    } else {
      this.commentBox.clearText();
    }
    return this;
  },

  reload: function() {
    if (this.correctness !== undefined) {
      this.correctNextSet = undefined;
      this.numCorrectAnswers = undefined;
      this.totalCorrectAnswers = undefined;
    }
    this.redraw();
  },

  /**
   * Redraw the widget.  This also resets the widget state in perhaps confusing
   * ways.
   */
  redraw: function() {
    this.destroy();
    this.draw();
  },

  destroy: function() {
    $('#' + this.wrapperDiv).empty();
    this.correctness = undefined;
    this.keyHandlerFunc !== undefined
        && $('body').unbind('keydown', this.keyHandlerFunc);
    this.keyHandlerFunc = undefined;
    this.display = undefined;
  }
}
/**
 * The Widget Manager manages state across widgets.  When widgets are created,
 * they are always created in the context of a Widget Manager.
 */
glift.widgets.WidgetManager = function(
    sgfList, sgfListIndex, allowWrapAround, sgfDefaults, displayOptions) {
  this.sgfList = sgfList;
  this.sgfListIndex = sgfListIndex;
  this.allowWrapAround = allowWrapAround
  this.sgfDefaults = sgfDefaults;
  this.displayOptions = displayOptions;

  // Defined on draw
  this.currentWidget = undefined;
};

glift.widgets.WidgetManager.prototype = {
  draw: function() {
    var that = this;
    this.getSgfString(function(sgfObj) {
      // Prevent flickering by destroying the widget _after_ loading the SGF.
      that.destroy();
      that.currentWidget = that.createWidget(sgfObj).draw();
    });
    return this;
  },

  getCurrentWidget: function() {
    return this.currentWidget;
  },

  /**
   * Get the current SGF Object from the SGF List.
   */
  getCurrentSgfObj: function() {
    var curSgfObj = this.sgfList[this.sgfListIndex];
    if (glift.util.typeOf(curSgfObj) === 'string') {
      var out = {};
      if (/^\s*\(;/.test(curSgfObj)) {
        // This is a standard SGF String.
        out.sgfString = curSgfObj;
      } else {
        // assume a URL.
        out.url = curSgfObj
      }
      curSgfObj = out;
    }
    var processedObj = glift.widgets.options.setSgfOptionDefaults(
        curSgfObj, this.sgfDefaults);
    if (this.sgfList.length > 1) {
      if (this.allowWrapAround) {
        processedObj.icons.push(this.displayOptions.nextSgfIcon);
        processedObj.icons.splice(0, 0, this.displayOptions.previousSgfIcon);
      } else {
        if (this.sgfListIndex === 0) {
          processedObj.icons.push(this.displayOptions.nextSgfIcon);
        } else if (this.sgfListIndex === this.sgfList.length - 1) {
          processedObj.icons.splice(0, 0, this.displayOptions.previousSgfIcon);
        } else {
          processedObj.icons.push(this.displayOptions.nextSgfIcon);
          processedObj.icons.splice(0, 0, this.displayOptions.previousSgfIcon);
        }
      }
    }
    return processedObj;
  },

  /**
   * Get the SGF string.  Since these can be loaded with ajax, the data needs to
   * be returned with a callback.
   */
  getSgfString: function(callback) {
    var sgfObj = this.getCurrentSgfObj();
    if (sgfObj.url) {
      this.loadSgfWithAjax(sgfObj.url, sgfObj, callback);
    } else {
      callback(sgfObj);
    }
  },

  /**
   * Create a Sgf Widget.
   */
  createWidget: function(sgfObj) {
    return new glift.widgets.BaseWidget(sgfObj, this.displayOptions, this);
  },

  /**
   * Temporarily replace the current widget with another widget.  Used in the
   * case of the PROBLEM_SOLUTION_VIEWER.
   */
  createTemporaryWidget: function(sgfObj) {
    this.currentWidget.destroy();
    sgfObj = glift.widgets.options.setSgfOptionDefaults(
        sgfObj, this.sgfDefaults);
    this.temporaryWidget = this.createWidget(sgfObj).draw();
  },

  returnToOriginalWidget: function() {
    this.temporaryWidget && this.temporaryWidget.destroy();
    this.temporaryWidget = undefined;
    this.currentWidget.draw();
  },

  /**
   * Internal implementation of nextSgf/previous sgf..
   */
  _nextSgfInternal: function(indexChange) {
    if (!this.sgfList.length > 1) {
      return; // Nothing to do
    }
    if (this.allowWrapAround) {
      this.sgfListIndex = (this.sgfListIndex + indexChange + this.sgfList.length)
          % this.sgfList.length;
    } else {
      this.sgfListIndex = this.sgfListIndex + indexChange;
      if (this.sgfListIndex < 0) {
        this.sgfListIndex = 0;
      } else if (this.sgfListIndex >= this.sgfList.length) {
        this.sgfListIndex = this.sgfList.length - 1;
      }
    }
    this.draw();
  },

  /**
   * Get the next SGF.  Requires that the list be non-empty.
   */
  nextSgf: function() { this._nextSgfInternal(1); },

  /**
   * Get the next SGF.  Requires that the list be non-empty.
   */
  prevSgf: function() { this._nextSgfInternal(-1); },

  /**
   * Undraw the most recent widget and remove references to it.
   */
  destroy: function() {
    this.currentWidget && this.currentWidget.destroy();
    this.currentWidget = undefined;
    this.temporaryWidget && this.temporaryWidget.destroy();
    this.temporaryWidget = undefined;
    return this;
  },

  /**
   * Load a urlOrObject with AJAX.  If the urlOrObject is an object, then we
   * assume that the caller is trying to set some objects in the widget.
   */
  loadSgfWithAjax: function(url, sgfObj, callback) {
    $.ajax({
      url: url,
      dataType: 'text',
      cache: false,
      success: function(data) {
        sgfObj.sgfString = data;
        callback(sgfObj);
      }
    });
  }
};
glift.widgets.options = {
  /**
   * Set the defaults on options.  Note: This makes a copy and so is (sort of)
   * an immutable operation on a set of options.
   */
  setBaseOptionDefaults: function(options) {
    var options = glift.util.simpleClone(options);
    var baseTemplate = glift.util.simpleClone(
        glift.widgets.options.baseOptions);
    for (var optionName in baseTemplate) {
      if (optionName === 'sgfDefaults') {
        options.sgfDefaults = options.sgfDefaults || {};
        for (var key in baseTemplate.sgfDefaults) {
          if (options.sgfDefaults[key] === undefined) {
            options.sgfDefaults[key] = baseTemplate.sgfDefaults[key];
          }
        }
      } else if (options[optionName] === undefined) {
        options[optionName] = baseTemplate[optionName];
      }
    }
    return options
  },

  /**
   * Set the default SGF Options.  At this point, we assume that that
   * baseOptions has alreday been copied and filled in.  The process of
   * setting the sgf options goes as follows:
   *
   * 1. Get the default WidgetType from the sgfDefaults.
   * 2. Retrieve the WidgetType overrides.
   * Then:
   *  3. Prefer first options set explicitly in the sgfObj
   *  4. Then, prefer options set in the WidgetType Overrides
   *  5. Finally, prefer options set in baseOptions.sgfDefaults
   */
  setSgfOptionDefaults: function(sgfObj, sgfDefaults) {
    if (!sgfObj) throw "SGF Obj undefined";
    if (!sgfDefaults) throw "SGF Defaults undefined";

    sgfObj = glift.util.simpleClone(sgfObj);
    sgfDefaults = glift.util.simpleClone(sgfDefaults);
    sgfObj.widgetType = sgfObj.widgetType || sgfDefaults.widgetType;
    var widgetTypeOverrides = glift.util.simpleClone(
        glift.widgets.options[sgfObj.widgetType]);
    for (var key in sgfDefaults) {
      if (key in sgfObj) {
      } else if (key in widgetTypeOverrides) {
        sgfObj[key] = widgetTypeOverrides[key];
      } else {
        sgfObj[key] = sgfDefaults[key];
      }
    }
    return sgfObj;
  },

  /**
   * Get only the widget specific options -- i.e. not manager options nor sgf
   * options.
   */
  getDisplayOptions: function(fullOptions) {
    var outOptions = {};
    var ignore = {
      sgfList: true,
      sgf: true,
      initialListIndex: true,
      allowWrapAround: true,
      sgfDefaults: true
    };
    for (var key in fullOptions) {
      if (!ignore[key]) {
        outOptions[key] = fullOptions[key];
      }
    }
    return outOptions;
  }
};
/**
 * Option defaults.
 *
 * Generally, there are three classes of options:
 *
 * 1. Manager Options. Meta options hoving to do with managing widgets
 * 2. Display Options. Options having to do with how widgets are displayed
 * 3. Sgf Options. Options having to do specifically with each SGF.
 */
glift.widgets.options.baseOptions = {
  /**
   * The sgf parameter can be one of the following:
   *  - An SGF in literal string form.
   *  - A URL to an SGF.
   *  - An SGF Object.
   *
   * If sgf is specified as an object in can contain any of the options
   * specified in sgfDefaults.  In addition, the follow parameters may be
   * specified:
   *  - sgfString: a literal SGF String
   *  - initialPosition: where to start in the SGF
   *  - url: a url to
   *
   * As you might expect, if the user sets sgf to a literal string form or to a
   * url, it is transformed into an SGF object internally.
   */
  sgf: undefined,

  /**
   * The defaults or SGF objects.
   */
  sgfDefaults: {
    /**
     * The default widget type. Specifies what type of widget to create.
     */
    widgetType: glift.enums.widgetTypes.GAME_VIEWER,

    /**
     * Defines where to start on the go board. An empty string implies the very
     * beginning. Rather than describe how you can detail the paths, here are
     * some examples of ways to specify an initial position.
     * 0         - Start at the 0th move (the root node)
     * 1         - Start at the 1st move. This is often used in combination with
     *             a black pass to specify that white should play in a
     *             particular problem.
     * 53        - Start at the 53rd move, taking the primary path
     * 2.3       - Start at the 3rd variation on move 2 (actually move 3)
     * 3         - Start at the 3rd move, going through all the top variations
     * 2.0       - Start at the 3rd move, going through all the top variations
     * 0.0.0.0   - Start at the 3rd move, going through all the top variations
     * 2.3-4.1   - Start at the 1st variation of the 4th move, arrived at by
     *             traveling through the 3rd varition on the 2nd move
     */
    initialPosition: '',

    /**
     * The board region to display.  The boardRegion will be 'guessed' if it's set
     * to 'AUTO'.
     */
    boardRegion: glift.enums.boardRegions.AUTO,

    /**
     * Callback to perform once a problem is considered correct / incorrect.
     */
    problemCallback: function() {},

    /**
     * Conditions for determing whether a branch of a movetree is correct.  A
     * map from property-keys, to an array of substring values.  If the array is
     * empty, then we only test to see if the property exists at the current
     * positien.
     *
     * The default tests whether there is a 'GB' property or a 'C' (comment)
     * property containing 'Correct' or 'is correct'.
     */
    problemConditions: {
      GB: [],
      C: ['Correct', 'is correct']
    },

    /**
     * Specifies what action to perform based on a particular keystroke.  In
     * otherwords, a mapping from key-enum to action path.
     *
     * See glift.keyMappings
     */
    keyMappings: {
      ARROW_LEFT: 'iconActions.chevron-left.click',
      ARROW_RIGHT: 'iconActions.chevron-right.click'
    },

    /**
     * For all correct, there are multiple correct answers that a user must get.
     * This allows us to specify (in ms) how long the user has until the problem
     * is automatically reset.
     */
    correctVariationsResetTime: undefined,

    /**
     * You can, if you wish, override the total number of correct variations
     * that a user must get correct.
     */
    totalCorrectVariationsOverride: undefined,

    /**
     * The extra icons.  This will
     */
    extraIcons: undefined,

    //-------------------------------------------------------------------------
    // These options must always be overriden by the widget type overrides.
    //
    // This could easily be changed, but right now this exists as a reminder to
    // the widget creator that they should override these options. In practice,
    // it seems that these particular options need to be set on a per-widget
    // basis anyway.
    //-------------------------------------------------------------------------

    /**
     * Whether or not to show variations.  See glift.enums.showVariations
     * Values: NEVER, ALWAYS, MORE_THAN_ONE
     */
    showVariations: undefined,

    /**
     * The function that creates the controller at widget-creation time.
     * See glift.controllers for more detail
     */
    controllerFunc: undefined,

    /**
     * The icons to use in the icon-bar.  This is a list of icon-names, which
     * must be spceified in glift.displays.gui.icons.
     */
    icons: undefined,

    /**
     * The action that is performed when a sure clicks on an intersection.
     */
    stoneClick: undefined
  },

  //----------------------------------------------------------------------
  // These are really widget Manager Options.  Any update to here must be
  // accompanied with an update to options.getDisplayOptions.
  //----------------------------------------------------------------------

  /**
   * The SGF list is a list of SGF objects (given above)
   */
  sgfList: [],

  /**
    * Index into the above list.  I can't imagine why anyone would want to change
    * the initial index for the sgfList, but it's here anyway for
    * configurability.
    */
  initialListIndex: 0,

  /**
   * If there are multiple SGFs in the SGF list, this flag indicates whether or
   * not to allow the user to go back to the beginnig (or conversely, the end).
   */
  allowWrapAround: false,

  //--------------------------------------------------------------------------
  // The rest of the options are the set of display options for the widget
  // It is assumed that these options are immutable for the life the widget
  // manager instance.
  //--------------------------------------------------------------------------

  /**
   * The div id in which we create the go board.  The default is glift_display,
   * but this will almost certainly need to be set by the user.
   */
  divId: 'glift_display',

  /**
   * Specify a background image for the go board.  You can specify an
   * absolute or a relative path.
   *
   * Examples:
   * 'images/kaya.jpg'
   * 'http://www.mywebbie.com/images/kaya.jpg'
   */
  goBoardBackground: '',

  /**
   * Whether or not to use the comment bar. It's possible this should be made
   * part of the SGF.
   */
  useCommentBar: true,

  /**
   * Div splits with the CommentBar.  Thus, there are three resulting divs - the
   * remainder is used by the last div - the icon bar.
   */
  splitsWithComments: [.70, .20],

  /**
   * Div splits without the comment bar.  Thus, there are two resulting divs -
   * the remainder is used by the last div -- the icon bar
   */
  splitsWithoutComments: [.90],

  /**
   * Div splits with only the comment bar.
   */
  splitsWithOnlyComments: [.80],

  /**
   * The name of the theme.
   */
  theme: 'DEFAULT',

  /**
   * Enable FastClick (for mobile displays).
   */
  enableFastClick: false,

  /**
   * Previous SGF icon
   */
  previousSgfIcon: 'chevron-left',

  /**
   * Next SGF Icon
   */
  nextSgfIcon: 'chevron-right',

  /**
   * Actions for stones.  If the user specifies his own actions, then the
   * actions specified by the user will take precedence.
   */
  stoneActions: {
    /**
     * click is specified in sgfOptions as stoneClick.  The actions that must
     * happen on each click vary for each widget, so we can't make a general
     * click function here.
     */
    click: undefined,

    /**
     * Ghost-stone for hovering.
     */
    mouseover: function(event, widget, pt) {
      var hoverColors = { "BLACK": "BLACK_HOVER", "WHITE": "WHITE_HOVER" };
      var currentPlayer = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        widget.display.intersections()
            .setStoneColor(pt, hoverColors[currentPlayer])
            .flushStone(pt);
      }
    },

    /**
     * Ghost-stone removal for hovering.
     */
    mouseout: function(event, widget, pt) {
      var currentPlayer = widget.controller.getCurrentPlayer();
      if (widget.controller.canAddStone(pt, currentPlayer)) {
        widget.display && widget.display.intersections()
            .setStoneColor(pt, 'EMPTY')
            .flushStone(pt);
      }
    },

    // TODO(kashomon): It's not clear if we want this. Revisit later.
    touchend: function(event, widget, pt) {
      event.preventDefault && event.preventDefault();
      event.stopPropagation && event.stopPropagation();
      widget.sgfOptions.stoneClick(event, widget, pt);
    }
  },

  /**
   * The actions for the icons.  The keys in iconACtions
   */
  iconActions: {
    start: {
      click:  function(event, widget, icon, iconBar) {
        widget.applyBoardData(widget.controller.toBeginning());
      }
    },

    end: {
      click:  function(event, widget, icon, iconBar) {
        widget.applyBoardData(widget.controller.toEnd());
      }
    },

    arrowright: {
      click: function(event, widget, icon, iconBar) {
        widget.applyBoardData(widget.controller.nextMove());
      }
    },

    arrowleft: {
      click:  function(event, widget, icon, iconBar) {
        widget.applyBoardData(widget.controller.prevMove());
      }
    },

    // Get next problem.
    'chevron-right': {
      click: function(event, widget, icon, iconBar) {
        widget.manager.nextSgf();
      }
    },

    // Get the previous problem.
    'chevron-left': {
      click: function(event, widget, icon, iconBar) {
        widget.manager.prevSgf();
      }
    },

    // Try again
    refresh: {
      click: function(event, widget, icon, iconBar) {
        widget.reload();
      }
    },

    undo: {
      click: function(event, widget, icon, iconBar) {
        widget.manager.returnToOriginalWidget();
      }
    },

    // Go to the explain-board.
    roadmap: {
      click: function(event, widget, iconObj, iconBar) {
        var manager = widget.manager;
        var sgfObj = {
          widgetType: glift.enums.widgetTypes.GAME_VIEWER,
          initialPosition: widget.sgfOptions.initialPosition,
          sgfString: widget.sgfOptions.sgfString,
          showVariations: glift.enums.showVariations.ALWAYS,
          problemConditions: glift.util.simpleClone(
              widget.sgfOptions.problemConditions),
          icons: ['start', 'end', 'arrowleft', 'arrowright', 'undo']
        }
        manager.createTemporaryWidget(sgfObj);
      }
    }
  }
};
/**
 * Board Editor options.
 */
glift.widgets.options.BOARD_EDITOR = {
  stoneClick: function(event, widget, pt) {},

  icons: ['start', 'end', 'arrowleft', 'arrowright'],

  problemConditions: {},

  showVariations: glift.enums.showVariations.ALWAYS,

  controllerFunc: glift.controllers.boardEditor
};
/**
 * Additional Options for the GameViewers
 */
glift.widgets.options.CORRECT_VARIATIONS_PROBLEM = {
  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var data = widget.controller.addStone(pt, currentPlayer);
    var problemResults = glift.enums.problemResults;
    if (data.result === problemResults.FAILURE) {
      // Illegal move -- nothing to do.  Don't make the player fail based on
      // an illegal move.
      return;
    }
    widget.applyBoardData(data);
    var probTypes = glift.enums.problemTypes;
    var callback = widget.sgfOptions.problemCallback;
    if (widget.correctness === undefined) {
      if (data.result === problemResults.CORRECT) {
        widget.iconBar.destroyTempIcons();
        if (widget.correctNextSet[pt.toString()] === undefined) {
          widget.correctNextSet[pt.toString()] = true;
          widget.numCorrectAnswers++;
          if (widget.numCorrectAnswers === widget.totalCorrectAnswers) {
            widget.correctness = problemResults.CORRECT;
            widget.iconBar.addTempText(
                'multiopen-boxonly',
                widget.numCorrectAnswers + '/' + widget.totalCorrectAnswers,
                '#0CC');
            callback(problemResults.CORRECT);
          } else {
            widget.iconBar.addTempText(
                'multiopen-boxonly',
                widget.numCorrectAnswers + '/' + widget.totalCorrectAnswers,
                '#000');
            setTimeout(function() {
              widget.controller.initialize();
              widget.applyBoardData(widget.controller.getEntireBoardState());
            }, widget.sgfOptions.correctVariationsResetTime);
          }
        }
      } else if (data.result == problemResults.INCORRECT) {
        widget.iconBar.destroyTempIcons();
        widget.iconBar.addCenteredTempIcon('multiopen-boxonly', 'cross', 'red');
        widget.iconBar.clearTempText('multiopen-boxonly');
        widget.correctness = problemResults.INCORRECT;
        callback(problemResults.INCORRECT);
      }
    }
  },

  showVariations: glift.enums.showVariations.NEVER,

  icons: ['refresh', 'roadmap', 'multiopen-boxonly'],

  controllerFunc: glift.controllers.staticProblem,

  correctVariationsResetTime: 500 // In milliseconds.
};
/**
 * Additional Options for EXAMPLEs
 */
glift.widgets.options.EXAMPLE = {
  stoneClick: function(event, widget, pt) {},

  icons: [],

  problemConditions: {},

  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  controllerFunc: glift.controllers.gameViewer
};
/**
 * Additional Options for the GameViewers
 */
glift.widgets.options.GAME_VIEWER = {
  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var partialData = widget.controller.addStone(pt, currentPlayer);
    widget.applyBoardData(partialData);
  },

  keyMappings: {
    ARROW_LEFT: 'iconActions.arrowleft.click',
    ARROW_RIGHT: 'iconActions.arrowright.click'
  },

  icons: ['start', 'end', 'arrowleft', 'arrowright'],

  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  problemConditions: {},

  controllerFunc: glift.controllers.gameViewer
};
/**
 * Game Viewer options for when used as part of a widget
 */
glift.widgets.options.REDUCED_GAME_VIEWER = {
  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var partialData = widget.controller.addStone(pt, currentPlayer);
    widget.applyBoardData(partialData);
  },

  icons: ['arrowleft', 'arrowright'],

  problemConditions: {},

  showVariations: glift.enums.showVariations.MORE_THAN_ONE,

  controllerFunc: glift.controllers.gameViewer
};
/**
 * Additional Options for the GameViewers
 */
glift.widgets.options.STANDARD_PROBLEM = {
  stoneClick: function(event, widget, pt) {
    var currentPlayer = widget.controller.getCurrentPlayer();
    var data = widget.controller.addStone(pt, currentPlayer);
    var problemResults = glift.enums.problemResults;
    if (data.result === problemResults.FAILURE) {
      // Illegal move -- nothing to do.  Don't make the player fail based on
      // an illegal move.
      return;
    }
    widget.applyBoardData(data);
    var probTypes = glift.enums.problemTypes;
    var callback = widget.sgfOptions.problemCallback;
    if (widget.correctness === undefined) {
      if (data.result === problemResults.CORRECT) {
          widget.iconBar.addCenteredTempIcon('multiopen-boxonly', 'check', '#0CC');
          widget.correctness = problemResults.CORRECT;
          callback(problemResults.CORRECT);
      } else if (data.result == problemResults.INCORRECT) {
        widget.iconBar.destroyTempIcons();
        widget.iconBar.addCenteredTempIcon('multiopen-boxonly', 'cross', 'red');
        widget.correctness = problemResults.INCORRECT;
        callback(problemResults.INCORRECT);
      }
    }
  },

  showVariations: glift.enums.showVariations.NEVER,

  // TODO(kashomon): Consider using multiopen-boxonly instead of checkbox
  icons: ['refresh', 'roadmap', 'multiopen-boxonly'],

  controllerFunc: glift.controllers.staticProblem
};
