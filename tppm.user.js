// ==UserScript==
// @name          TagPro Player Monitor
// @version       2.4
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
//    'alphabetic';  Alphabetic order                                                 //  //
// Don't worry, the list will only update every 3 seconds (by default)                //  //
var order = 'constant';                                                               //  //
                                                                                      //  //
// Whether to show if someone is honking.                                             //  //
//   This function requires the Honk script.                                          //  //
var show_honk = true;                                                                 //  //
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

const show_ball = true;     // Whether to show the ball icon
                            //   (if you disable this, you might want to disable show_grip, show_speed, show_tagpro, show_bomb)
const show_dead = true;     // Whether to fade the ball when its dead/spawning
const show_name = true;     // Shows the playernames next to the corresponding balls (recommended)

const show_flag = true;     // Show a flag next to players with a flag
const flag_size = size;     // size of the flag icon next to an FC
const flag_x    = 10;       // Position of the flag, relative to the ball
const flag_y    = 0;

const show_grip = true;     // Show a JJ pup on balls with Juke Juice
const grip_size = 10;       // size of the Juke Juice icon
const grip_x    = -1;       // relative position
const grip_y    = 8;

const show_speed  = false;  // This won't work unless they put the topspeed pup back in the game (and even then probably not)
const speed_size  = 10;     // size of the Top Speed icon (a deprecated TagPro powerup)
const speed_x     = -1;     // relative position
const speed_y     = -3;

const show_tagpro = true;       // Show a green circle on balls with a TP
const tagpro_color = 0x00FF00;  // Color of the (usually green) TagPro powerup circle
const tagpro_thick = 1.5;       // Thickness of that circle

// Tip, use : https://www.google.com/search?q=pick+color

const show_bomb = true;         // Flash balls with a Rolling Bomb
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

const honksprite = PIXI.Texture.fromImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTZEaa/1AAACiUlEQVR4Xu3bMa7bQAwG4RwkZe5/s5zBiYoAgjFFJJPL1fgvPjxgDAjksn4/Xq/XV/n989ffP/ybEUar47j/vP9mhdEqB5bLgeVyYLkcWC4HlsuB5XJguRxYLgeWy4HlcmC5HFguB5bLgW940qM9ZdbKOTFecR6mYqBOT5jzPGPFnBiveB+oYqguu894nq9qToxXdQzWYef5zrNVzojxjq4Bq+041/u7Vc6I8a7OQa263wzjJ7oHNlnxVhg/tWLwp1v1RhgrrFrgiVa+DcYqKxd5itVvgrHS6oV2NvEWGKtNLLabqTfA2GFqwR1M7o6xy+SiU6Z3xthpctkJ0/ti7Da58GrTu2IMD4zhgTE8MIYHxvDAGB4YwwNjeGAMD4zhgTE8MIYHxvDAGB4YwwNjeGAMD4zhgTE8MIYHxvDAGB4YwwNjeGAMD4zhgTHmnP/V5VPH91o+GvfQe36q5aPvg8f/o/e86/hey0djHxjDA2N4YAwPjOGBMTwwhgfG8MAYHhjDA2N4YAwPjOGBMTwwhgfG8MAYHhjDA2N4YAwPjOGBMTwwhgfG8MAYHhjDA2N4YOz2Tf/qMr0rxk7nhaeWXml6X4xd3pedWHi16Z0xdphedNLk7hirTS64i6k3wFhparEdTbwFxioTC+1u9ZtgrLB6kSdZ+TYYP7Vygada9UYYP7FqcIMVb4XxrhUD23S/GcY7ugetsONMh/d3q5wT41WdA1bZebbDeb7KOTFe0TVYtd3nO5xnrJoV4xXVA3V5woyH85wVs2K8onKYTk+Z81A5K0ajykd7EoxGObBcDiyXA8vlwHI5sFwOLJcDy+XAcjmwXA4slwPL5cByObBcDvwFvu24r9frxx9ThG6n1YCdggAAAABJRU5ErkJggg==");

const refresh_rate = 3e3;   // An interval (milliseconds), after which the order of the playerlists gets updated.

tagpro.ready(function () {




    // Hide the flagTaken indicators

    if (hide_flagTaken)
        tagpro.renderer.updateFlagsFromPlayer = function() {};


    function getPlayer(player) {

        var state = {
            team: player.team,
            id:   player.id,
        };

        if (show_name)   state.name      = player.name;
        if (show_dead)   state.dead      = player.dead;
        if (show_flag)   state.flag      = player.flag;
        if (show_bomb)   state.bomb      = player.bomb;
        if (show_tagpro) state.tagpro    = player.tagpro;
        if (show_grip)   state.grip      = player.grip;
        if (show_speed)  state.speed     = player.speed;
        if (show_honk)   state.isHonking = player.isHonking;

        return state;
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





    // The rolling_bomb graphics are stored here, so that they can be updated (animated)
    if (show_bomb) {
        var rolling_bombs = {};

        // Rewriting the TagPro's ui.update function to include the rendering of the RBs 
        var org_UIupdate = tagpro.ui.update;
        tagpro.ui.update = function () {
            org_UIupdate();
            for (var b in rolling_bombs) {
                rolling_bombs[b].alpha = (tagpro.players[b].dead ? 0.375 : 0.75)*Math.abs(Math.sin(performance.now() / 150));
            }
        };
    }


    // Update a single player

    function drawPlayer(player) {

        if (typeof player.monitor === 'undefined') {
            player.monitor = new PIXI.Container();
        }

        player.monitor.removeChildren();

        // Draw ball
        if (show_ball) tagpro.tiles.draw(player.monitor, ballsprite[player.team], { x: 0, y: 0 }, size, size, player.dead ? 0.5 : 1);

        // Draw bomb (rolling bomb)
        if (show_bomb && player.bomb) {
            var bomb = new PIXI.Graphics();
            bomb.beginFill(bomb_color, (player.dead ? 0.375 : 0.75)*Math.abs(Math.sin(performance.now() / 150)) );
            bomb.drawCircle(size/2, size/2, size/2);

            player.monitor.addChild(bomb);

            rolling_bombs[player.id] = bomb;
        } else if (show_bomb) delete rolling_bombs[player.id];

        // Draw tagpro
        if (show_tagpro && player.tagpro) {
            var tp = new PIXI.Graphics();
            tp.lineStyle(tagpro_thick, tagpro_color, player.dead ? 0.5 : 1 );
            tp.drawCircle(size/2, size/2, size/2);

            player.monitor.addChild(tp);
        }

        // Draw honk
        if (show_honk && player.isHonking) {
            var honk = new PIXI.Sprite(honksprite);
            honk.width  = honksprite.width  * (size/40);
            honk.height = honksprite.height * (size/40);
            honk.x = ( -honk.width  + size ) / 2;
            honk.y = ( -honk.height + size ) / 2;

            player.monitor.addChild(honk);
        }

        // Draw grip (juke juice)
        if (show_grip && player.grip) {
            tagpro.tiles.draw(player.monitor, 'grip' , { x: grip_x, y: grip_y }, grip_size, grip_size, player.dead ? 0.5 : 1);
        }

        // Draw speed (a deprecated powerup)
        if (show_speed && player.speed) {
            tagpro.tiles.draw(player.monitor, 'speed' , { x: speed_x, y: speed_y }, speed_size, speed_size, player.dead ? 0.5 : 1);
        }

        // Draw flag/potato
        if (show_flag && player.flag && !player.dead) {
            tagpro.tiles.draw(player.monitor, flagsprite[player.flag]+(player.potatoFlag ? 'potato':'flag') , { x: flag_x, y: flag_y }, flag_size, flag_size);
        }

        // Draw name
        if (show_name) {
            var name = new PIXI.Text(player.name, style[player.team]);

            if (preset[player.team].leftText)   name.x = textHLshift - name.width;
            else                                name.x = textHRshift;

            name.y     = textVshift;
            name.alpha = (show_dead && player.dead) ? 0.5 : 1;

            player.monitor.addChild(name);
        }

    }






    // Update either the red or blue list

    function orderTeamList(team) {

        var teamList = teamLists[team];

        teamList.removeChildren();

        var teamPlayers = [];

        for (let p in tagpro.players) {

            var player = tagpro.players[p];

            if (player.team != team)    continue;

            if (!player.monitor) {
                drawPlayer(player);
            }

            teamPlayers.push(player);
        }

        var sign = -2 * Boolean(preset[team].bottomToTop) + 1;
        // sign ==  1 if the list renders downward
        // sign == -1 if the list renders upward (bottomToTop = true)

        switch (order) {
            case 'score':
                teamPlayers.sort( (p1,p2) => sign * ( p2.score - p1.score ) );
                // This sorts the teamPlayers list based on the .score of every player (desc.)
                break;
            case 'alphabetic':
                teamPlayers.sort( (p1,p2) => sign * ( p1.name.toLowerCase() > p2.name.toLowerCase() || -(p1.name.toLowerCase() < p2.name.toLowerCase()) ) );
                // This sorts the teamPlayers list based on the .score of every player (asc.)
                break;
            default:
                // When something else, or 'constant' is chosen, the order of player id's is conserved
                // which is the order that they joined the game.
        }

        var count = 0;

        for (let player of teamPlayers) {
            teamList.addChild(player.monitor);
            player.monitor.y = sign * space * (count++);
        }

    }





    tagpro.socket.on("p", function(data) {

        if (data instanceof Array) {
            let player = tagpro.players[data[0].id];
            drawPlayer(player);
            orderTeamList(player.team);
            return;
        }

        for (var p in data.u) {
            let player = tagpro.players[data.u[p].id];
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

    org_drawHonk = tagpro.drawHonk || (() => 0);
    tagpro.drawHonk = function(player, remove) {
        org_drawHonk(player, remove);
        drawPlayer(player);
    };

    setInterval(function() {orderTeamList(1); orderTeamList(2);}, refresh_rate);

});
