
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

  function getGradientColor(colors, negativeColors, i, base, scaleFactor, scaleFactorNegative){
    var useColors = colors;
    var useScaleFactor = scaleFactor;

    if (negativeColors) {
      if (i < 0) {
        i = Math.abs(i);
        useColors = negativeColors;

        if (scaleFactorNegative === false) {
          base = Math.abs(base);
          useScaleFactor = Math.abs(scaleFactor);
        } else {
          useScaleFactor = Math.abs(scaleFactorNegative);
        }
      }
    }

    var fIndex = (i-base)*useScaleFactor;
    var iIndex = Math.floor(fIndex);
    if (iIndex > useColors.length - 1){ iIndex = useColors.length - 1; }
    if (iIndex < 0) { iIndex = 0 };

    var iv = fIndex - iIndex;
    var iIndex1 = iIndex+1;
    if (iIndex1 > useColors.length - 1){ iIndex1 = iIndex; }

    return {
      r:  interp(useColors[iIndex][0], useColors[iIndex1][0], iv),
      g:  interp(useColors[iIndex][1], useColors[iIndex1][1], iv),
      b:  interp(useColors[iIndex][2], useColors[iIndex1][2], iv),
      a:  interp(useColors[iIndex][3], useColors[iIndex1][3], iv)
    };
  }

  function getIndexedColor(colors, negativeColors, i, base, scaleFactor, scaleFactorNegative){
    var index = Math.floor((i-base)*scaleFactor);

    if (negativeColors && index < 0) {
      index = (index * -1) - 1;
      if (index >= negativeColors.length) {
        index = negativeColors.length - 1;
      }

      return {
        r: negativeColors[index][0],
        g: negativeColors[index][1],
        b: negativeColors[index][2],
        a: negativeColors[index][3],
      };
    }

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
  this.negativeColors = [];

  this.setup = function (min, max, colors, negativeColors, colorInterpolation, colorHighlightMultiplier) {
    var colorFunction, scaleFactor;
    var base = min;
    var dataLength = max - min;

    var scaleFactorNegative = false;
    var dataLengthNegative = false;

    if (negativeColors) {
      if (max < 0) {
        max = max + 0.000001;
        base = max;
      } else if (max > 0 && min < 0) {
        dataLength = max;
        dataLengthNegative = min;
        base = 0;
      }
    }

    if (colorInterpolation === 'gradient') {
      colorFunction = getGradientColor;
      scaleFactor = (colors.length ) / (dataLength !== 0 ? dataLength : 1);
    } else {
      colorFunction = getIndexedColor;
      scaleFactor = (colors.length) / (dataLength + 1);
    }

    if (negativeColors) {
      if (max > 0 && min < 0) {
        if (colorInterpolation === 'gradient') {
          scaleFactorNegative = (negativeColors.length - 1) / (dataLengthNegative - 1);
        } else {
          scaleFactorNegative = (negativeColors.length) / (dataLengthNegative + 1);
        }
      }
    }

    this.colors = colors.map(function (clr) {
      return cssColorToArray(clr);
    });
    this.negativeColors = negativeColors.map(function (clr) {
      return cssColorToArray(clr);
    });

    this.getColor = function (dataValue) {
      var clr = colorFunction(this.colors, this.negativeColors, dataValue, base, scaleFactor, scaleFactorNegative);
      var hclr = getHighlightColor(clr, colorHighlightMultiplier);

      return {
        color: rgbString(clr.r, clr.g, clr.b, clr.a),
        highlight: rgbString(hclr.r, hclr.g, hclr.b, hclr.a)
      };
    };
  };

};
