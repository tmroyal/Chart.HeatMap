
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
