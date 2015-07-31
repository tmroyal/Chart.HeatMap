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
