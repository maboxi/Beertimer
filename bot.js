const Discord = require('discord.js');
const {
	prefix,
	token,
} = require('./auth.json');
const ytdl = require('ytdl-core');

const client = new Discord.Client();
client.login(token);

client.once('ready', () => {
 console.log('Ready!');
});
client.once('reconnecting', () => {
 console.log('Reconnecting!');
});
client.once('disconnect', () => {
 console.log('Disconnect!');
});

var running = false;

var intervall = 1000 * 60 * 5;

var lastSend = Date.now();

var curTimerID = 0;

console.log("Starte autotimer at ms " + lastSend);

client.on('message', async message => {
	if(message.author.bot)
		return;
	
	if(!(message.member.user))
		return;
	
	if(!message.content.startsWith(prefix))
		return;

	const args_all = message.content.split(' ');
	const cmd = args_all[0].substring(1);
	const args = args_all.splice(1);

	if(!(message.member.roles.cache.find(r => r.name == "Sufftimer"))) {
		console.log("user without permissions tried to send command!");
		message.channel.send("You don't have the permission to control this bot!");
		return;
	}

	console.log("message received: author id: " + message.member.user.tag + "; msg: " + message.content);
	
	if (cmd == "starttimer" || cmd == "start") {
		//var voiceChannel = message.member.voiceChannel;
		
		if(running)
			message.channel.send('Der Timer läuft schon! Derzeitiges Intervall: ' + intervall);
		else {
			var msg = "Timer gestartet! Intervall: ";
			
			var seconds = Math.trunc(intervall / 1000);
			var minutes = 0;
			if(seconds >= 60){
				minutes = Math.trunc(seconds / 60);
				seconds = seconds - minutes * 60;
			}
			
			if(minutes > 0){
				msg = msg + minutes + " Minuten " + seconds + " Sekunden";
			} else {
				msg = msg + seconds + " Sekunden";
			}
			
			message.channel.send(msg);
			
			running = true;
			curTimerID++;
			
			var myTimerID = curTimerID;
			
			var voiceChannel = message.member.voice.channel;
			var useVoice = false;
			
			if(voiceChannel){
				useVoice = true;
				
				voiceChannel.join().then(connection => {
						console.log("joined VC " + message.member.voice.channel.name + "; id: " + message.member.voice.channel.id);
					}).catch(err => console.log(err));
				
				message.channel.send("Nutze Sprachkanal " + message.member.voice.channel.name);
			} else {
				message.channel.send("Um Audiobenachrichtigungen zu nutzen, bitte einem Sprachkanal beitreten!");
			}
			
			console.log("started timer; intervall: " + intervall + "; timer id = " + myTimerID + "; use voice: " + useVoice);
			
			
			while(running){
				if(curTimerID != myTimerID)
					break;
				
				if(useVoice){
					for(const connection of client.voice.connections.values()){
						const dispatcher = connection.play('./beeropening.mp3');
						
						//dispatcher.on("end", end => voiceChannel.leave());
					}
				}
				
				message.channel.send('Trinken angesagt!');
				lastSend = Date.now();
				await new Promise(resolve => setTimeout(resolve, intervall));
			}
			
			console.log("stopped timer; timer id = " + myTimerID);
		}	
		
		return;
	} else if (cmd == "stoptimer" || cmd == "stop") {
		if(running){
			running = false;
			
			console.log("set running = false; current timer id = " + curTimerID);
			
			for(const connection of client.voice.connections.values())
				connection.disconnect()
			
			//if(client.voice.channel)
				//client.leaveVoiceChannel(client.voice);
			
			message.channel.send('Timer angehalten!');
		} else {
			message.channel.send("Timer nicht gestartet! Starten mit " + prefix + "start !");
		}
		
		return;
	} else if (cmd == "timer") {
		if(args.length == 0){
			if(!running){
				var msg = "Derzeitiges Intervall: ";
			
				var seconds = Math.trunc(intervall / 1000);
				var minutes = 0;
				if(seconds >= 60){
					minutes = Math.trunc(seconds / 60);
					seconds = seconds - minutes * 60;
				}
				
				if(minutes > 0){
					msg = msg + minutes + " Minuten " + seconds + " Sekunden";
				} else {
					msg = msg + seconds + " Sekunden";
				}
				
				message.channel.send(msg);
				
				message.channel.send("Timer nicht gestartet! Starten mit " + prefix + "start !");
				return;
			}
			//console.log("timer with 0 args");
			const millis = intervall - (Date.now() - lastSend);
			var seconds = Math.trunc(millis / 1000);
			var minutes = 0;
			if(seconds >= 60){
				minutes = Math.trunc(seconds / 60);
				seconds = seconds - minutes * 60;
			}
			
			
			var msg = "Timer in ";
			if(minutes > 0){
				msg = msg + minutes + " Minute" + (minutes > 1 ? "n" : "")+ " und " + seconds + " Sekunden!";
			} else {
				msg = msg + seconds + " Sekunden!";
			}
			
			message.channel.send(msg);
		} else if(args.length == 2){
			if(args[0] == "set") {
				var parseAs = "s";
				var toParse = args[1];
				if(toParse.endsWith('m')){
					parseAs = "m";
					toParse = toParse.substring(0, toParse.length - 1);
				} else if(args[1].endsWith('s')){
					parseAs = "s";
					toParse = toParse.substring(0, toParse.length - 1);
				}
				const parsed = parseInt(toParse);
				
				if(isNaN(parsed)){
					message.channel.send("Keine Zahl: " + args[0]);
				} else {
					var msg = "";
					if(parseAs == "s"){
						if(parsed < 30){
							message.channel.send("Mindestintervall sind 30 Sekunden!");
							return;
						}
						intervall = 1000 * parsed;
						
						msg = "Intervall auf " + parsed + " Sekunden gesetzt!";
						//msg = "Intervall auf " + parsed + " Sekunden gesetzt! (" + intervall + "ms)";
					} else if(parseAs == "m"){
						intervall = 1000 * 60 * parsed;
						msg = "Intervall auf " + parsed + " Minuten gesetzt!";
						//msg = "Intervall auf " + parsed + " Minuten gesetzt! (" + intervall + "ms)";
					}
					
					console.log("intervall set: " + intervall);
					message.channel.send(msg);
				}
			}
		}
		return;
	} else if(cmd == "shutdown") {
		message.channel.send("Shutting down...");
		
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		client.destroy();
	} else {
		message.channel.send("Unbekannter Befehl!");
	}
});
