// CSS COLOR PARSER CODE
//
// (c) Dean McNamee <dean@gmail.com>, 2012.
//
// https://github.com/deanm/css-color-parser-js
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

// http://www.w3.org/TR/css3-color/
var cssColorParser = function(){

  var kCSSColorTable = {
    "rebeccapurple": [102, 51, 153], 
    "transparent": [0,0,0,0], "aliceblue": [240,248,255,1],
    "antiquewhite": [250,235,215,1], "aqua": [0,255,255,1],
    "aquamarine": [127,255,212,1], "azure": [240,255,255,1],
    "beige": [245,245,220,1], "bisque": [255,228,196,1],
    "black": [0,0,0,1], "blanchedalmond": [255,235,205,1],
    "blue": [0,0,255,1], "blueviolet": [138,43,226,1],
    "brown": [165,42,42,1], "burlywood": [222,184,135,1],
    "cadetblue": [95,158,160,1], "chartreuse": [127,255,0,1],
    "chocolate": [210,105,30,1], "coral": [255,127,80,1],
    "cornflowerblue": [100,149,237,1], "cornsilk": [255,248,220,1],
    "crimson": [220,20,60,1], "cyan": [0,255,255,1],
    "darkblue": [0,0,139,1], "darkcyan": [0,139,139,1],
    "darkgoldenrod": [184,134,11,1], "darkgray": [169,169,169,1],
    "darkgreen": [0,100,0,1], "darkgrey": [169,169,169,1],
    "darkkhaki": [189,183,107,1], "darkmagenta": [139,0,139,1],
    "darkolivegreen": [85,107,47,1], "darkorange": [255,140,0,1],
    "darkorchid": [153,50,204,1], "darkred": [139,0,0,1],
    "darksalmon": [233,150,122,1], "darkseagreen": [143,188,143,1],
    "darkslateblue": [72,61,139,1], "darkslategray": [47,79,79,1],
    "darkslategrey": [47,79,79,1], "darkturquoise": [0,206,209,1],
    "darkviolet": [148,0,211,1], "deeppink": [255,20,147,1],
    "deepskyblue": [0,191,255,1], "dimgray": [105,105,105,1],
    "dimgrey": [105,105,105,1], "dodgerblue": [30,144,255,1],
    "firebrick": [178,34,34,1], "floralwhite": [255,250,240,1],
    "forestgreen": [34,139,34,1], "fuchsia": [255,0,255,1],
    "gainsboro": [220,220,220,1], "ghostwhite": [248,248,255,1],
    "gold": [255,215,0,1], "goldenrod": [218,165,32,1],
    "gray": [128,128,128,1], "green": [0,128,0,1],
    "greenyellow": [173,255,47,1], "grey": [128,128,128,1],
    "honeydew": [240,255,240,1], "hotpink": [255,105,180,1],
    "indianred": [205,92,92,1], "indigo": [75,0,130,1],
    "ivory": [255,255,240,1], "khaki": [240,230,140,1],
    "lavender": [230,230,250,1], "lavenderblush": [255,240,245,1],
    "lawngreen": [124,252,0,1], "lemonchiffon": [255,250,205,1],
    "lightblue": [173,216,230,1], "lightcoral": [240,128,128,1],
    "lightcyan": [224,255,255,1], "lightgoldenrodyellow": [250,250,210,1],
    "lightgray": [211,211,211,1], "lightgreen": [144,238,144,1],
    "lightgrey": [211,211,211,1], "lightpink": [255,182,193,1],
    "lightsalmon": [255,160,122,1], "lightseagreen": [32,178,170,1],
    "lightskyblue": [135,206,250,1], "lightslategray": [119,136,153,1],
    "lightslategrey": [119,136,153,1], "lightsteelblue": [176,196,222,1],
    "lightyellow": [255,255,224,1], "lime": [0,255,0,1],
    "limegreen": [50,205,50,1], "linen": [250,240,230,1],
    "magenta": [255,0,255,1], "maroon": [128,0,0,1],
    "mediumaquamarine": [102,205,170,1], "mediumblue": [0,0,205,1],
    "mediumorchid": [186,85,211,1], "mediumpurple": [147,112,219,1],
    "mediumseagreen": [60,179,113,1], "mediumslateblue": [123,104,238,1],
    "mediumspringgreen": [0,250,154,1], "mediumturquoise": [72,209,204,1],
    "mediumvioletred": [199,21,133,1], "midnightblue": [25,25,112,1],
    "mintcream": [245,255,250,1], "mistyrose": [255,228,225,1],
    "moccasin": [255,228,181,1], "navajowhite": [255,222,173,1],
    "navy": [0,0,128,1], "oldlace": [253,245,230,1],
    "olive": [128,128,0,1], "olivedrab": [107,142,35,1],
    "orange": [255,165,0,1], "orangered": [255,69,0,1],
    "orchid": [218,112,214,1], "palegoldenrod": [238,232,170,1],
    "palegreen": [152,251,152,1], "paleturquoise": [175,238,238,1],
    "palevioletred": [219,112,147,1], "papayawhip": [255,239,213,1],
    "peachpuff": [255,218,185,1], "peru": [205,133,63,1],
    "pink": [255,192,203,1], "plum": [221,160,221,1],
    "powderblue": [176,224,230,1], "purple": [128,0,128,1],
    "red": [255,0,0,1], "rosybrown": [188,143,143,1],
    "royalblue": [65,105,225,1], "saddlebrown": [139,69,19,1],
    "salmon": [250,128,114,1], "sandybrown": [244,164,96,1],
    "seagreen": [46,139,87,1], "seashell": [255,245,238,1],
    "sienna": [160,82,45,1], "silver": [192,192,192,1],
    "skyblue": [135,206,235,1], "slateblue": [106,90,205,1],
    "slategray": [112,128,144,1], "slategrey": [112,128,144,1],
    "snow": [255,250,250,1], "springgreen": [0,255,127,1],
    "steelblue": [70,130,180,1], "tan": [210,180,140,1],
    "teal": [0,128,128,1], "thistle": [216,191,216,1],
    "tomato": [255,99,71,1], "turquoise": [64,224,208,1],
    "violet": [238,130,238,1], "wheat": [245,222,179,1],
    "white": [255,255,255,1], "whitesmoke": [245,245,245,1],
    "yellow": [255,255,0,1], "yellowgreen": [154,205,50,1]
  }

  function clamp_css_byte(i) {  // Clamp to integer 0 .. 255.
    i = Math.round(i);  // Seems to be what Chrome does (vs truncation).
    return i < 0 ? 0 : i > 255 ? 255 : i;
  }

  function clamp_css_float(f) {  // Clamp to float 0.0 .. 1.0.
    return f < 0 ? 0 : f > 1 ? 1 : f;
  }

  function parse_css_int(str) {  // int or percentage.
    if (str[str.length - 1] === '%')
      return clamp_css_byte(parseFloat(str) / 100 * 255);
    return clamp_css_byte(parseInt(str));
  }

  function parse_css_float(str) {  // float or percentage.
    if (str[str.length - 1] === '%')
      return clamp_css_float(parseFloat(str) / 100);
    return clamp_css_float(parseFloat(str));
  }

  function css_hue_to_rgb(m1, m2, h) {
    if (h < 0) h += 1;
    else if (h > 1) h -= 1;

    if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    if (h * 2 < 1) return m2;
    if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
    return m1;
  }

  function parseCSSColor(css_str) {
    // Remove all whitespace, not compliant, but should just be more accepting.
    var str = css_str.replace(/ /g, '').toLowerCase();

    // Color keywords (and transparent) lookup.
    if (str in kCSSColorTable) return kCSSColorTable[str].slice();  // dup.

    // #abc and #abc123 syntax.
    if (str[0] === '#') {
      if (str.length === 4) {
        var iv = parseInt(str.substr(1), 16);  // TODO(deanm): Stricter parsing.
        if (!(iv >= 0 && iv <= 0xfff)) return null;  // Covers NaN.
        return [((iv & 0xf00) >> 4) | ((iv & 0xf00) >> 8),
                (iv & 0xf0) | ((iv & 0xf0) >> 4),
                (iv & 0xf) | ((iv & 0xf) << 4),
                1];
      } else if (str.length === 7) {
        var iv = parseInt(str.substr(1), 16);  // TODO(deanm): Stricter parsing.
        if (!(iv >= 0 && iv <= 0xffffff)) return null;  // Covers NaN.
        return [(iv & 0xff0000) >> 16,
                (iv & 0xff00) >> 8,
                iv & 0xff,
                1];
      }

      return null;
    }

    var op = str.indexOf('('), ep = str.indexOf(')');
    if (op !== -1 && ep + 1 === str.length) {
      var fname = str.substr(0, op);
      var params = str.substr(op+1, ep-(op+1)).split(',');
      var alpha = 1;  // To allow case fallthrough.
      switch (fname) {
        case 'rgba':
          if (params.length !== 4) return null;
          alpha = parse_css_float(params.pop());
          // Fall through.
        case 'rgb':
          if (params.length !== 3) return null;
          return [parse_css_int(params[0]),
                  parse_css_int(params[1]),
                  parse_css_int(params[2]),
                  alpha];
        case 'hsla':
          if (params.length !== 4) return null;
          alpha = parse_css_float(params.pop());
          // Fall through.
        case 'hsl':
          if (params.length !== 3) return null;
          var h = (((parseFloat(params[0]) % 360) + 360) % 360) / 360;  // 0 .. 1
          // NOTE(deanm): According to the CSS spec s/l should only be
          // percentages, but we don't bother and let float or percentage.
          var s = parse_css_float(params[1]);
          var l = parse_css_float(params[2]);
          var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
          var m1 = l * 2 - m2;
          return [clamp_css_byte(css_hue_to_rgb(m1, m2, h+1/3) * 255),
                  clamp_css_byte(css_hue_to_rgb(m1, m2, h) * 255),
                  clamp_css_byte(css_hue_to_rgb(m1, m2, h-1/3) * 255),
                  alpha];
        default:
          return null;
      }
    }

    return null;
  }
  return parseCSSColor;
}();


var ColorManager = function(){

  function rgbString(r,g,b,a){
    r = clamped(r, 0, 255);
    g = clamped(g, 0, 255);
    b = clamped(b, 0, 255);
    a = clamped(a, 0, 255);
    return 'rgba('+Math.floor(r)+','+Math.floor(g)+','+Math.floor(b)+','+a+')';
  }

  function clamped(n, min, max){
    return Math.max(min, Math.min(n, max));
  }

  function interp(v1,v2,x){
    return v2*x+v1*(1-x);
  }

  function getGradientColor(colors, i, base, scaleFactor){
    var fIndex = (i-base)*scaleFactor;
    var iIndex = Math.floor(fIndex);
    var iv = fIndex - iIndex;
    var iIndex1 = iIndex+1;
    if (iIndex1 > colors.length - 1){ iIndex1 = iIndex; }

    return {
      r:  interp(colors[iIndex][0], colors[iIndex1][0], iv),
      g:  interp(colors[iIndex][1], colors[iIndex1][1], iv),
      b:  interp(colors[iIndex][2], colors[iIndex1][2], iv),
      a:  interp(colors[iIndex][3], colors[iIndex1][3], iv)
    };
  }

  function getIndexedColor(colors, i, base, scaleFactor){
    var index = Math.floor((i-base)*scaleFactor);
    return {
      r: colors[index][0],
      g: colors[index][1],
      b: colors[index][2],
      a: colors[index][3],
    };
  }

  function getScaledColor(val, scale){
    val *= scale;
    return val > 255 ? 255 : val;
  }

  function getHighlightColor(color, colorHighlightMultiplier){
    return {
      r: getScaledColor(color.r, colorHighlightMultiplier),
      g: getScaledColor(color.g, colorHighlightMultiplier),
      b: getScaledColor(color.b, colorHighlightMultiplier),
      a: color.a
    };
  }

  function cssColorToArray(color){
    return cssColorParser(color);
  }
 
  this.getColor = function(){
    console.error('ColorManager: colors have not been setup');
  };

  this.colors = [];

  this.setup = function(min, max, colors, colorInterpolation, colorHighlightMultiplier){
    var colorFunction, scaleFactor;
    var dataLength = max-min;
    var base = min;

    if (colorInterpolation === 'gradient'){
      colorFunction = getGradientColor;
      scaleFactor = (colors.length-1)/(dataLength -1);
    } else {
      colorFunction = getIndexedColor;
      scaleFactor = (colors.length)/(dataLength+1);
    } 

    this.colors = colors.map(function(clr){
      return cssColorToArray(clr);
    });
    
    this.getColor = function(dataValue){
      var clr = colorFunction(this.colors, dataValue, base, scaleFactor);
      var hclr = getHighlightColor(clr, colorHighlightMultiplier);

      return { 
        color: rgbString(clr.r, clr.g, clr.b, clr.a),
        highlight: rgbString(hclr.r, hclr.g, hclr.b, hclr.a)
      };
    };
  };

};
(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {
    // String - background color for graph
    backgroundColor: '#fff',

    // Boolean - whether each square in the dataset is outlined
    stroke: false,

    // Number - width of the outline stroke.
    strokePerc: 0.05,

    // String - the outline stroke color.
    strokeColor: "rgb(128,128,128)",

    // String - the outline stroke color.
    highlightStrokeColor: "rgb(192,192,192)",

    // Boolean - whether to draw the heat map boxes with rounded corners
    rounded: true,

    // Number - the radius (as a percentage of size) of the rounded corners
    roundedRadius: 0.1,

    // Number - padding between heat map boxes (as a percentage of box size)
    paddingScale: 0.05,

    // String - "gradient", "palette"
    colorInterpolation: "gradient",

    // Array[String] - the colors used for the active color scheme.
    // Any number of colors is allowed.
    colors: [ "rgba(220,220,220,0.9)", "rgba(151,187,205,0.9)"],

    // Boolean - whether boxes change color on hover.
    colorHighlight: true, 

    // Number - a floating point value which specifies how much lighter or
    // darker a color becomes when hovered, where 1 is no change, 
    // 0.9 is slightly darker, and 1.1 is slightly lighter.
    colorHighlightMultiplier: 0.92,

    // Boolean - Whether to draw label data
    showLabels: true, 

    // Number - the font size of the label as percentage of box height
    labelScale: 0.2,

    // String - label font family
    labelFontFamily: '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',

    // String - label font style
    labelFontStyle: "normal",

    // String - label font color
    labelFontColor: "rgba(0,0,0,0.5)",

    // String - tooltipTemplate
    tooltipTemplate: "<%= xLabel %> | <%= yLabel %> : <%= value %>",
    
    // String - template for legend generation
    legendTemplate : '<div class="<%= name.toLowerCase() %>-legend">'+
            '<span class="<%= name.toLowerCase() %>-legend-text">'+
            '<%= min %>'+
            '</span>'+
            '<% for (var i = min; i <= max; i += (max-min)/6){ %>'+ // change 6 to number of divisions required
            '<span class="<%= name.toLowerCase() %>-legend-box" style="background-color: <%= colorManager.getColor(i).color %>;">&nbsp; </span>'+
            '<% } %>'+
            '<span class="<%= name.toLowerCase() %>-legend-text">'+
            '<%= max %>'+
            '</span>'+
            '</div>'

	};

	Chart.Type.extend({
		name: "HeatMap",
		defaults : defaultConfig,
		initialize:  function(data){

			//Expose options as a scope variable here so we can access it in the ScaleClass
			var options = this.options;

      this.max = -Infinity; 
      this.min = Infinity; 

      this.colorManager = new ColorManager();

			this.ScaleClass = Chart.Scale.extend({
				offsetGridLines : true,
				calculateBaseWidth : function(){
					return this.calculateX(1) - this.calculateX(0);
				},
				calculateBoxWidth : function(datasetCount, dataCount){
					//The padding between datasets is to the right of each box, providing that there are more than 1 dataset
					var baseWidth = this.calculateBaseWidth() - datasetCount - 1;
          var count = Math.max(datasetCount, dataCount);

					return this.calculateBaseWidth();
				},
        calculateBoxHeight: function(){
          return this.calculateY(0) - this.calculateY(1);
        },
        buildYLabels : function(){
          this.yLabelWidth = (this.display && this.showLabels) ? helpers.longestText(this.ctx,this.font,this.yLabels) : 0;
        },
        draw : function(){
          var ctx = this.ctx,
            yLabelGap = (this.endPoint - this.startPoint) / this.steps,
            xStart = Math.round(this.xScalePaddingLeft);
          if (this.display){
            ctx.fillStyle = this.textColor;
            ctx.font = this.font;
            helpers.each(this.yLabels,function(labelString,index){
              var yLabelCenter = this.endPoint - (yLabelGap * index) - yLabelGap*0.5,
                linePositionY = Math.round(yLabelCenter),
                drawHorizontalLine = this.showHorizontalLines;

              ctx.textAlign = "right";
              ctx.textBaseline = "middle";
              if (this.showLabels){
                ctx.fillText(labelString, xStart - 10, yLabelCenter);
              }
            },this);

            helpers.each(this.xLabels,function(label,index){
              var xPos = this.calculateX(index) + helpers.aliasPixel(this.lineWidth),
                // Check to see if line/box here and decide where to place the line
                linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) + helpers.aliasPixel(this.lineWidth),
                isRotated = (this.xLabelRotation > 0),
                drawVerticalLine = this.showVerticalLines;

              ctx.lineWidth = this.lineWidth;
              ctx.strokeStyle = this.lineColor;

              ctx.save();
              ctx.translate(xPos,(isRotated) ? this.endPoint + 12 : this.endPoint + 8);
              ctx.rotate(helpers.radians(this.xLabelRotation)*-1);
              ctx.font = this.font;
              ctx.textAlign = (isRotated) ? "right" : "center";
              ctx.textBaseline = (isRotated) ? "middle" : "top";
              ctx.fillText(label, 0, 0);
              ctx.restore();

            },this);
          }
        }

			});

			this.datasets = [];
      this.yLabels = [];
      this.xLabels = data.labels;

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activeBox = (evt.type !== 'mouseout') ? this.getBoxAtEvent(evt) : undefined;

          this.activeElement = activeBox;

					this.eachBoxes(function(box){
						box.restore(['fillColor', 'strokeColor']);
					});

          if (activeBox){
            activeBox.fillColor = activeBox.highlightFill;
            activeBox.strokeColor = activeBox.highlightStroke;

          }
          this.showTooltip(activeBox);
				});
			}

			//Declare the extension of the default point, to cater for the options passed in to the constructor
			this.BoxClass = Chart.Rectangle.extend({
				strokePerc : this.options.strokePerc,
				strokeColor : this.options.strokeColor,
				showStroke : this.options.stroke,
        fontColor : this.options.labelFontColor,
        fontFamily : this.options.labelFontFamily,
        fontScale : this.options.labelScale,
        showLabels : this.options.showLabels,
        radiusScale : this.options.rounded ? this.options.roundedRadius : 0,
        paddingScale : this.options.paddingScale,

				ctx : this.chart.ctx,

        draw : function(){
          var ctx = this.ctx,
            halfWidth = this.width/2,
            drawWidth = this.width,
            drawHeight = this.height,
            left = this.x - halfWidth,
            top = this.y,
            strokeWidth = this.strokePerc * this.width,
            halfStroke = strokeWidth / 2,
            leftPadding = this.paddingScale*drawWidth,
            topPadding = this.paddingScale*drawHeight;

          left += leftPadding*0.5;
          top += topPadding*0.5;
          drawWidth -= leftPadding;
          drawHeight -= topPadding;
          
          
          // Canvas doesn't allow us to stroke inside the width so we can
          // adjust the sizes to fit if we're setting a stroke on the line
          if (this.showStroke){
            left += halfStroke;
            drawWidth -= halfStroke;
            drawHeight -= halfStroke;
            top += halfStroke;
          }

          ctx.fillStyle = this.fillColor;
          ctx.strokeStyle = this.strokeColor;
          ctx.lineWidth = strokeWidth;

          helpers.drawRoundedRectangle(ctx, left, top, drawWidth, drawHeight, this.radiusScale*this.width);

          ctx.fill();
          if (this.showStroke){
            ctx.stroke();
          }

          if (this.showLabels && this.label !== null && this.label !== undefined){
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = this.fontColor;
            ctx.font = this.height*this.fontScale+"px "+this.fontFamily;
            ctx.fillText(this.value, left+drawWidth*0.5, top+drawHeight*0.5);
          }

        }
			});

			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset,datasetIndex){

				var datasetObject = {
					label : dataset.label || null,
					boxes : []
				};

				this.datasets.push(datasetObject);
        this.yLabels.push(dataset.label);

				helpers.each(dataset.data,function(dataPoint,index){
					datasetObject.boxes.push(new this.BoxClass({
						value : dataPoint,
						label : this.xLabels[index],
						datasetLabel: dataset.label,
						strokeColor : this.options.strokeColor,
						fillColor : 'white',
						highlightFill : 'black',
						highlightStroke : this.options.highlightStrokeColor,
					}));
				},this);

			},this);

      // chart.js has a y at bottom philosophy
      // that has made it difficult to be
      // able to simply redo the scale
      // coming soon
      this.datasets.reverse();
      this.yLabels.reverse();

			this.buildScale(data.labels, this.yLabels);

			this.BoxClass.prototype.base = this.scale.endPoint;

			this.eachBoxes(function(box, index, datasetIndex){
				helpers.extend(box, {
							x : this.scale.calculateX(index),
							y : this.scale.calculateY(datasetIndex+1),
							width : this.scale.calculateBoxWidth(),
							height : this.scale.calculateBoxHeight()
				});
				box.save();
			}, this);

      this.findMaxAndMin(true);
      this.applyColors();

			this.render();
		},
		update : function(){
			this.scale.update();
			// Reset any highlight colours before updating.
			if (this.activeElement){ 
				this.activeElement.restore(['fillColor', 'strokeColor']);
			}

			this.eachBoxes(function(box){
				box.save();
			});

			this.render();
		},
		eachBoxes : function(callback){
			helpers.each(this.datasets,function(dataset, datasetIndex){
				helpers.each(dataset.boxes, callback, this, datasetIndex);
			},this);
		},
		getBoxAtEvent : function(e){
      var eventPosition = helpers.getRelativePosition(e),
        boxIndex;

			for (var datasetIndex = 0; datasetIndex < this.datasets.length; datasetIndex++) {
				for (boxIndex = 0; boxIndex < this.datasets[datasetIndex].boxes.length; boxIndex++) {
					if (this.datasets[datasetIndex].boxes[boxIndex].inRange(eventPosition.x,eventPosition.y)){
						return this.datasets[datasetIndex].boxes[boxIndex];
					}
				}
			}

			return undefined;
		},
		buildScale : function(labels, yLabels){
			var self = this;

			var dataTotal = function(){
				var values = [];
				self.eachBoxes(function(box){
					values.push(box.value);
				});
				return values;
			};

			var scaleOptions = {
				templateString : this.options.scaleLabel,
				height : this.chart.height,
				width : this.chart.width,
				ctx : this.chart.ctx,
				textColor : this.options.scaleFontColor,
				fontSize : this.options.scaleFontSize,
				fontStyle : this.options.scaleFontStyle,
				fontFamily : this.options.scaleFontFamily,
				valuesCount : labels.length,
				beginAtZero : this.options.scaleBeginAtZero,
				integersOnly : this.options.scaleIntegersOnly,
				calculateYRange: function(currentHeight){
          var updatedRanges = {
            min: 0,
            max: self.datasets.length, 
            steps: self.datasets.length, 
            stepValue: 1
          };

					helpers.extend(this, updatedRanges);
				},
				xLabels : labels,
        yLabels : yLabels,
				font : helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
				lineWidth : this.options.scaleLineWidth,
				lineColor : this.options.scaleLineColor,
				showHorizontalLines : this.options.scaleShowHorizontalLines,
				showVerticalLines : this.options.scaleShowVerticalLines,
				gridLineWidth : (this.options.scaleShowGridLines) ? this.options.scaleGridLineWidth : 0,
				gridLineColor : (this.options.scaleShowGridLines) ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
				padding : (this.options.showScale) ? 0 : (this.options.stroke) ? this.options.strokeWidth : 0,
				showLabels : this.options.scaleShowLabels,
				display : this.options.showScale,
			};

			this.scale = new this.ScaleClass(scaleOptions);
		},

    addDataset: function(values, label){
      var datasetObject = {
        label: label,
        boxes: []
      };
      var datasetIndex = this.datasets.length;

      helpers.each(values,function(dataPoint,index){

        datasetObject.boxes.push(new this.BoxClass({
          value : dataPoint,
          label : this.xLabels[index],
          x : this.scale.calculateX(index),
          y : this.scale.calculateY(0),
          width : this.scale.calculateBoxWidth()+1,
          height : this.scale.calculateBoxHeight()+1,
          datasetLabel: label,
          strokeColor : this.options.strokeColor,
          highlightStroke : this.options.highlightStrokeColor,
        }));
      },this);


      this.datasets.unshift(datasetObject);
      this.scale.yLabels.unshift(label);
      this.scale.steps += 1;
      this.scale.max += 1;
      this.scale.fit();

      this.findMaxAndMin(true);
      this.applyColors();
      this.update();

    },

    removeDataset: function(){
      this.datasets.pop();
      this.scale.yLabels.pop();
      this.scale.steps -= 1; 
      this.scale.max -= 1; 
      this.scale.fit();
      this.findMaxAndMin(true);
      this.applyColors();
      this.update();
    },

    applyColors : function(){

      this.colorManager.setup(
        this.min, 
        this.max, 
        this.options.colors, 
        this.options.colorInterpolation, 
        this.options.colorHighlightMultiplier
      );

      this.eachBoxes(function(box){
        var clr = this.colorManager.getColor(box.value);
        box.fillColor = clr.color;
        box.highlightFill = clr.highlight;
        box.strokeColor = this.options.strokeColor;
        box.highlightStroke = this.options.highlightStrokeColor
        box.save();
      });
    },

    findMaxAndMin : function(reset){
      if (reset){
        this.min = Infinity;
        this.max = -Infinity; 
      }
      this.eachBoxes(function(box,index,datasetIndex){
        if (box.value > this.max) { this.max = box.value; }
        if (box.value < this.min) { this.min = box.value; }
      });
    },

		addData : function(valuesArray,label){
      valuesArray = valuesArray.concat().reverse(); // reverse to handle inverted scale

      var xValue = this.datasets[0].boxes.length;

			helpers.each(valuesArray,function(value,datasetIndex){
				this.datasets[datasetIndex].boxes.push(new this.BoxClass({
					value : value,
					label : label,
          datasetLabel: this.datasets[datasetIndex].label,
          x : this.scale.calculateX(xValue),
          y : this.scale.calculateY(datasetIndex+1),
          width : this.scale.calculateBoxWidth()+1,
          height : this.scale.calculateBoxHeight()+1,
          strokeColor : this.options.strokeColor,
          highlightStroke : this.options.highlightStrokeColor
				}));
			},this);

      this.findMaxAndMin(true);
      this.applyColor();
			this.scale.addXLabel(label);
			this.update();
		},
		removeData : function(){
			this.scale.removeXLabel();
			helpers.each(this.datasets,function(dataset){
				dataset.boxes.shift();
			},this);
      this.findMaxAndMin(true);
      this.applyColors();
			this.update();
		},
		reflow : function(){
			helpers.extend(this.BoxClass.prototype,{
				y: this.scale.endPoint,
				base : this.scale.endPoint
			});
			var newScaleProps = helpers.extend({
				height : this.chart.height,
				width : this.chart.width
			});
			this.scale.update(newScaleProps);
		},
    showTooltip : function(Element){
      this.draw();

      if(Element){
        var tooltipPosition = Element.tooltipPosition();
        var tooltipVariables = {
          yLabel: Element.datasetLabel,
          xLabel: Element.label,
          value: Element.value
        };

        new Chart.Tooltip({
          x: Math.round(tooltipPosition.x),
          y: Math.round(tooltipPosition.y+20),
          xPadding: this.options.tooltipXPadding,
          yPadding: this.options.tooltipYPadding,
          fillColor: this.options.tooltipFillColor,
          textColor: this.options.tooltipFontColor,
          fontFamily: this.options.tooltipFontFamily,
          fontStyle: this.options.tooltipFontStyle,
          fontSize: this.options.tooltipFontSize,
          caretHeight: this.options.tooltipCaretSize,
          cornerRadius: this.options.tooltipCornerRadius,
          text: helpers.template(this.options.tooltipTemplate, tooltipVariables),
          chart: this.chart,
          custom: this.options.customTooltips
        }).draw();
      }

      return this;
    },
		draw : function(ease){
			var easingDecimal = ease || 1;
			this.clear();

			this.scale.draw(easingDecimal);

			//Draw all the boxes for each dataset
			this.eachBoxes(function(box, index, datasetIndex){
          box.transition({
            x : this.scale.calculateX(index),
            y : this.scale.calculateY(datasetIndex+1),
            width : this.scale.calculateBoxWidth()+1,
            height : this.scale.calculateBoxHeight()+1
          }, easingDecimal).draw();
      });
		}
	});

}).call(this);
