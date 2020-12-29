This version of the project is configured to run on a raspberry pi 3. It will probably also run on other linux systems, and it also once ran on a windows system, so please feel free to try it out. If you encounter any problems (as i did when porting it to rpi linux), please contact me through the issues page, and we can try to get it running on your system as well.

start the bot with:
node bot.js

or if you have pm2 installed:
pm2 start bot.js
pm2 save -- to save the currently started programs; then it will start when the system starts; especially useful if you plan to install it on some kind of server (like a raspberry pi)

You need to create a discord bot in the discord dev panel; there you will get an API token for your bot; copy that token into auth.json (i will try to add instructions on how to create your own discord bot later).

Right now, you can only customize the prefix of the bot commands, more customization will come later on.

To use the bot, invite it to your server. On your server, you will also need a role with the name "Sufftimer" (TODO: changeable in config), because only members with that role can send commands to the bot. For a list of commands see commands.txt


WARNING: I do not own the rights to the drink alert sound. I mixed it together using a handful of sound files that i think are funny, so if you want a different sound, just replace the beeropening.mp3 file with anything you want to use as the alert sound.

NOTE: This bot cannot be used on multiple servers at the same time! You can also send commands to the bot from a different server than the one it's currently working on! This may be changed in the future. 
