(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {
    // Boolean - exchange x and y axes in the chart
    rotate: false, 

    // String - background color for graph
    backgroundColor: '#fff',

    // Boolean - whether each square in the dataset is outlined
    stroke: false,

    // Number - width of the outline stroke.
    strokePerc: 0.05,

    // String - the outline stroke color.
    strokeColor: "rgb(128,128,128)",

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

    // String - label font color.
    labelFontColor: "rgba(0,0,0,0.5)",

    // String - tooltipTemplate
    tooltipTemplate: "<%= xLabel %> | <%= yLabel %> : <%= value %>",

    // String - template for legend generation
    legendTemplate : ""

	};


	Chart.Type.extend({
		name: "HeatMap",
		defaults : defaultConfig,
		initialize:  function(data){

			//Expose options as a scope variable here so we can access it in the ScaleClass
			var options = this.options;
      
      this.colorManager = new ColorManager();
      this.colorManager.setup(data,this.options.colors,this.options);

			this.ScaleClass = Chart.Scale.extend({
				offsetGridLines : true,
				calculateBaseWidth : function(){
					return this.calculateX(1) - this.calculateX(0);
				},
				calculateBoxWidth : function(datasetCount, dataCount){
					//The padding between datasets is to the right of each bar, providing that there are more than 1 dataset
					var baseWidth = this.calculateBaseWidth() - ((datasetCount - 1) * options.barDatasetSpacing);
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
                // Check to see if line/bar here and decide where to place the line
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
      this.dataLength = 0;
      this.yLabels = [];

			//Set up tooltip events on the chart
			if (this.options.showTooltips){
				helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
					var activeBars = (evt.type !== 'mouseout') ? this.getBarsAtEvent(evt) : [];

					this.eachBars(function(bar){
						bar.restore(['fillColor', 'strokeColor']);
					});
					helpers.each(activeBars, function(activeBar){
						activeBar.fillColor = activeBar.highlightFill;
						activeBar.strokeColor = activeBar.highlightStroke;
					});
					this.showTooltip(activeBars);
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
					bars : []
				};


        if (dataset.data.length > this.dataLength){
          this.dataLength = dataset.data.length;
        }

				this.datasets.push(datasetObject);
        this.yLabels.push(dataset.label);


				helpers.each(dataset.data,function(dataPoint,index){
          var color = this.colorManager.getColor(dataPoint);
					//Add a new point for each piece of data, passing any required data to draw.
					datasetObject.bars.push(new this.BoxClass({
						value : dataPoint,
						label : data.labels[index],
						datasetLabel: dataset.label,
						strokeColor : this.options.strokeColor,
						fillColor : color.color,
						highlightFill : color.highlight, 
						highlightStroke : this.options.strokeColor,
					}));
				},this);

			},this);

			this.buildScale(data.labels, this.yLabels);

			this.BoxClass.prototype.base = this.scale.endPoint;

			this.eachBars(function(bar, index, datasetIndex){
				helpers.extend(bar, {
							x : this.scale.calculateX(index),
							y : this.scale.calculateY(datasetIndex+1),
							width : this.scale.calculateBoxWidth(),
							height : this.scale.calculateBoxHeight()
				});
				bar.save();
			}, this);

			this.render();
		},
		update : function(){
			this.scale.update();
			// Reset any highlight colours before updating.
			helpers.each(this.activeElements, function(activeElement){
				activeElement.restore(['fillColor', 'strokeColor']);
			});

			this.eachBars(function(bar){
				bar.save();
			});
			this.render();
		},
		eachBars : function(callback){
			helpers.each(this.datasets,function(dataset, datasetIndex){
				helpers.each(dataset.bars, callback, this, datasetIndex);
			},this);
		},
		getBarsAtEvent : function(e){
      var eventPosition = helpers.getRelativePosition(e),
        barIndex;

			for (var datasetIndex = 0; datasetIndex < this.datasets.length; datasetIndex++) {
				for (barIndex = 0; barIndex < this.datasets[datasetIndex].bars.length; barIndex++) {
					if (this.datasets[datasetIndex].bars[barIndex].inRange(eventPosition.x,eventPosition.y)){
						return [this.datasets[datasetIndex].bars[barIndex]];
					}
				}
			}

			return [];
		},
		buildScale : function(labels, yLabels){
			var self = this;

			var dataTotal = function(){
				var values = [];
				self.eachBars(function(bar){
					values.push(bar.value);
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
					var updatedRanges = helpers.calculateScaleRange(
            [0, self.datasets.length],
						currentHeight,
						this.fontSize,
            false,
            true
					);
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

			if (this.options.scaleOverride){
				helpers.extend(scaleOptions, {
					calculateYRange: helpers.noop,
					steps: this.options.scaleSteps,
					stepValue: this.options.scaleStepWidth,
					min: this.options.scaleStartValue,
					max: this.options.scaleStartValue + (this.options.scaleSteps * this.options.scaleStepWidth)
				});
			}

			this.scale = new this.ScaleClass(scaleOptions);
		},
		addData : function(valuesArray,label){
			//Map the values array for each of the datasets
			helpers.each(valuesArray,function(value,datasetIndex){
				//Add a new point for each piece of data, passing any required data to draw.
				this.datasets[datasetIndex].bars.push(new this.BoxClass({
					value : value,
					label : label,

          x : this.scale.calculateX(index),
          y : this.scale.calculateY(datasetIndex+1),
          width : this.scale.calculateBoxWidth(),
          height : this.scale.calculateBoxHeight(),

					base : this.scale.endPoint,
					strokeColor : this.datasets[datasetIndex].strokeColor,
					fillColor : this.datasets[datasetIndex].fillColor
				}));
			},this);

			this.scale.addXLabel(label);
			//Then re-render the chart.
			this.update();
		},
		removeData : function(){
			this.scale.removeXLabel();
			//Then re-render the chart.
			helpers.each(this.datasets,function(dataset){
				dataset.bars.shift();
			},this);
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
    showTooltip : function(ChartElements){
      this.draw();
      helpers.each(ChartElements, function(Element) {
        var tooltipPosition = Element.tooltipPosition();
        var tooltipVariables = {
          xLabel: Element.datasetLabel,
          yLabel: Element.label,
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
      }, this);
      return this;
    },
		draw : function(ease){
			var easingDecimal = ease || 1;
			this.clear();

			var ctx = this.chart.ctx;

			this.scale.draw(easingDecimal);

			//Draw all the bars for each dataset
			helpers.each(this.datasets,function(dataset,datasetIndex){
				helpers.each(dataset.bars,function(bar,index){
					if (bar.hasValue()){
						bar.base = this.scale.endPoint;
						//Transition then draw
						bar.transition({
							x : this.scale.calculateX(index),
							y : this.scale.calculateY(datasetIndex+1),
							width : this.scale.calculateBoxWidth(),
							height : this.scale.calculateBoxHeight()
						}, easingDecimal).draw();
					}
				},this);

			},this);
		}
	});


}).call(this);
