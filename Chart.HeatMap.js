(function(){
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var defaultConfig = {
		//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
		scaleBeginAtZero : false,

		//Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(0,0,0,.05)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: true,

		//Boolean - If there is a stroke on each bar
		barShowStroke : true,

		//Number - Pixel width of the bar stroke
		barStrokeWidth : 2,

		//Number - Spacing between each of the X value sets
		barValueSpacing : 5,

		//Number - Spacing between data sets within X values
		barDatasetSpacing : 1,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

	};


	Chart.Type.extend({
		name: "HeatMap",
		defaults : defaultConfig,
		initialize:  function(data){

			//Expose options as a scope variable here so we can access it in the ScaleClass
			var options = this.options;

			this.ScaleClass = Chart.Scale.extend({
				offsetGridLines : true,
				calculateBarX : function(datasetCount, datasetIndex, boxIndex){
					//Reusable method for calculating the xPosition of a given bar based on datasetIndex & width of the bar
					var xWidth = this.calculateBaseWidth(),
						xAbsolute = this.calculateX(boxIndex) - (xWidth/2),
						barWidth = this.calculateBoxWidth(datasetCount);

					return xAbsolute + (barWidth * datasetIndex) + (datasetIndex * options.barDatasetSpacing) + barWidth/2;
				},
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
              var yLabelCenter = this.endPoint - (yLabelGap * index),
                linePositionY = Math.round(yLabelCenter),
                drawHorizontalLine = this.showHorizontalLines;

              ctx.textAlign = "right";
              ctx.textBaseline = "middle";
              if (this.showLabels){
                ctx.fillText(labelString,xStart - 10,yLabelCenter);
              }

              // This is X axis, so draw it
              if (index === 0 && !drawHorizontalLine){
                drawHorizontalLine = true;
              }

              if (drawHorizontalLine){
                ctx.beginPath();
              }

              if (index > 0){
                // This is a grid line in the centre, so drop that
                ctx.lineWidth = this.gridLineWidth;
                ctx.strokeStyle = this.gridLineColor;
              } else {
                // This is the first line on the scale
                ctx.lineWidth = this.lineWidth;
                ctx.strokeStyle = this.lineColor;
              }

              linePositionY += helpers.aliasPixel(ctx.lineWidth);

              if(drawHorizontalLine){
                ctx.moveTo(xStart, linePositionY);
                ctx.lineTo(this.width, linePositionY);
                ctx.stroke();
                ctx.closePath();
              }

              ctx.lineWidth = this.lineWidth;
              ctx.strokeStyle = this.lineColor;
              ctx.beginPath();
              ctx.moveTo(xStart - 5, linePositionY);
              ctx.lineTo(xStart, linePositionY);
              ctx.stroke();
              ctx.closePath();

            },this);

            helpers.each(this.xLabels,function(label,index){
              var xPos = this.calculateX(index) + helpers.aliasPixel(this.lineWidth),
                // Check to see if line/bar here and decide where to place the line
                linePos = this.calculateX(index - (this.offsetGridLines ? 0.5 : 0)) + helpers.aliasPixel(this.lineWidth),
                isRotated = (this.xLabelRotation > 0),
                drawVerticalLine = this.showVerticalLines;

              // This is Y axis, so draw it
              if (index === 0 && !drawVerticalLine){
                drawVerticalLine = true;
              }

              if (drawVerticalLine){
                ctx.beginPath();
              }

              if (index > 0){
                // This is a grid line in the centre, so drop that
                ctx.lineWidth = this.gridLineWidth;
                ctx.strokeStyle = this.gridLineColor;
              } else {
                // This is the first line on the scale
                ctx.lineWidth = this.lineWidth;
                ctx.strokeStyle = this.lineColor;
              }

              if (drawVerticalLine){
                ctx.moveTo(linePos,this.endPoint);
                ctx.lineTo(linePos,this.startPoint - 3);
                ctx.stroke();
                ctx.closePath();
              }


              ctx.lineWidth = this.lineWidth;
              ctx.strokeStyle = this.lineColor;


              // Small lines at the bottom of the base grid line
              ctx.beginPath();
              ctx.moveTo(linePos,this.endPoint);
              ctx.lineTo(linePos,this.endPoint + 5);
              ctx.stroke();
              ctx.closePath();

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
				strokeWidth : this.options.barStrokeWidth,
				showStroke : this.options.barShowStroke,
				ctx : this.chart.ctx,
        draw : function(){
          var ctx = this.ctx,
            halfWidth = this.width/2,
            drawWidth = this.width,
            drawHeight = this.height,
            left = this.x - halfWidth,
            top = this.y,
            halfStroke = this.strokeWidth / 2;

          // Canvas doesn't allow us to stroke inside the width so we can
          // adjust the sizes to fit if we're setting a stroke on the line
          if (this.showStroke){
            left += halfStroke;
            drawWidth -= halfStroke;
            drawHeight -= this.strokeWidth;;
            top += halfStroke;
          }

          ctx.fillStyle = this.fillColor;
          ctx.strokeStyle = this.strokeColor;
          ctx.lineWidth = this.strokeWidth;

          helpers.drawRoundedRectangle(ctx, left, top, drawWidth, drawHeight, 4);

          ctx.fill();
          if (this.showStroke){
            ctx.stroke();
          }

        }
			});

			//Iterate through each of the datasets, and build this into a property of the chart
			helpers.each(data.datasets,function(dataset,datasetIndex){

				var datasetObject = {
					label : dataset.label || null,
					fillColor : dataset.fillColor,
					strokeColor : dataset.strokeColor,
					bars : []
				};

        if (dataset.data.length > this.dataLength){
          this.dataLength = dataset.data.length;
        }

				this.datasets.push(datasetObject);
        this.yLabels.push(dataset.label);

				helpers.each(dataset.data,function(dataPoint,index){
					//Add a new point for each piece of data, passing any required data to draw.
					datasetObject.bars.push(new this.BoxClass({
						value : dataPoint,
						label : data.labels[index],
						datasetLabel: dataset.label,
						strokeColor : dataset.strokeColor,
						fillColor : 'hsla(100,'+dataPoint*10+'%,50%, 0.7)',//dataset.fillColor,
						highlightFill : dataset.highlightFill || dataset.fillColor,
						highlightStroke : dataset.highlightStroke || dataset.strokeColor
					}));
				},this);

			},this);

			this.buildScale(data.labels, this.yLabels);

			this.BoxClass.prototype.base = this.scale.endPoint;

			this.eachBars(function(bar, index, datasetIndex){
				helpers.extend(bar, {
					width : this.scale.calculateBoxWidth(this.datasets.length),
					height : this.scale.calculateBoxHeight(this.datalength),
					x: this.scale.calculateBarX(this.datasets.length, datasetIndex, index),
					y: this.scale.endPoint
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
			var barsArray = [],
				eventPosition = helpers.getRelativePosition(e),
				datasetIterator = function(dataset){
					barsArray.push(dataset.bars[barIndex]);
				},
				barIndex;

			for (var datasetIndex = 0; datasetIndex < this.datasets.length; datasetIndex++) {
				for (barIndex = 0; barIndex < this.datasets[datasetIndex].bars.length; barIndex++) {
					if (this.datasets[datasetIndex].bars[barIndex].inRange(eventPosition.x,eventPosition.y)){
						helpers.each(this.datasets, datasetIterator);
						return barsArray;
					}
				}
			}

			return barsArray;
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
				padding : (this.options.showScale) ? 0 : (this.options.barShowStroke) ? this.options.barStrokeWidth : 0,
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
					x: this.scale.calculateBarX(this.datasets.length, datasetIndex, this.scale.valuesCount),
					y: this.scale.endPoint,
					width : this.scale.calculateBoxWidth(this.datasets.length),
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
							width : this.scale.calculateBoxWidth(this.datasets.length, this.dataLength)
						}, easingDecimal).draw();
					}
				},this);

			},this);
		}
	});


}).call(this);
