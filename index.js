const Discord = require("discord.js")
const client = new Discord.Client()

const Sequelize = require('sequelize');
const PREFIX = '?';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});


const best = sequelize.define('best', {
	id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
	from: {
        type: Sequelize.STRING,
        allowNull: false
    },
	to: {
        type: Sequelize.STRING,
        allowNull: false
    },
    points:{
        type: Sequelize.INTEGER,
        allowNull: false, 
    }
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("?help"); 
    if(check()) best.sync();
});

client.on("message", async  msg => {
    if (msg.author.bot) return;
    if (msg.content.startsWith(PREFIX)) {
		const params = msg.content.slice(PREFIX.length).split(' ');
        const command = params.shift();
		if(command.trim() !== "") {
            switch(command){
                case "bigup":{
                    if(params.length >= 1){
                        if(msg.mentions.users.size === 0) custom(msg,"you have to mention someone !!!");
                        else if(params[0].indexOf(msg.mentions.users.entries().next().value[0]) === -1) custom(msg,"?bigup [user]");
                        else if(msg.author.id === msg.mentions.users.entries().next().value[0]) custom(msg,"you can't bigup yourself !!!");
                        else {
                            save(msg.author.id,msg.mentions.users.entries().next().value[0],1);
                            custom(msg,"You bigup "+getUser(msg.mentions.users.entries().next().value[0]).username);
                        }
                    }
                    else custom(msg,"?bigup [user]");
                }
                break;
                case "pane":{
                    if(params.length >= 1){
                        if(msg.mentions.users.size === 0) custom(msg,"you have to mention someone !!!");
                        else if(params[0].indexOf(msg.mentions.users.entries().next().value[0]) === -1) custom(msg,"?pane [user]");
                        else if(msg.author.id === msg.mentions.users.entries().next().value[0]) custom(msg,"you can't pane yourself !!!");
                        else {
                            save(msg.author.id,msg.mentions.users.entries().next().value[0],-1);
                            custom(msg,"You pane "+getUser(msg.mentions.users.entries().next().value[0]).username);
                        }
                    }
                    else custom(msg,"?pane [user]");
                }
                break;
                case "thebest": thebest(msg);
                break;
                case "bigupme": bigupme(msg,msg.author.id);
                break;
                case "help":{
                    const embed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle("**Commands**");
                    embed.addField("bigup","?bigup [user]");
                    embed.addField("pane","?pane [user]");
                    embed.addField("My infos","?bigupme");
                    embed.addField("Rank","?thebest");
                    msg.reply(embed);
                }
                break;
            }
        }
	}
});
client.login(process.env.MY_TOKEN);

async function check(){
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        return true ;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    return false ;
}
function custom(msg, content){
    const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(content)
    msg.reply(embed);
}
async function save(from,to,points = 1){
    const ele = await best.findOne({ where: { from: from,to:to} });
    if(ele){
        if(points === 1){
            ele.points += 1
            await ele.save();
        }
        else if(ele.points > 0) {
            ele.points -= 1
            await ele.save();
        }
    }
    else{
        if(points !== 1) points = 0;
        await best.create({
            from: from,
            to : to,
            points : points
        });
    }
}
async function thebest(msg){
    const totals = await best.findAll({
        attributes: [
            'to',
            [sequelize.fn('sum', sequelize.col('points')), 'total'],
        ],
        group: ['to'],
        order: sequelize.literal('total DESC'),
    });
    if(totals.length > 0){
        const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle("**The best**");
        totals.forEach( t=> {
            var ele = t.dataValues;
            if(getUser(ele.to)) embed.addField(getUser(ele.to).username,ele.total+" points");
        });
        msg.reply(embed);
    }
    else custom("No infos !!!");


}
async function bigupme(msg,to){
    const ele = await best.findAll({ where: {to:to} });
    if(ele.length > 0){
        const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle("**Your infos**");
        ele.forEach( t=> {
            var element = t.dataValues;
            embed.addField(getUser(element.from).username," gives you "+element.points+" points");
        });
        msg.reply(embed);
    }
    else custom(msg,"You got nothing !!!");
}







function getUser(id){
    return client.users.cache.get(id);
}














/*const Discord = require("discord.js")
const client = new Discord.Client()

const Sequelize = require('sequelize');
const sequelize = new Sequelize('discord', 'root', '', {
	host: 'localhost',
	dialect: 'mysql',
	logging: false
});
const word_fire = sequelize.define('word_fire', {
	id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
	value: Sequelize.TEXT,
    type:{
        type: Sequelize.STRING,
        allowNull: false, 
        defaultValue:"word"
    },
	flag: {
        type: Sequelize.BOOLEAN, 
        allowNull: false, 
        defaultValue: 1
    }
});
const PREFIX = '?';


client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
  word_fire.sync();
})
client.on("message", async  msg => {
    Check_Search(msg);
    Check_Event(msg);
    if (isNotNormal(msg)) return;
    if (msg.content.startsWith(PREFIX)) {
		const params = msg.content.slice(PREFIX.length).split(' ');
        const command = params.shift();
		if(command.trim() !== "") doExec(msg,command,params);
	}
});
client.login("NzA3NTU4NTI4NTQ1NTg3Mjcw.XrKmHg.xLXcTc7wNfZT1-N778KwM64GAJI")



async function doExec(msg,cmd,params){
    
}
function isNotNormal(msg) {return msg.author.bot /*||  msg.author.id == user ;}
async function save(type,val,flag = 1){
    const ele = await word_fire.findOne({ where: { value: val,type:type} });
    if(ele){
        ele.flag = flag;
        await ele.save();
    }
    else{
        await word_fire.create({
            value: val,
            type : type
        });
    }
}
function From_DM(msg){ return msg && msg.author && msg.author.bot && msg.author.username === "Dank Memer" ;}
function Check_Event(msg){
    if(From_DM(msg) && msg.content.toLowerCase().indexOf("typ") != -1){
        var text = msg.content.match(/\`([^)]+)\`/)[1];
        if(text.indexOf('`') === -1 && text.toLowerCase().indexOf("event") === -1){
            if(msg.content.toLowerCase().indexOf("typing") !== -1) text += ":repeat";
            save('fire',text);
        }
    }
}
function Check_Search(msg){
    if(From_DM(msg) && msg.content.indexOf("Where do you want to search? Pick from the list below and type it in chat") !== -1){
        var tmp = msg.content.substr(msg.content.lastIndexOf(".")+1,msg.content.length-1).split("`, `");
        let vals = [];
        tmp.forEach(function(e){
            vals.push(e.replace('`','').replace(' ','').replace(' ','').trim());
        });
        if(vals.length > 0) save("word",vals.join());
    }
}*/