/*  This file is part of Iain Hamiltons Isometric HTML5 App.

    Iain Hamiltons Isometric HTML5 App is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Iain Hamiltons Isometric HTML5 App is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Iain Hamiltons Isometric HTML5 App.  If not, see <http://www.gnu.org/licenses/>. */

function Isometric(ctx, tileWidth, tileHeight, mapLayout, tileImages, tileImagesDictionary) {

  var title = "";

  var zeroIsBlank = false;
  var stackTiles = false;
  var stackTileGraphic = null;
  var drawX = 0;
  var drawY = 0;

  var heightMap = null;
  var lightMap = null;
  var lightX = null;
  var lightY = null;

  var heightOffset = 0;
  var heightShadows = null;
  var shadowSettings = null;

  var shadowDistance = null;

  var heightMapOnTop = false;

  var curZoom = 1;
  var mouseUsed = false;
  var MouseTilePosX = 0;
  var MouseTilePosY = 0;
  var xMouse = 0;
  var yMouse = 0;

  var applyIneractions = false;

  var mouseBehindAlpha =  false;

  var tilesHide = null;
  var hideSettings = null;

  var particleTiles =null;
  var particleMap = [];
  var particleMapHolder = [];


  function _setup(settings) {
      lightMap = settings.lightMap;
      shadowDistance = settings.shadowDistance;
      title = settings.title;
      zeroIsBlank = settings.zeroIsBlank;
      //mouseBehindAlpha = settings.mouseBehindAlpha;
  }

  function _draw(i, j, tileImageOverwite) {

    var xpos, ypos;
    i = Math.floor(i);
    j = Math.floor(j);
    if (i > mapLayout.length - 1) {
      i = mapLayout.length - 1;
    }
    if (j > mapLayout[i].length - 1) {
      j = mapLayout[i].length - 1;
    }
    var resizedTileHeight;
    var stackGraphic = null;
    var image_num = Number(mapLayout[i][j]);
    var distanceLighting = null;
    var distanceLightingSettings;
    if (shadowDistance) {
      distanceLightingSettings = {
        distance: shadowDistance.distance,
        darkness: shadowDistance.darkness,
        color: shadowDistance.color
      };
      distanceLighting = Math.sqrt((Math.floor(i - lightX) * Math.floor(i - lightX)) + (Math.floor(j - lightY) * Math.floor(j - lightY)));
      if (lightMap) {
        var lightDist = 0;
        // Calculate which light source is closest

        lightMap.map(function(light) {
          lightDist = Math.sqrt((Math.floor(i - light[0]) * Math.floor(i - light[0])) + (Math.floor(j - light[1]) * Math.floor(j - light[1])));
          if (distanceLighting + distanceLightingSettings.distance  > lightDist + light[2]) {
            distanceLighting = lightDist;
            distanceLightingSettings.distance = light[2];
            distanceLightingSettings.darkness = light[3];
          }
        });
      }
      if(distanceLighting > distanceLightingSettings.distance){
        distanceLighting = distanceLightingSettings.distance;
      }
      distanceLighting = distanceLighting/(distanceLightingSettings.distance * distanceLightingSettings.darkness);
    }
    if ((!zeroIsBlank) || (zeroIsBlank && image_num) || tileImageOverwite) {
      if (zeroIsBlank) {
        image_num--;
      }
      if(tilesHide && image_num >= hideSettings.hideStart && image_num <= hideSettings.hideEnd) {
        stackGraphic = tileImages[hideSettings.planeGraphic];
      }
      else if(tileImageOverwite) {
        stackGraphic = tileImageOverwite;
      }
      else {
        if (stackTileGraphic) {
          stackGraphic = stackTileGraphic;
        }
        else {
          stackGraphic = tileImages[tileImagesDictionary[image_num]];
        }
      }

      resizedTileHeight = stackGraphic.height / (stackGraphic.width / tileWidth);

      xpos = (i - j) * (tileHeight * curZoom) + drawX;
      ypos = (i + j) * (tileWidth / 4 * curZoom) + drawY;

      if (!stackTiles) {

        // If no heightmap for this tile

        if (!distanceLightingSettings || ( distanceLightingSettings && distanceLighting < distanceLightingSettings.darkness)) {
          if (tileImageOverwite) {

            // Draw the overwriting image insetad of tile

            ctx.drawImage(tileImageOverwite, 0, 0, stackGraphic.width, stackGraphic.height, xpos, (ypos + ((tileHeight - resizedTileHeight) * curZoom)), (tileWidth * curZoom), (resizedTileHeight * curZoom));
          }
          else {

            // Draw the tile image

            ctx.drawImage(stackGraphic, 0, 0, stackGraphic.width, stackGraphic.height, xpos, (ypos + ((tileHeight - resizedTileHeight) * curZoom)), (tileWidth * curZoom), (resizedTileHeight * curZoom));
          }
        }
      }
      else {
        var stack = Math.round(Number(heightMap[i][j]));
        for (var k = 0; k <= stack; k++) {
          ctx.save();
          if (mouseBehindAlpha) {
            if (i == MouseTilePosX + 1 && j == MouseTilePosY + 1) {
              ctx.globalAlpha = 0.3;
            }
          }
          if (heightMapOnTop && k === stack){
            if (!distanceLightingSettings || ( distanceLightingSettings && distanceLighting < distanceLightingSettings.darkness)) {
              if (tileImageOverwite) {


                ctx.drawImage(tileImageOverwite, 0, 0, tileImageOverwite.width, tileImageOverwite.height, xpos, ypos + ((k - 1) *(tileHeight - heightOffset - tileHeight)) * curZoom - (resizedTileHeight  - tileHeight) * curZoom, (tileWidth * curZoom), (resizedTileHeight * curZoom));
              }
              else {
                ctx.drawImage(stackGraphic, 0, 0, stackGraphic.width, stackGraphic.height, xpos, ypos + ((k - 1) *(tileHeight - heightOffset - tileHeight)) * curZoom - (resizedTileHeight  - tileHeight) * curZoom, (tileWidth * curZoom), (resizedTileHeight * curZoom));
              }
            }
          }
          else if(!heightMapOnTop) {
            if (!distanceLightingSettings || ( distanceLightingSettings && distanceLighting < distanceLightingSettings.darkness)) {
              if (tileImageOverwite) {
                ctx.drawImage(tileImageOverwite, 0, 0, tileImageOverwite.width, tileImageOverwite.height, xpos, ypos + (k * ((tileHeight - heightOffset - resizedTileHeight) * curZoom)), (tileWidth * curZoom), (resizedTileHeight * curZoom));
              }
              else{
                if (stackTileGraphic) {
                  if (k !== stack) {
                    ctx.drawImage(stackGraphic, 0, 0, stackGraphic.width, stackGraphic.height, xpos, ypos + (k * ((tileHeight - heightOffset - resizedTileHeight) * curZoom)), (tileWidth * curZoom), (resizedTileHeight * curZoom));
                  } 
                  else {
                    stackGraphic = tileImages[tileImagesDictionary[image_num]];
                    //resizedTileHeight = stackGraphic.height / (stackGraphic.width / tileWidth);
                    ctx.drawImage(stackGraphic, 0, 0, stackGraphic.width, stackGraphic.height, xpos, ypos + ((k - 1) * ((tileHeight - heightOffset - resizedTileHeight) * curZoom)), (tileWidth * curZoom), (stackGraphic.height / (stackGraphic.width / tileWidth) * curZoom));
                  }
                }
                else {
                  ctx.drawImage(stackGraphic, 0, 0, stackGraphic.width, stackGraphic.height, xpos, ypos + (k * ((tileHeight - heightOffset - resizedTileHeight) * curZoom)), (tileWidth * curZoom), (resizedTileHeight * curZoom));
                }
              }
            }
          }
          ctx.restore();
        }
        if (distanceLightingSettings) {
          if (distanceLightingSettings.color !== false) {
          -- k;
           if ( distanceLighting < distanceLightingSettings.darkness) {

              // Apply distane shadows from light source

              ctx.save();
              //ctx.globalCompositeOperation = 'source-atop';
              ctx.fillStyle = 'rgba(' + distanceLightingSettings.color + ',' + distanceLighting + ')';
              ctx.beginPath();
              ctx.moveTo(xpos - 2, ypos - 1 + ((k - 1) * ((tileHeight - resizedTileHeight) * curZoom)) + (tileHeight * curZoom) / 2);
              ctx.lineTo(xpos - 1 + (tileHeight * curZoom), ypos - 2 + ((k - 1) * ((tileHeight - resizedTileHeight) * curZoom)));
              ctx.lineTo(xpos + 2 + (tileHeight * curZoom) * 2, ypos - 1 + ((k - 1) * ((tileHeight - resizedTileHeight) * curZoom)) + (tileHeight * curZoom) / 2);
              ctx.lineTo(xpos + 1 + (tileHeight * curZoom), ypos + 2 + ((k - 1) * ((tileHeight - resizedTileHeight) * curZoom)) + (tileHeight * curZoom));
              ctx.fill();
              ctx.restore();
            }
          }
        }
        if (mouseUsed) {
          if (i == MouseTilePosX && j == MouseTilePosY) {

            // Apply mouse over tile coloring

            ctx.fillStyle = 'rgba(255, 255, 120, 0.7)';
            ctx.beginPath();
            ctx.moveTo(xpos, ypos + (k * ((tileHeight - resizedTileHeight) * curZoom)) + (tileHeight * curZoom) / 2);
            ctx.lineTo(xpos + (tileHeight * curZoom), ypos + (k * ((tileHeight - resizedTileHeight) * curZoom)));
            ctx.lineTo(xpos + (tileHeight * curZoom) * 2, ypos + (k * ((tileHeight - resizedTileHeight) * curZoom)) + (tileHeight * curZoom) / 2);
            ctx.lineTo(xpos + (tileHeight * curZoom), ypos + (k * ((tileHeight - resizedTileHeight) * curZoom)) + (tileHeight * curZoom));
            ctx.fill();
          }
        }
      }
    }

    if (particleTiles) {

      // Draw Particles
      if (!distanceLightingSettings || ( distanceLightingSettings && distanceLighting < distanceLightingSettings.darkness)) {
        if (Number(particleMap[i][j]) !== 0) {
          if (!particleMapHolder[i]) {
            particleMapHolder[i] = [];
          }
          if (!particleMapHolder[i][j]) {
            particleMapHolder[i][j] = new EffectLoader.Get(particleMap[i][j], ctx, new Range(0, 800), new Range(0, 600));
          }
          particleMapHolder[i][j].Draw(xpos, ypos + ((k - 1) *(tileHeight - heightOffset - tileHeight)) * curZoom - (resizedTileHeight  - tileHeight) * curZoom, (tileWidth * curZoom));
        }
      }
    }

    if (heightShadows) {
      var nextStack = 0;
      var currStack = 0;
      var shadowXpos = 0;
      var shadowYpos = 0;

      if (heightMap) {
        nextStack = Math.round(Number(heightMap[i][j - 1]));
        currStack = Math.floor(Number(heightMap[i][j]));
        if (currStack < nextStack) {
          shadowXpos = (i - j) * (tileHeight * curZoom) + drawX;
          shadowYpos = (i + j) * (tileWidth / 4 * curZoom) + drawY;
          if (shadowSettings.verticalColor) {

            // Apply Vertical shadow created from stacked tiles

            if (!distanceLightingSettings  || (distanceLighting < distanceLightingSettings.darkness)) {
              ctx.fillStyle = shadowSettings.verticalColor;
              ctx.beginPath();
              ctx.moveTo(shadowXpos, shadowYpos + ((currStack - 1) * ((tileHeight - resizedTileHeight) * curZoom)) + (tileHeight * curZoom) / 2);
              ctx.lineTo(shadowXpos + (tileHeight * curZoom), shadowYpos + ((currStack - 1) * ((tileHeight - resizedTileHeight) * curZoom)));
              ctx.lineTo(shadowXpos + (tileHeight * curZoom) * 2, shadowYpos + ((currStack - 1) * ((tileHeight - resizedTileHeight) * curZoom)) + (tileHeight * curZoom) / 2);
              ctx.lineTo(shadowXpos + (tileHeight * curZoom), shadowYpos + ((currStack - 1) * ((tileHeight - resizedTileHeight) * curZoom)) + (tileHeight * curZoom));
              ctx.fill();
            }
          }
          if (shadowSettings.horizontalColor) {

            // Apply Horizontal shadows on stacked tiles

            if (!distanceLightingSettings  || (distanceLighting < distanceLightingSettings.darkness)) {
              ctx.fillStyle = shadowSettings.horizontalColor;
              ctx.beginPath();
              ctx.moveTo(shadowXpos + (tileHeight * curZoom), shadowYpos + ((currStack - 1) * ((tileHeight - resizedTileHeight) * curZoom)));
              ctx.lineTo(shadowXpos + (tileHeight * curZoom), shadowYpos - ((nextStack - 1) * ((tileHeight - shadowSettings.offset) / ((tileHeight - shadowSettings.offset) / shadowSettings.offset)  * curZoom)));
              ctx.lineTo(shadowXpos + (tileHeight * curZoom) * 2, shadowYpos - ((nextStack - 1) * (tileHeight - shadowSettings.offset) / ((tileHeight - shadowSettings.offset) / shadowSettings.offset) * curZoom) + (tileHeight * curZoom) / 2);
              ctx.lineTo(shadowXpos + (tileHeight * curZoom) * 2, shadowYpos + ((currStack - 1) * ((tileHeight - resizedTileHeight) * curZoom)) + (tileHeight * curZoom) / 2);
              ctx.fill();
            }
          }
        }
      }
      else {

        // Shadows without height map e.g. Object Shadows

        currStack = Math.floor(Number(mapLayout[i][j - 1]));
        if(currStack > 0) {
          shadowXpos = (i - j) * (tileHeight * curZoom) + drawX;
          shadowYpos = (i + j) * (tileWidth / 4 * curZoom) + drawY;
          ctx.fillStyle = shadowSettings.verticalColor;
          ctx.beginPath();
          ctx.moveTo(shadowXpos, shadowYpos + (currStack * ((tileHeight - resizedTileHeight) * curZoom)) + (tileHeight * curZoom) / 2);
          ctx.lineTo(shadowXpos + (tileHeight * curZoom), shadowYpos + (currStack * ((tileHeight - resizedTileHeight) * curZoom)));
          ctx.lineTo(shadowXpos + (tileHeight * curZoom) * 2, shadowYpos + (currStack * ((tileHeight - resizedTileHeight) * curZoom)) + (tileHeight * curZoom) / 2);
          ctx.lineTo(shadowXpos + (tileHeight * curZoom), shadowYpos + (currStack * ((tileHeight - resizedTileHeight) * curZoom)) + (tileHeight * curZoom));
          ctx.fill();
        }
      }
    }
  }

  function _stackTiles(settings) {
    stackTiles = true;
    stackTileGraphic = settings.heightTile;
    heightMap = settings.map;
    heightOffset = settings.offset;
    heightMapOnTop = settings.heightMapOnTop || false;
  }

  function _particleTiles(map) {
    particleTiles = true;
    particleMap = map;
  }

  function _setLight(posX, posY) {
    lightX = posX;
    lightY = posY;
  }

  function _getLayout() {
    return mapLayout;
  }

  function _getHeightLayout() {
    return heightMap;
  }

  function _getTile(posX, posY) {
    return mapLayout[posX][posY];
  }

  function _setZoom(dir) {
    if (Number(dir)) {
      curZoom = dir;
    }
    else if (dir == "in") {
      if (curZoom < 1) {
        curZoom += 0.1;
      }
    }else if (dir == "out") {
      if (curZoom > 0.2) {
        curZoom -= 0.1;
      }
    }
  }

  function _applyMouse(x, y) {
    var coords = {};
    mouseUsed = true;
    xMouse = x;
    yMouse = y;
    MouseTilePosY = (2 * (y - drawY) - x + drawX) / 2;
    MouseTilePosX = x + MouseTilePosY - drawX - (tileHeight * curZoom);
    MouseTilePosY = Math.round(MouseTilePosY / (tileHeight * curZoom));
    MouseTilePosX = Math.round(MouseTilePosX / (tileHeight * curZoom));
    coords.x = MouseTilePosX;
    coords.y = MouseTilePosY;
    return(coords);
  }

  function _applyMouseClick(x, y) {
     mapLayout[x][y] = 47;
    //heightMap[x][y] = Number(heightMap[x][y]) + 1;
  }

  function _align(position, screen_dimension, size, offset) {
    switch(position) {
      case "h-center":
        drawX = ((screen_dimension / 2) - (tileWidth * (size-1) )/(tileHeight/4)* curZoom) - offset;
      break;
      case "v-center":
        drawY = ((screen_dimension / 2) - (tileHeight * (size-1) * curZoom) / 2) - offset;
      break;
    }
  }

  function _hideGraphics(toggle, settings) {
    tilesHide = toggle;
    if (settings) {
      hideSettings = settings;
    }
  }

  function _applyHeightShadow(toggle, settings) {
    if (toggle) {
      if(settings || shadowSettings) {
        heightShadows = true;
      }
    }
    else{
      if(settings || shadowSettings) {
        heightShadows = false;
      }
    }
    if (settings) {
      shadowSettings = settings;
    }
  }

  function _rotate(setting) {
    var tempArray = [];
    var tempLine = [];
    var tempArrayTwo = [];
    var tempLineTwo = [];
    var tempArrayThree =[];
    var tempLineThree = [];
    var i,j ;
    if (setting == "left") {
      for (i = 0; i < mapLayout.length; i++) {
        for (j = mapLayout[i].length - 1; j >= 0; j--) {
          tempLine.push(mapLayout[j][i]);
          if (stackTiles) {
            tempLineTwo.push(heightMap[j][i]);
          }
          if (particleTiles) {
            tempLineThree.push(particleMap[j][i]);
          }
        }
        tempArray.push(tempLine);
        tempLine = [];
        if (stackTiles) {
          tempArrayTwo.push(tempLineTwo);
          tempLineTwo = [];
        }
        if (particleTiles) {
          tempArrayThree.push(tempLineThree);
          tempLineThree = [];
        }
      }
      if (stackTiles) {
        heightMap = tempArrayTwo;
      }
      if (particleTiles) {
        heightMap = tempArrayThree;
      }
      mapLayout = tempArray;
    }
    else if (setting == "right") {
      for (i = mapLayout.length -1; i >= 0; i--) {
        for (j = 0; j < mapLayout.length; j++) {
          tempLine.push(mapLayout[j][i]);
          if (stackTiles) {
            tempLineTwo.push(heightMap[j][i]);
          }
          if (particleTiles) {
            tempLineThree.push(particleMap[j][i]);
          }
        }
        tempArray.push(tempLine);
        tempLine = [];
        if (stackTiles) {
          tempArrayTwo.push(tempLineTwo);
          tempLineTwo = [];
        }
        if (particleTiles) {
          tempArrayThree.push(tempLineThree);
          tempLineThree = [];
        }
      }
      if (stackTiles) {
        heightMap = tempArrayTwo;
      }
      if (particleTiles) {
        heightMap = tempArrayThree;
      }
      mapLayout = tempArray;
    }
  }


  return {

    setupProperties: function(settings) {
      return _setup(settings);
    },

    draw: function(tileX, tileY, tileImageOverwite) {
      return _draw(tileX, tileY, tileImageOverwite);
    },

    stackTiles: function(settings) {
      return _stackTiles(settings);
    },

    particleTiles: function(map) {
      return _particleTiles(map);
    },

    getLayout: function() {
      return _getLayout();
    },

    getHeightLayout: function() {
      return _getHeightLayout();
    },

    getTitle: function() {
      return title;
    },

    getTile: function(tileX, tileY) {
      return _getTile(tileX, tileY);
    },

    setZoom: function(direction) {
      // in || out
      return _setZoom(direction);
    },

    setLight: function(tileX, tileY) {
      return _setLight(tileX, tileY);
    },

    applyMouse: function(tileX, tileY) {
      return _applyMouse(tileX, tileY);
    },

    applyMouseClick: function(tileX, tileY) {
      return _applyMouseClick(tileX, tileY);
    },

    align: function(position, screen_dimension, size, offset) {
      return _align(position, screen_dimension, size, offset);
    },

    hideGraphics: function(toggle, settings) {
      return _hideGraphics(toggle, settings);
    },

    applyHeightShadow: function(toggle, settings) {
      return _applyHeightShadow(toggle, settings);
    },

    rotate: function(direction) {
      // left || right
      return _rotate(direction);
    },

    toggleGraphicsHide: function(toggle) {
      if (tilesHide !== null) {
        _hideGraphics(toggle);
      }
    },

    toggleHeightShadow: function(toggle) {
      if (heightShadows !== null) {
        _applyHeightShadow(toggle);
      }
    },

    move: function(direction) {
      // left || right || up || down
      if (direction === "up") {
        drawY += tileHeight/2 * curZoom;
        drawX += tileHeight * curZoom;
      }
      else if (direction === "down") {
        drawY += tileHeight/2 * curZoom;
        drawX -= tileHeight * curZoom;
      }
      else if (direction === "left") {
        drawY -= tileHeight/2 * curZoom;
        drawX -= tileHeight * curZoom;
      }
      else if (direction === "right") {
        drawY -= tileHeight/2 * curZoom;
        drawX += tileHeight * curZoom;
      }


    }

  };


}