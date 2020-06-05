const Discord = require ('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const staticCommand = config.command;
let channelFound = false;
let bestOfChannel = null;
let serverID = false;

let messagePosted = false;

client.once('ready', () => {
	let iterator = client.channels.cache;
	iterator.forEach((value, key, map) => {
		if (value.name === config.channel) {
			channelFound = true;
			bestOfChannel = value;
		}
  });
  if (!serverID) {
    serverID = getServerID();
  }
});

client.login(config.token);

client.on('message', message => {
	
	if (!message.content.startsWith(config.prefix) || message.author.bot) return;

	const args = message.content.slice(config.prefix.length).split(' ');
	const sentCommand = args.shift().toLowerCase();

	if (sentCommand === staticCommand) {
		if (!args.length) {
      return message.channel.send(`Please supply a post id , ${message.author}`);
		} else if (channelFound) {
      if (Number.isInteger(parseInt(args[0]))) {
        //we have a valid integer id, so let's use it
        const messageID = args[0];
        let alreadyExists = messageAlreadyBestOf(messageID);
        if (!alreadyExists) {
          message.channel.messages.fetch(messageID)
          .then(msg => bestOfMessage(msg, message.channel, message.author))
          .catch(console.error);
          if (messagePosted) {
            return message.channel.send(`Annother item added to 'Best Of' courtesy of ${message.author}`);
          }
        }
      }
      if (args[0] === 'help') {
        return message.channel.send(getHelpMessage());
      }
      if (args[0] === 'info') {
        return message.channel.send(getInfoMessage());
      }
    } 
  }
});

function getServerID() {
  const serverID =  client.guilds.cache;
  let id = 0;
  serverID.forEach((value, key, map) => {

    id = value.id;
  });
  return id;
}

function getHelpMessage() {
  return `Add posts to the Best Of Archive by using the command !bestof followed by the post id.
  ->The post id can be found by clicking the 3 dots on the right of the message and clicking "Copy ID"
  ->example: !bestof 123456789198765432`;
}

function getInfoMessage() {
  return `I am a bot to archive selected posts because the number of pins are limited per channel
  Commands: !bestof post_id | !bestof help | !bestof info`;
}

function bestOfMessage(message, channel, user) {
  const serverID = getServerID();
  if (serverID == 0) {
    return 'Error';
  }
  createEmbed(message, channel, user, serverID);
  //bestOfChannel.send(createEmbed(message, channel, user, serverID));
  messagePosted = true;
}

function createEmbed(message, channel, user, serverID) {
  let embed =  new Discord.MessageEmbed();
  let date = prettifyDate(message.createdTimestamp);
  console.log(message.guild.members);
  embed.setColor('#000000');
  embed.setTitle(`Originally posted by : ${message.member.displayName}`);
  embed.setURL(`https://discordapp.com/channels/${serverID}/${channel.id}/${message.id}`)
  embed.addField(`Date`, `${date.dayOfWeek} ${date.month} ${date.day}, ${date.year} at ${date.hours}:${date.minutes} ${date.timeOfDay}`);
  if (getMessageAttachment(message)) {
    embed.setImage(getMessageAttachment(message))
  }
  if (message.content) {
    embed.setDescription(message.content)
  }
  embed.addField(`Submitted by:`, user.username);
  embed.setFooter(`Added to the Best Of Archive: `);
  embed.setTimestamp();
  return embed;
}

function getMessageAttachment(message) {
  if (message.attachments.size > 0) {
    return message.attachments.values().next().value.url;
  } else {
    return false;
  }
}

function prettifyDate(timestamp) {
  let date = new Date(timestamp);
  let day = date.getDate();
  let dayOfWeek = getDayOfWeek(date.getDay() + 1);
  let month = getFullMonth(date.getMonth());
  let year = date.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let timeOfDay = 'AM';
  if (hours > 12) {
    hours -= 12;
    timeOfDay = 'PM';
  }
  return { day, month, year, dayOfWeek, hours, minutes, timeOfDay };
}

function getDayOfWeek(day) {
  switch (day) {
    case 1:
      return "Sunday"
    case 2:
      return "Monday";
    case 3:
      return "Tuesday";
    case 4: 
      return "Wednesday";
    case 5: 
      return "Thursday";
    case 6:
      return "Friday";
    case 7:
      return "Saturday"
    default:
      break;
  }
}

function getFullMonth(month) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[month];
}