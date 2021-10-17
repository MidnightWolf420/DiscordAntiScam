const Discord = require("discord.js");
const client = new Discord.Client();
var config = require("./config.json");
const whois = require('whois-json');
//dis.gd discordapp.com discord.com discord.co discord.gg watchanimeattheoffice.com discord.gift
var DiscordDomains = ["dis.gd", "discordapp.com", "discord.com", "discord.co", "discord.gg", "watchanimeattheoffice.com", "discord.gift"]
var CheckArray = [];
async function DiscordOwned(CheckDomain){
    var CheckResults = await whois(CheckDomain);
    DiscordDomains.forEach(async(DiscordDomain) => {
        var DiscordResults = await whois(DiscordDomain);
        var keys = Object.keys(DiscordResults);
        var MatchingCount = 0;
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (DiscordResults[key] != CheckResults[key]) {
                //console.log(key + " value changed from '" + DiscordResults[key] + "' to '" + CheckResults[key] + "'");
            } else MatchingCount += 1;
            if(MatchingCount > 7) {
                CheckArray.push(true);
            } else CheckArray.push(false);
        }
    })
}

function waitFor(condition, callback) {
    if(!condition()) {
        setTimeout(waitFor.bind(null, condition, callback), 100);
    } else {
        callback();
    }
}
process.on('unhandledRejection', function(reason, promise) {

});
function CompareStrings(a, b){
    if(a.length == 0) return b.length; 
    if(b.length == 0) return a.length; 
    var matrix = [];
    var i;
    for(i = 0; i <= b.length; i++){
        matrix[i] = [i];
    }
    var j;
    for(j = 0; j <= a.length; j++){
        matrix[0][j] = j;
    }
    for(i = 1; i <= b.length; i++){
        for(j = 1; j <= a.length; j++){
            if(b.charAt(i-1) == a.charAt(j-1)){
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(matrix[i-1][j-1] + 1,
                                        Math.min(matrix[i][j-1] + 1,
                                                matrix[i-1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}

client.on("ready", () => {
    console.log(`Ready to serve.`);
});

client.on("message", message => {
    var regx = /(https:\/\/|http:\/\/)\w+\.\w+/gi
    if(regx.test(message.content)){
        DiscordDomains.forEach((DiscordDomain) => {
            if(DiscordDomains.indexOf(message.content.match(regx).toString().replace(/(https:\/\/|http:\/\/)/gi, "").replace(/\//, "")) < 0 && CompareStrings(message.content.match(regx).toString().replace(/(https:\/\/|http:\/\/)/gi, "").replace(/\//, ""), DiscordDomain) < 8){
                DiscordOwned(message.content.match(regx).toString().replace(/(https:\/\/|http:\/\/)/gi, "").replace(/\//, "")).catch((e) => e)
                waitFor(() => CheckArray.includes(true) || CheckArray.includes(false), () => {
                    if(!CheckArray.includes(true)) {
                        message.delete();
                    }
                })
            }
        })
    }
})
client.login(config.token)