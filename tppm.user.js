// ==UserScript==
// @name          TagPro Player Monitor
// @version       2.1
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






tagpro.ready(function () {





    // CONSTANTS

    const size        = 16;     // Size of a ball icon
    const space       = 18;     // Vertical space per name+icon
    const textVshift  = 0;      // relative vertical shift of text
    const textHLshift = -2;     // relative horizontal shift of text on the left of a ball (red team)
    const textHRshift = 25;     // relative horizontal shift of text on the right of a ball (blue team)

    const left_to_mid  = -133;  // Distance of the red/left teamList from the middle
    const right_to_mid = 115;   // Distance of the blue/right teamList from the middle
    const dist_to_bot  = -10;   // Distance above the bottom of the screen

    const flag_size = size;
    const flag_x    = 10;
    const flag_y    = 0;

    const grip_size = 10;
    const grip_x    = -1;
    const grip_y    = 8;

    const speed_size  = 10;
    const speed_x     = -1;
    const speed_y     = -3;

    const tagpro_color = 65280;
    const tagpro_thick = 1.5;

    const bomb_color = 16776960;

    const redColor  = "#FFB5BD";
    const blueColor = "#CFCFFF";

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

    const style =
        {
            1: new PIXI.TextStyle({
                fontSize:        "8pt",
                fontWeight:      "bold",
                strokeThickness: 3,
                fill:            redColor,
            }),
            2: new PIXI.TextStyle({
                fontSize:        "8pt",
                fontWeight:      "bold",
                strokeThickness: 3,
                fill:            blueColor,
            }),
        };





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

    var playerList = new PIXI.Container();
    tagpro.renderer.layers.ui.addChild(playerList);

    var redList = new PIXI.Container();
    redList.x = (tagpro.renderer.vpWidth / 2) + left_to_mid;
    redList.y = tagpro.renderer.vpHeight + dist_to_bot;
    playerList.addChild(redList);

    var blueList = new PIXI.Container();
    blueList.x = (tagpro.renderer.vpWidth / 2) + right_to_mid;
    blueList.y = tagpro.renderer.vpHeight + dist_to_bot;
    playerList.addChild(blueList);

    teamLists =
        {
            1: redList,
            2: blueList,
        };




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

        if (player.team == 1) name.x = textHLshift - name.width;
        if (player.team == 2) name.x = textHRshift;

        name.y     = textVshift;
        name.alpha = player.dead ? 0.5 : 1;

        player.monitor.addChild(name);

    }






    // Update either the red or blue list

    function orderTeamList(team) {

        var teamList = teamLists[team];

        teamList.removeChildren();

        var count = 0;

        for (var i in tagpro.players) {

            var player = tagpro.players[i];

            if (player.team != team)    continue;

            if (!player.monitor) {
                drawPlayer(player);
            }

            teamList.addChild(player.monitor);
            player.monitor.y = - space * (++count);
        }

    }




    // This function gets called when the browser window resizes
    // It moves the playerlists to the right location

    var org_alignUI = tagpro.ui.alignUI;
    tagpro.ui.alignUI = function() {
        redList.x = (tagpro.renderer.vpWidth / 2) + left_to_mid;
        redList.y = tagpro.renderer.vpHeight + dist_to_bot;
        blueList.x = (tagpro.renderer.vpWidth / 2) + right_to_mid;
        blueList.y = tagpro.renderer.vpHeight + dist_to_bot;
        org_alignUI();
    };





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
