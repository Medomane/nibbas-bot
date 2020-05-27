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
                        else if(msg.author.id === msg.mentions.users.entries().next().value[0]) bigupme(msg,msg.author.id);
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
                case "rank": thebest(msg);
                break;
                case "help":{
                    const embed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle("**Commands**")
                    .addField("Give someone a point","?bigup [user]")
                    .addField("Remove a point from someone","?pane [user]")
                    .addField("My infos","?bigup [my name]")
                    .addField("Rank","?rank");
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
        var send = false ;
        totals.forEach( t=> {
            var ele = t.dataValues;
            if(getUser(ele.to)) {
                embed.addField(getUser(ele.to).username,ele.total+" points");
                send = true ;
            }
        });
        if(send === true) msg.reply(embed);
    }
    else custom(msg,"No infos !!!");
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