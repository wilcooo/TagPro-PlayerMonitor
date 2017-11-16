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
// @website       https://www.reddit.com/r/TagPro/comments/7cvx2c/userscript_4_newupdated_scripts/?sort=new
// @license       MIT
// ==/UserScript==

tagpro.ready(function () {





    // CONSTANTS

    const size        = 16;     // Size of a ball icon
    const space       = 18;     // Vertical space per name+icon
    const textVshift  = 0;      // relative vertical shift of text
    const textHLshift = -2;     // relative horizontal shift of text on the left of a ball (red team)
    const textHRshift = 25;     // relative horizontal shift of text on the right of a ball (blue team)

    const left_to_mid  = -130;  // Distance of the red/left teamList from the middle
    const right_to_mid = 120;   // Distance of the blue/right teamList from the middle
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

    tagpro.renderer.updateFlagsFromPlayer = function() {};
    tagpro.renderer.resetFlagStatuses();





    // This function gets all players on a team

    function getPlayers(team) {

        var players = [];

        for (var playerId in tagpro.players) {
            if (!tagpro.players.hasOwnProperty(playerId)) continue;
            if (tagpro.players[playerId].team != team)    continue;

            var player = tagpro.players[playerId];
            players.push({
                name:   player.name,
                flag:   player.flag,
                dead:   player.dead,
                bomb:   player.bomb,
                tagpro: player.tagpro,
                grip:   player.grip,
            });
        }

        return players;
    }





    // Create PIXI containers for both player lists

    var playerList = new PIXI.DisplayObjectContainer();
    tagpro.renderer.layers.ui.addChild(playerList);

    var redList = new PIXI.DisplayObjectContainer();
    redList.x = ($("#viewport").width() / 2) + left_to_mid;
    redList.y = $("#viewport").height() + dist_to_bot;
    playerList.addChild(redList);

    var blueList = new PIXI.DisplayObjectContainer();
    blueList.x = ($("#viewport").width() / 2) + right_to_mid;
    blueList.y = $("#viewport").height() + dist_to_bot;
    playerList.addChild(blueList);

    var teamLists =
        {
            1: redList,
            2: blueList,
        };


    // This function gets called when the browser window resizes
    // It moves the playerlists to the right location

    var org_resize = tagpro.renderer.resizeAndCenterView;
    tagpro.renderer.resizeAndCenterView = function() {
        redList.x = ($("#viewport").width() / 2) + left_to_mid;
        redList.y = $("#viewport").height() + dist_to_bot;
        blueList.x = ($("#viewport").width() / 2) + right_to_mid;
        blueList.y = $("#viewport").height() + dist_to_bot;
        org_resize();
    };




    // The rolling_bomb graphics are stored here, so that they can be updated (animation)
    var rolling_bombs = [];
    var org_UIupdate = tagpro.ui.update;
    tagpro.ui.update = function () {
        org_UIupdate();
        for (var b in rolling_bombs) {
            rolling_bombs[b].bomb.alpha = (rolling_bombs[b].player.dead ? 0.375 : 0.75)*Math.abs(Math.sin(performance.now() / 150));
        }
    };





    // Update either the red or blue list

    function updateTeamList(team) {

        var teamList = teamLists[team];

        while (teamList.children.length)
            teamList.removeChild(teamList.children[0]);

        var players = getPlayers(team);

        for (var i = 0; i < players.length; i++) {
            var y = - space * i;

            if (players.length > i) {

                var player = players[i];

                // Draw ball
                tagpro.tiles.draw(teamList, ballsprite[team], { x: 0, y: y }, size, size, player.dead ? 0.5 : 1);

                // Draw bomb (rolling bomb)
                if (player.bomb) {
                    var bomb = new PIXI.Graphics();
                    bomb.beginFill(bomb_color, (player.dead ? 0.375 : 0.75)*Math.abs(Math.sin(performance.now() / 150)) );
                    bomb.drawCircle(size/2, y + size/2, size/2);

                    teamList.addChild(bomb);

                    rolling_bombs.push( {bomb:bomb,player:player} );
                }

                // Draw tagpro
                if (player.tagpro) {
                    var tp = new PIXI.Graphics();
                    tp.lineStyle(tagpro_thick, tagpro_color, player.dead ? 0.5 : 1 );
                    tp.drawCircle(size/2, y + size/2, size/2);

                    teamList.addChild(tp);
                }

                // Draw grip (juke juice)
                if (player.grip) {
                    tagpro.tiles.draw(teamList, 'grip' , { x: grip_x, y: y + grip_y }, grip_size, grip_size, player.dead ? 0.5 : 1);
                }

                // Draw speed (a deprecated powerup)
                if (player.speed) {
                    tagpro.tiles.draw(teamList, 'speed' , { x: speed_x, y: y + speed_y }, speed_size, speed_size, player.dead ? 0.5 : 1);
                }

                // Draw flag/potato
                if (player.flag && !player.dead) {
                    tagpro.tiles.draw(teamList, flagsprite[player.flag]+(player.potatoFlag ? 'potato':'flag') , { x: flag_x, y: y + flag_y }, flag_size, flag_size);
                }

                // Draw name
                var name = new PIXI.Text(player.name, style[team]);

                if (team == 1) name.x = textHLshift - name.width;
                if (team == 2) name.x = textHRshift;

                name.y     = y + textVshift;
                name.alpha = player.dead ? 0.5 : 1;

                teamList.addChild(name);

            }
        }
    }






    function redrawPlayerList() {
        rolling_bombs = [];
        updateTeamList(1);
        updateTeamList(2);
    }

    tagpro.socket.on("mapupdate", redrawPlayerList);
    tagpro.socket.on("p",         redrawPlayerList);

});
