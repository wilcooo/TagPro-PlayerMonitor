// ==UserScript==
// @name          TagPro Player Monitor
// @version       2.2
// @author        bash# ; Ko
// @namespace     http://www.reddit.com/user/bash_tp/
// @description   Shows an on-screen list of players in the game and their current status
// @include       http://tagpro-*.koalabeast.com:*
// @include       http://tangent.jukejuice.com:*
// @include       http://*.newcompte.fr:*
// @downloadURL   https://github.com/wilcooo/TagPro-PlayerMonitor/raw/master/tppm.user.js
// @supportURL    https://www.reddit.com/message/compose/?to=Wilcooo
// @website       https://redd.it/6pe5e9
// @license       MIT
// ==/UserScript==




////////////////////////////////////////////////////////////////////////////////////////////
//     ### --- OPTIONS --- ###                                                            //
////////////////////////////////////////////////////////////////////////////////////////  //
                                                                                      //  //
// When set to true, the regular 'taken-flag-indicators' are hidden.                  //  //
// This script shows who has the flag, so with this option double info is hidden.     //  //
var hide_flagTaken = true;                                                            //  //
                                                                                      //  //
// Position; where to put the Player Monitor. You have these 11 choices:              //  //
//    'top-left';  'top-mid';  'top-right';    'top-split';                           //  //
//    'mid-left';              'mid-right';    'mid-split';                           //  //
//    'bot-left';  'bot-mid';  'bot-right';    'bot-split';                           //  //
// Make sure to not make any typos!                                                   //  //
var position = 'bot-mid';                                                             //  //
                                                                                      //  //
// Order; in what order to put the teammembers? Choose between:                       //  //
//    'constant';    When you don't want the balls to change position                 //  //
//    'score';       The same order as on the scoreboard                              //  //
var order = 'constant';                                                               //  //
                                                                                      //  //
// If you dare, you can edit the constants below to manipulate this script even more. //  //
                                                                                      //  //
////////////////////////////////////////////////////////////////////////////////////////  //
//                                                     ### --- END OF OPTIONS --- ###     //
////////////////////////////////////////////////////////////////////////////////////////////







//////////////////////////////////////
// SCROLL FURTHER AT YOUR OWN RISK! //
//////////////////////////////////////





var short_name = 'monitor';            // An alphabetic (no spaces/numbers) distinctive name for the script.
var version = GM_info.script.version;  // The version number is automatically fetched from the metadata.
tagpro.ready(function(){ if (!tagpro.scripts) tagpro.scripts = {}; tagpro.scripts[short_name]={version:version};});
console.log('START: ' + GM_info.script.name + ' (v' + version + ' by ' + GM_info.script.author + ')');



// CONSTANTS

const size        = 16;     // Size of a ball icon
const space       = 18;     // Vertical space per name+icon
const textVshift  = 0;      // relative vertical shift of text
const textHLshift = -2;     // relative horizontal shift of text on the left of a ball
const textHRshift = 25;     // relative horizontal shift of text on the right of a ball

const flag_size = size;     // size of the flag icon next to an FC
const flag_x    = 10;       // Position of the flag, relative to the ball
const flag_y    = 0;

const grip_size = 10;       // size of the Juke Juice icon
const grip_x    = -1;       // relative position
const grip_y    = 8;

const speed_size  = 10;     // size of the Top Speed icon (a deprecated TagPro powerup)
const speed_x     = -1;     // relative position
const speed_y     = -3;

const tagpro_color = 0x00FF00;  // Color of the (usually green) TagPro powerup circle
const tagpro_thick = 1.5;        // Thickness of that circle

// Tip, use : https://www.google.com/search?q=pick+color

const bomb_color = 0xFFFF00;    // Color of the flashing RollingBomb

const style =     // The style of the text (1: red, 2: blue)
      {
          1: {
              fontSize:        "8pt",
              fontWeight:      "bold",
              strokeThickness: 3,
              fill:            0xFFB5BD,       // text-color (Tip: https://www.google.com/search?q=pick+color)
          },
          2: {
              fontSize:        "8pt",
              fontWeight:      "bold",
              strokeThickness: 3,
              fill:            0xCFCFFF,
          },
      };

const presets = {    // 1: red team ,  2: blue team
    'top-left' : {
        1 : {  x:10, y:10,  },
        2 : {  x:10, y:10 + 4.5*space,  },
    },
    'mid-left' : {
        1 : {  x:10, y:-0.25*space, anchor : {x:0, y:0.5}, bottomToTop: true,  },
        2 : {  x:10, y: 0.25*space, anchor : {x:0, y:0.5},  },
    },
    'bot-left' : {
        1 : {  x:10, y:-10 - 5.5*space, anchor : {x:0, y:1}, bottomToTop: true,  },
        2 : {  x:10, y:-10 - space,     anchor : {x:0, y:1}, bottomToTop: true,  },
    },
    'top-mid' : {
        1 : {  x:-25, y:10, anchor : {x:0.5, y:0}, leftText: true,  },
        2 : {  x:5,   y:10, anchor : {x:0.5, y:0},  },
    },
    'bot-mid' : {
        1 : {  x:-135, y:-10 - space, anchor : {x:0.5, y:1}, bottomToTop: true, leftText: true,  },
        2 : {  x: 115, y:-10 - space, anchor : {x:0.5, y:1}, bottomToTop: true,  },
    },
    'top-right' : {
        1 : {  x:-30, y:10,             anchor : {x:1, y:0}, leftText: true,  },
        2 : {  x:-30, y:10 + 4.5*space, anchor : {x:1, y:0}, leftText: true,  },
    },
    'mid-rigth' : {
        1 : {  x:-30, y:-0.25*space, anchor : {x:1, y:0.5}, bottomToTop: true, leftText: true,  },
        2 : {  x:-30, y: 0.25*space, anchor : {x:1, y:0.5},                    leftText: true,  },
    },
    'bot-right' : {
        1 : {  x:-30, y:-10 - 5.5*space, anchor : {x:1, y:1}, bottomToTop: true, leftText: true,  },
        2 : {  x:-30, y:-10 - space,     anchor : {x:1, y:1}, bottomToTop: true, leftText: true,  },
    },
    'top-split' : {
        1 : {  x:10,  y:10,  },
        2 : {  x:-30, y:10, anchor : {x:1, y:0}, leftText: true, },
    },
    'mid-split' : {
        1 : {  x:10,  y:-2*space, anchor : {x:0, y:0.5},  },
        2 : {  x:-30, y:-2*space, anchor : {x:1, y:0.5}, leftText: true,  },
    },
    'bot-split' : {
        1 : {  x:10,  y:-10 - space, anchor : {x:0, y:1}, bottomToTop: true,  },
        2 : {  x:-30, y:-10 - space, anchor : {x:1, y:1}, bottomToTop: true, leftText: true,  },
    },
    'your-preset' : {             // A preset to experiment with!
        1 : {  x:0, y:0,  },
        2 : {  x:0, y:0,  },
    },
};

// EXPLANATION OF THE PRESETS:
//   'x' and 'y' form the position of the player monitor
//   'anchor' is the reference point from which the 'x' and 'y' above are calculated.
//     anchors 'x' and 'y' are position of the reference point, relative to the viewport size. (so 0.5 is in the middle of the screen)
//
//   The position described above is the position of the first ball in the player monitor.
//     The next balls are usually drawn below it, but when 'bottomToTop' is true, they are drawn above the first one.
//
//   'leftText' makes the name of the ball appear on the left side of the ball.
//
//   You may add a preset to the list, and select it in the options in the top of this script.





const preset = presets[position] || presets["bot-mid"];   // If no valid preset is chosen, fallback to 'bot-mid'

const flagsprite =
      {
          1: "red",      // Note: 'flag' or 'potato' gets added to this later in this script
          2: "blue",
          3: "yellow",
      };
const ballsprite =
      {
          1: "redball",
          2: "blueball",
      };




tagpro.ready(function () {




    // Hide the flagTaken indicators

    if (hide_flagTaken)
        tagpro.renderer.updateFlagsFromPlayer = function() {};


    function getPlayer(player) {

        return {
            name:   player.name,
            flag:   player.flag,
            dead:   player.dead,
            bomb:   player.bomb,
            tagpro: player.tagpro,
            grip:   player.grip,
            //speed:  player.speed,
            team:   player.team,
            id:     player.id,
        };
    }



    // This function gets all players on a team

    function getPlayers(team) {

        var players = [];

        for (var playerId in tagpro.players) {

            if (!tagpro.players.hasOwnProperty(playerId)) continue;

            var player = tagpro.players[playerId];

            if (player.team != team)    continue;

            players.push(getPlayer(player));
        }

        return players;
    }





    // Create PIXI containers for both player lists

    var redList = new PIXI.Container();
    tagpro.renderer.layers.ui.addChild(redList);

    var blueList = new PIXI.Container();
    tagpro.renderer.layers.ui.addChild(blueList);

    var teamLists =
        {
            1: redList,
            2: blueList,
        };

    tagpro.ui.sprites.redPlayerMonitor = redList;
    tagpro.ui.sprites.bluePlayerMonitor = blueList;


    // This function gets called when the browser window resizes
    // It moves the playerlists to the right location

    var org_alignUI = tagpro.ui.alignUI;
    tagpro.ui.alignUI = function() {
        redList.x = ( preset[1].anchor ? (tagpro.renderer.vpWidth * preset[1].anchor.x) : 0 ) + preset[1].x;
        redList.y = ( preset[1].anchor ? (tagpro.renderer.vpHeight * preset[1].anchor.y) : 0 ) + preset[1].y;
        blueList.x = ( preset[2].anchor ? (tagpro.renderer.vpWidth * preset[2].anchor.x) : 0 ) + preset[2].x;
        blueList.y = ( preset[2].anchor ? (tagpro.renderer.vpHeight * preset[2].anchor.y) : 0 ) + preset[2].y;
        org_alignUI();
    };

    tagpro.ui.alignUI();





    // The rolling_bomb graphics are stored here, so that they can be updated (animation)
    var rolling_bombs = {};
    var org_UIupdate = tagpro.ui.update;
    tagpro.ui.update = function () {
        org_UIupdate();
        for (var b in rolling_bombs) {
            rolling_bombs[b].alpha = (tagpro.players[b].dead ? 0.375 : 0.75)*Math.abs(Math.sin(performance.now() / 150));
        }
    };


    // Update a single player

    function drawPlayer(player) {

        if (typeof player.monitor === 'undefined') {
            player.monitor = new PIXI.Container();
        }

        player.monitor.removeChildren();

        // Draw ball
        tagpro.tiles.draw(player.monitor, ballsprite[player.team], { x: 0, y: 0 }, size, size, player.dead ? 0.5 : 1);

        // Draw bomb (rolling bomb)
        if (player.bomb) {
            var bomb = new PIXI.Graphics();
            bomb.beginFill(bomb_color, (player.dead ? 0.375 : 0.75)*Math.abs(Math.sin(performance.now() / 150)) );
            bomb.drawCircle(size/2, size/2, size/2);

            player.monitor.addChild(bomb);

            rolling_bombs[player.id] = bomb;
        } else delete rolling_bombs[player.id];

        // Draw tagpro
        if (player.tagpro) {
            var tp = new PIXI.Graphics();
            tp.lineStyle(tagpro_thick, tagpro_color, player.dead ? 0.5 : 1 );
            tp.drawCircle(size/2, size/2, size/2);

            player.monitor.addChild(tp);
        }

        // Draw grip (juke juice)
        if (player.grip) {
            tagpro.tiles.draw(player.monitor, 'grip' , { x: grip_x, y: grip_y }, grip_size, grip_size, player.dead ? 0.5 : 1);
        }

        // Draw speed (a deprecated powerup)
        //if (player.speed) {
        //    tagpro.tiles.draw(player.monitor, 'speed' , { x: speed_x, y: speed_y }, speed_size, speed_size, player.dead ? 0.5 : 1);
        //}

        // Draw flag/potato
        if (player.flag && !player.dead) {
            tagpro.tiles.draw(player.monitor, flagsprite[player.flag]+(player.potatoFlag ? 'potato':'flag') , { x: flag_x, y: flag_y }, flag_size, flag_size);
        }

        // Draw name
        var name = new PIXI.Text(player.name, style[player.team]);

        if (preset[player.team].leftText)   name.x = textHLshift - name.width;
        else                                name.x = textHRshift;

        name.y     = textVshift;
        name.alpha = player.dead ? 0.5 : 1;

        player.monitor.addChild(name);

    }






    // Update either the red or blue list

    function orderTeamList(team) {

        var teamList = teamLists[team];

        teamList.removeChildren();

        var teamPlayers = [];

        for (var i in tagpro.players) {

            var player = tagpro.players[i];

            if (player.team != team)    continue;

            if (!player.monitor) {
                drawPlayer(player);
            }

            teamPlayers.push(player);
        }

        var sign = 2 * Boolean(preset[team].bottomToTop) - 1;

        switch (order) {
            case 'score':
                teamPlayers.sort( function(p1,p2) { return sign * p1.score - sign * p2.score; });
                // This sorts the teamPlayers list based on the .score of every player
                break;
            default:
                // When something else, or 'constant' is chosen, the order of player id's is conserved
                // which is the order that they joined the game.
        }

        var count = 0;

        for (var p in teamPlayers) {
            teamList.addChild(teamPlayers[p].monitor);
            teamPlayers[p].monitor.y = - sign * space * (count++);
        }

    }





    tagpro.socket.on("p", function(data) {

        if (data instanceof Array) {
            var player = tagpro.players[data[0].id];
            drawPlayer(player);
            orderTeamList(player.team);
            return;
        }

        for (var p in data.u) {
            var player = tagpro.players[data.u[p].id];
            var old_json = player.json;
            player.json = JSON.stringify(getPlayer(player));
            if (player.json != old_json) {
                drawPlayer(player);
            }
        }

    });

    tagpro.socket.on("playerLeft", function(data) {
        var player = tagpro.players[data];
        delete player.monitor;
        orderTeamList(player.team);
    });

    setInterval(function() {orderTeamList(1); orderTeamList(2);}, 3000);

});
