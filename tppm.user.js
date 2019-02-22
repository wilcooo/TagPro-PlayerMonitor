// ==UserScript==
// @name          TagPro Player Monitor
// @version       2.9
// @author        bash# ; Ko
// @namespace     http://www.reddit.com/user/bash_tp/
// @description   Shows an on-screen list of players in the game and their current status
// @match         *://*.koalabeast.com/*
// @match         *://*.jukejuice.com/*
// @match         *://*.newcompte.fr/*
// @downloadURL   https://greasyfork.org/scripts/35240-tagpro-player-monitor/code/TagPro%20Player%20Monitor.user.js
// @supportURL    https://www.reddit.com/message/compose/?to=Wilcooo
// @website       https://redd.it/6pe5e9
// @license       MIT
// ==/UserScript==

if (location.pathname == '/' && !GM_getValue('stopnotify', false)) {
 if (!confirm('You still have an old version of the Player Monitor script installed, please download the new script from https://greasyfork.org/scripts/35240 to be able to use it with the new TagPro.\n\nPress Cancel to never show again.')) {
   GM_setValue('stopnotify', true);
 }
}
