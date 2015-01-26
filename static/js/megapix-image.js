/**
 * Mega pixel image rendering library for iOS6 Safari
 *
 * Fixes iOS6 Safari's image file rendering issue for large size image (over mega-pixel),
 * which causes unexpected subsampling when drawing it in canvas.
 * By using this library, you can safely render the image with proper stretching.
 *
 * Copyright (c) 2012 Shinichi Tomita <shinichi.tomita@gmail.com>
 * Released under the MIT license
 */
(function() {
    

    /**
   * MegaPixImage class
   */
  function MegaPixImage(wrapper, canvas, srcImage) {
    var myMPI = this;
    this.image = srcImage;
    this.targetX = 0;
    this.targetY = 0;
    this.mx = 0;
    this.my = 0;
    this.offsetX = { x:0, y:0 };
    this.imgWidth = 0;
    this.imgHeight = 0;
    this.dragoffx = 0; 
    this.dragoffy = 0;
    this.isDraging = !1;
    this.isPinch = !1;
    this.isRotate = !1;
    this.rotation = 0;
    this.currentDistance = 0;
    this.currentMAngel = 0;
    this.currentAngel = 0; //当前图片的旋转角度
    this.currentOffset = 0; //当前偏移量，相对于原图居中的坐标的移动的矢量距离
    this.currentOffsetAngel = 0; //当前移动的矢量角度
    this.currentScale = 1;
    this.scale = 0;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    
    var hammer = wrapper.hammer({ direction: Hammer.DIRECTION_ALL });
    hammer.data("hammer").get("pinch").set({ enable: true });
    hammer.data("hammer").get("rotate").set({ enable: true });
    
    hammer.bind("panmove", { mpImage: this }, function(e){
        e.preventDefault();
        //alert(e.gesture.deltaX + "   " + e.gesture.deltaY + "   " + center + "  " + JSON.stringify(e.gesture.center) );
        
        //var img = ctx.getImageData(0, 0, canvasPicker.width, canvasPicker.height);
        if(e.data.mpImage.isDraging && !e.data.mpImage.isRotate){
            
            
            console.log(" angel: " + e.data.mpImage.currentMAngel + " tagX: " + e.data.mpImage.targetX + "  tagY: " + e.data.mpImage.targetY);
            e.data.mpImage.currentDistance = e.gesture.distance;
            e.data.mpImage.currentMAngel = e.gesture.angle;
            //console.log("angel: " + e.gesture.angle + " distance: " + e.data.mpImage.currentDistance);
            /*
var offsetX = e.gesture.center.x - e.data.mpImage.mx,
                offsetY = e.gesture.center.y - e.data.mpImage.my;
            
            e.data.mpImage.mx = e.gesture.center.x;
            e.data.mpImage.my = e.gesture.center.y;
            
            if(e.data.mpImage.currentAngel !== 0){
                var distance = Math.sqrt(offsetX*offsetX + offsetY * offsetY);
                offsetX = distance * Math.cos((e.gesture.angle - e.data.mpImage.currentAngel) * Math.PI/180);
                offsetY = distance * Math.sin((e.gesture.angle - e.data.mpImage.currentAngel) * Math.PI/180);
            }
          
            var targetX = e.data.mpImage.targetX + offsetX,
                targetY = e.data.mpImage.targetY + offsetY;
            
            
            targetX = targetX < 0 ? 0 : targetX;
            targetY = targetY < 0 ? 0 : targetY;
            targetX = targetX > 1440 - e.data.mpImage.imgWidth ? 1440 - e.data.mpImage.imgWidth : targetX;
            targetY = targetY > 1920 - e.data.mpImage.imgHeight ? 1920 - e.data.mpImage.imgHeight : targetY;
            
            e.data.mpImage.targetX = targetX;
            e.data.mpImage.targetY = targetY;
*/
            
            e.data.mpImage.redraw();

        }
    }).bind("panstart",  { mpImage: this }, function(e){
        //center = JSON.stringify(e.gesture.center);
        e.data.mpImage.mx = e.gesture.center.x;  //move 的起始点
        e.data.mpImage.my = e.gesture.center.y;
        
        e.data.mpImage.isDraging = !0;
        
        
    }).bind("panend",  { mpImage: this }, function(e){
        e.data.mpImage.isDraging = !1;
        
        var targetAngel = e.data.mpImage.currentAngel + e.data.mpImage.rotation;
        
        
        var offsetX = e.data.mpImage.currentDistance * Math.cos((e.data.mpImage.currentMAngel - targetAngel) * Math.PI/180);
        var offsetY = e.data.mpImage.currentMAngel * Math.sin((e.data.mpImage.currentMAngel - targetAngel) * Math.PI/180);
            
        var targetX = e.data.mpImage.targetX + offsetX,
            targetY = e.data.mpImage.targetY + offsetY;
        
        console.log("end offx: " + offsetX + " offsetY: " + offsetY + " angel: " + e.data.mpImage.currentMAngel + " rotate: " + targetAngel);
        
        targetX = targetX < 0 ? 0 : targetX;
        targetY = targetY < 0 ? 0 : targetY;
        targetX = targetX > 1440 - e.data.mpImage.imgWidth ? 1440 - e.data.mpImage.imgWidth : targetX;
        targetY = targetY > 1920 - e.data.mpImage.imgHeight ? 1920 - e.data.mpImage.imgHeight : targetY;
        
        
        e.data.mpImage.targetX = targetX;
        e.data.mpImage.targetY = targetY;
        
        e.data.mpImage.currentDistance = 0;
        e.data.mpImage.currentMAngel = 0;
            
    }).bind("pinchstart", { mpImage: this }, function(e){
        e.data.mpImage.isPinch = !0;
    }).bind("pinchmove", { mpImage: this }, function(e){
        if(e.data.mpImage.isPinch){
            //e.data.mpImage.ctx.clearRect(0, 0,e.data.mpImage.canvas.width, e.data.mpImage.canvas.height);
            
             
            
            e.data.mpImage.scale = (e.gesture.scale - 1)/6;
            
            //console.log("pinch scale : " + e.data.mpImage.currentScale + " scale: " + e.gesture.scale);
            /*
            var scale = ((e.gesture.scale) - 1)/10 + 1;
            var targetWidth = Math.round(scale * e.data.mpImage.imgWidth);
            var targetHeight = Math.round(scale * e.data.mpImage.imgHeight);
            
            if(e.data.mpImage.currentAngel !== 0){
                var distance = Math.sqrt(offsetX*offsetX + offsetY * offsetY);
                offsetX = distance * Math.cos((e.data.mpImage.currentAngel) * Math.PI/180);
                offsetY = distance * Math.sin((e.data.mpImage.currentAngel) * Math.PI/180);
            }
            
            var targetX = e.data.mpImage.targetX + (e.data.mpImage.imgWidth - targetWidth)/2;
            var targetY = e.data.mpImage.targetY + (e.data.mpImage.imgHeight - targetHeight)/2;
            e.data.mpImage.targetX = targetX;
            e.data.mpImage.targetY = targetY;
            e.data.mpImage.imgWidth = targetWidth;
            e.data.mpImage.imgHeight = targetHeight;
            */
            //e.data.mpImage.redraw();
        }
    }).bind("pinchend", { mpImage: this }, function(e){
        e.data.mpImage.isPinch = !1;
        e.data.mpImage.currentScale += ((e.gesture.scale) - 1)/6;
        e.data.mpImage.scale = 0;
        
    }).bind("rotatestart", { mpImage: this }, function(e){
        e.data.mpImage.isRotate = !0;
    }).bind("rotatemove", { mpImage: this }, function(e){
        if(e.data.mpImage.isRotate){
            //e.data.mpImage.ctx.clearRect(0, 0,e.data.mpImage.canvas.width, e.data.mpImage.canvas.height);
            /*
var scale = ((e.gesture.scale) - 1)/10 + 1;
            var targetWidth = Math.round(scale * e.data.mpImage.imgWidth);
            var targetHeight = Math.round(scale * e.data.mpImage.imgHeight);
            var targetX = e.data.mpImage.targetX + (e.data.mpImage.imgWidth - targetWidth)/2;
            var targetY = e.data.mpImage.targetY + (e.data.mpImage.imgHeight - targetHeight)/2;
            e.data.mpImage.targetX = targetX;
            e.data.mpImage.targetY = targetY;
            e.data.mpImage.imgWidth = targetWidth;
            e.data.mpImage.imgHeight = targetHeight;
*/
            e.data.mpImage.rotation = e.gesture.rotation;
            e.data.mpImage.redraw();
            
        }
    }).bind("rotateend", { mpImage: this }, function(e){
        e.data.mpImage.isRotate = !1;
        e.data.mpImage.currentAngel =  Math.round((e.data.mpImage.currentAngel + e.data.mpImage.rotation)%360);
        e.data.mpImage.rotation = 0;
        //e.data.mpImage.redraw();
    });
    
     
    if (window.Blob && srcImage instanceof Blob) {
      if (!URL) { throw Error("No createObjectURL function found to create blob url"); }
      var img = new Image();
      img.src = URL.createObjectURL(srcImage);
      this.blob = srcImage;
      srcImage = img;
    }
    if (!srcImage.naturalWidth && !srcImage.naturalHeight) {
      var _this = this;
      srcImage.onload = srcImage.onerror = function() {
        var listeners = _this.imageLoadListeners;
        if (listeners) {
          _this.imageLoadListeners = null;
          for (var i=0, len=listeners.length; i<len; i++) {
            listeners[i]();
          }
        }
      };
      this.imageLoadListeners = [];
    }
    this.srcImage = srcImage;
  }
  
  /*
      剪裁图片并生成最终的万花筒
  */
  MegaPixImage.prototype.genProduct = function(){
      //将图片中心位置的
  }
  
  MegaPixImage.prototype.redraw = function(){
      if(this.image && this.ctx){
            var targetAngel = this.currentAngel + this.rotation;
            
            var offsetX = this.currentDistance * Math.cos((this.currentMAngel - targetAngel) * Math.PI/180);
            var offsetY = this.currentDistance * Math.sin((this.currentMAngel - targetAngel) * Math.PI/180);
                
            var targetX = this.targetX + offsetX,
                targetY = this.targetY + offsetY;
            
            
            targetX = targetX < 0 ? 0 : targetX;
            targetY = targetY < 0 ? 0 : targetY;
            targetX = targetX > 1440 - this.imgWidth ? 1440 - this.imgWidth : targetX;
            targetY = targetY > 1920 - this.imgHeight ? 1920 - this.imgHeight : targetY;
            
            this.ctx.clearRect(0, 0,this.canvas.width, this.canvas.height);
            this.ctx.save();
            this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
            this.ctx.rotate(targetAngel * Math.PI/180);
            var targetWidth = Math.round(this.imgWidth * (this.currentScale + this.scale)) ;
            var targetHeight = Math.round(this.imgHeight * (this.currentScale + this.scale)) ;
            
            /*
console.log("angel: " + this.currentAngel + "   " + this.rotation);
            console.log("wh: " + targetWidth + "  " + targetHeight);
            console.log("targ: " + targetX + "  " + targetY);
*/
            
            var offX = targetX - targetWidth/2;
            var offY = targetY - targetHeight/2;
            
            console.log("rect: " + targetWidth/-2 + offX + "   " + targetHeight/-2 + offY);
            this.ctx.drawImage(this.image, targetWidth/-2 + offX, targetHeight/-2 + offY, 
                            targetWidth, targetHeight);
            
            this.ctx.restore(); 
          
      }
  }
  /**
   * Detect subsampling in loaded image.
   * In iOS, larger images than 2M pixels may be subsampled in rendering.
   */
  MegaPixImage.prototype.detectSubsampling = function(img) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    if (iw * ih > 1024 * 1024) { // subsampling may happen over megapixel image
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, -iw + 1, 0);
      // subsampled image becomes half smaller in rendering size.
      // check alpha channel value to confirm image is covering edge pixel or not.
      // if alpha value is 0 image is not covering, hence subsampled.
      return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
    } else {
      return false;
    }
  }

  /**
   * Detecting vertical squash in loaded image.
   * Fixes a bug which squash image vertically while drawing into canvas for some images.
   */
  MegaPixImage.prototype.detectVerticalSquash = function(img, iw, ih) {
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = ih;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var data = ctx.getImageData(0, 0, 1, ih).data;
    // search image edge pixel position in case it is squashed vertically.
    var sy = 0;
    var ey = ih;
    var py = ih;
    while (py > sy) {
      var alpha = data[(py - 1) * 4 + 3];
      if (alpha === 0) {
        ey = py;
      } else {
        sy = py;
      }
      py = (ey + sy) >> 1;
    }
    var ratio = (py / ih);
    return (ratio===0)?1:ratio;
  }

  /**
   * Rendering image element (with resizing) and get its data URL
   */
  MegaPixImage.prototype.renderImageToDataURL = function(img, options, doSquash) {
    var canvas = document.createElement('canvas');
    this.renderImageToCanvas(img, canvas, options, doSquash);
    return canvas.toDataURL("image/jpeg", options.quality || 0.8);
  }

  /**
   * Rendering image element (with resizing) into the canvas element
   */
  MegaPixImage.prototype.renderImageToCanvas = function(img, canvas, options, doSquash) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    if (!(iw+ih)) return;
    var width = options.width, height = options.height;
    var ctx = canvas.getContext('2d');
    ctx.save();
    this.transformCoordinate(canvas, ctx, width, height, options.orientation);
    var subsampled = this.detectSubsampling(img);
    if (subsampled) {
      iw /= 2;
      ih /= 2;
    }
    var d = 1024; // size of tiling canvas
    var tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = tmpCanvas.height = d;
    var tmpCtx = tmpCanvas.getContext('2d');
    var vertSquashRatio = doSquash ? this.detectVerticalSquash(img, iw, ih) : 1;
    var dw = Math.ceil(d * width / iw);
    var dh = Math.ceil(d * height / ih / vertSquashRatio);
    var sy = 0;
    var dy = 0;
    while (sy < ih) {
      var sx = 0;
      var dx = 0;
      while (sx < iw) {
        tmpCtx.clearRect(0, 0, d, d);
        tmpCtx.drawImage(img, -sx, -sy);
        ctx.drawImage(tmpCanvas, 0, 0, d, d, dx, dy, dw, dh);
        sx += d;
        dx += dw;
      }
      sy += d;
      dy += dh;
    }
    ctx.restore();    
    tmpCanvas = tmpCtx = null;
  }

  /**
   * Transform canvas coordination according to specified frame size and orientation
   * Orientation value is from EXIF tag
   */
  MegaPixImage.prototype.transformCoordinate = function(canvas, ctx, width, height, orientation) {
    /*
switch (orientation) {
      case 5:
      case 6:
      case 7:
      case 8:
        canvas.width = height;
        canvas.height = width;
        break;
      default:
        canvas.width = width;
        canvas.height = height;
    }
    switch (orientation) {
      case 2:
        // horizontal flip
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        break;
      case 3:
        // 180 rotate left
        ctx.translate(width, height);
        ctx.rotate(Math.PI);
        break;
      case 4:
        // vertical flip
        ctx.translate(0, height);
        ctx.scale(1, -1);
        break;
      case 5:
        // vertical flip + 90 rotate right
        ctx.rotate(0.5 * Math.PI);
        ctx.scale(1, -1);
        break;
      case 6:
        // 90 rotate right
        ctx.rotate(0.5 * Math.PI);
        ctx.translate(0, -height);
        break;
      case 7:
        // horizontal flip + 90 rotate right
        ctx.rotate(0.5 * Math.PI);
        ctx.translate(width, -height);
        ctx.scale(-1, 1);
        break;
      case 8:
        // 90 rotate left
        ctx.rotate(-0.5 * Math.PI);
        ctx.translate(-width, 0);
        break;
      default:
        break;
    }
*/
    //finally translate the coordinate to centeralize image
    ctx.translate(720 - width/2, 960 - height/2);
    this.targetX = 720 - width/2;
    this.targetY = 960 - height/2;
    console.log("pOSITION: " + this.targetX + "  " + this.targetY);
    this.imgWidth = width;
    this.imgHeight =  height;
  }

  var URL = window.URL && window.URL.createObjectURL ? window.URL :
            window.webkitURL && window.webkitURL.createObjectURL ? window.webkitURL :
            null;

  

  /**
   * Rendering megapix image into specified target element
   */
  MegaPixImage.prototype.render = function(options, callback) {
    var target =  this.canvas;
    
    if (this.imageLoadListeners) {
      var _this = this;
      this.imageLoadListeners.push(function() { _this.render(target, options, callback); });
      return;
    }
    options = options || {};
    var imgWidth = this.srcImage.naturalWidth, imgHeight = this.srcImage.naturalHeight,
        width = options.width, height = options.height,
        maxWidth = options.maxWidth, maxHeight = options.maxHeight,
        doSquash = !this.blob || this.blob.type === 'image/jpeg';
    if (width && !height) {
      height = (imgHeight * width / imgWidth) << 0;
    } else if (height && !width) {
      width = (imgWidth * height / imgHeight) << 0;
    } else {
      width = imgWidth;
      height = imgHeight;
    }
    if (maxWidth && width > maxWidth) {
      width = maxWidth;
      height = (imgHeight * width / imgWidth) << 0;
    }
    if (maxHeight && height > maxHeight) {
      height = maxHeight;
      width = (imgWidth * height / imgHeight) << 0;
    }
    var opt = { width : width, height : height };
    for (var k in options) opt[k] = options[k];

    var tagName = target.tagName.toLowerCase();
    if (tagName === 'img') {
      target.src = this.renderImageToDataURL(this.srcImage, opt, doSquash);
    } else if (tagName === 'canvas') {
      this.renderImageToCanvas(this.srcImage, target, opt, doSquash);
    }
    if (typeof this.onrender === 'function') {
      this.onrender(target);
    }
    if (callback) {
      callback();
    }
    if (this.blob) {
      this.blob = null;
      URL.revokeObjectURL(this.srcImage.src);
    }
  };

  /**
   * Export class to global
   */
  if (typeof define === 'function' && define.amd) {
    define([], function() { return MegaPixImage; }); // for AMD loader
  } else {
    this.MegaPixImage = MegaPixImage;
  }

})();
