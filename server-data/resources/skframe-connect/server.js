let liczbaGraczy = 0;
let urlWebhooki = {
    heartbeat: 'https://discord.com/api/webhooks/1131921596999811133/x6zCKIdXNG4BywCswzxTEQ3DP8lZ1KBRFSdlguMtM7LhAQENufoGajEuOk13PKGglMJk',
    connect: 'https://discord.com/api/webhooks/1131934340268429404/D0EwPxaAbyMo7P3pYQ0D95u74so8MIOIsuVxvQGXtzuoWvVbx9_UjUt-jDOgjgmi-TfH'
};

const webhook = (link, metoda, json) => {
    PerformHttpRequestInternalEx({
        url: link,
        method: metoda,
        headers: {'Content-Type': 'application/json'},
        data: JSON.stringify(json)
    });
};
// podpowiedzi
//import "../node_modules/@citizenfx/server";
//import "../node_modules/@citizenfx/client";

onNet("liczbaGraczy", () => {
    emitNet("ustawRichPresence", global.source, liczbaGraczy);
});

const Delay = (ms) => new Promise(res => setTimeout(res, ms));
on("playerDropped", (powod) => {
    console.log(`Gracz ${GetPlayerName(global.source)} wyszedł. (Powod: ${powod})`);
    let steamIdentifier = null;
    let discord = null;
    for (let i = 0; i < GetNumPlayerIdentifiers(global.source); i++) {
        const identifier = GetPlayerIdentifier(global.source, i);
        if(identifier.includes('steam:')) steamIdentifier = identifier;
        if(identifier.includes('discord:')) discord = identifier;
    }
    let epochTime = Math.floor(Date.now() / 1000);
    webhook(urlWebhooki.connect, 'POST', {'content': `<@${discord ? discord.substring(8) : null}>\`\`\`${steamIdentifier} wychodzi z serwera (Powód: ${powod})\`\`\`<t:${epochTime}:D><t:${epochTime}:T> / <t:${epochTime}:R>`});
    if(liczbaGraczy) liczbaGraczy = liczbaGraczy - 1;
});
on('playerConnecting', async (name, setKickReason, deferrals) => {
    deferrals.defer();
    const player = global.source;
    await Delay(100);
    deferrals.presentCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "type": "AdaptiveCard",
            "version": "1.5",
            "body": [{
                    "type": "Container",
                    "items": [{
                        "type": "TextBlock",
                        "text": "Wchodzisz na ProjectRed",
                        "weight": "bolder",
                        "size": "medium"
                    }]
                }, {
                    "type": "Container",
                    "items": [{
                        "type": "TextBlock",
                        "text": `Cześć ${name}! Zanim przejdziesz dalej, sprawdzimy szybciutko czy twój Steam jest w porządku.`,
                        "wrap": true
                    }]
                }
            ]
    });
    await Delay(3000);
    let steamIdentifier = null;
    let discord = null;
    for (let i = 0; i < GetNumPlayerIdentifiers(player); i++) {
        const identifier = GetPlayerIdentifier(player, i);
        if(identifier.includes('steam:')) steamIdentifier = identifier;
        if(identifier.includes('discord:')) discord = identifier;
    }
    let epochTime = Math.floor(Date.now() / 1000);
    if (steamIdentifier === null) {
        console.log(`${name} nie ma Steama.`);
        deferrals.done("Nie masz włączonego Steama...");
        webhook(urlWebhooki.connect, 'POST', {'content': `<@${discord ? discord.substring(8) : null}>\`\`\`${name}> probuje wbic bez Steama\`\`\`<t:${epochTime}:D><t:${epochTime}:T> / <t:${epochTime}:R>`});
    } else {
        const odp = await exports['oxmysql'].query_async("SELECT * FROM `whitelist` WHERE `steam` = ?", [steamIdentifier]);
        if(odp.length){
            if(odp[0].ban && (odp[0].ban > Date.now())){
                console.log(`${name} ma bana a chce wbic lol`);
                webhook(urlWebhooki.connect, 'POST', {'content': `<@${discord ? discord.substring(8) : null}>\`\`\`${steamIdentifier} probuje wbic\`\`\`***BAN konczy sie za*** <t:${Math.floor(odp[0].ban / 1000)}:R>\n<t:${epochTime}:D><t:${epochTime}:T> / <t:${epochTime}:R>`});
                deferrals.done(`\nNie możesz wejść na serwer, ponieważ jesteś zbanowany do:\n ${new Date(odp[0].ban).toLocaleString('pl')}`);
            } else {
                //zrobic update lastJoin
                webhook(urlWebhooki.connect, 'POST', {'content': `<@${discord ? discord.substring(8) : null}>\`\`\`${steamIdentifier} wchodzi na serwer\`\`\`<t:${epochTime}:D><t:${epochTime}:T> / <t:${epochTime}:R>`});
                console.log(`${name} wchodzi na serwer | ${steamIdentifier}`);
                deferrals.done();
                liczbaGraczy = liczbaGraczy + 1;
            }
        } else {
            console.log(`${name} nie ma whitelisty | ${steamIdentifier}`);
            webhook(urlWebhooki.connect, 'POST', {'content': `<@${discord ? discord.substring(8) : null}>\`\`\`${steamIdentifier} nie ma whitelist\`\`\`<t:${epochTime}:D><t:${epochTime}:T> / <t:${epochTime}:R>`});
            deferrals.done("Nie ma Cię na whitelist.");
        }
    }
});

//heartbeat
setInterval(() => {
    webhook(urlWebhooki.heartbeat+'/messages/1131936741352280124', 'PATCH', {'content': '\`\`\`Serwer co minutę wysyła bicie serca.\nJeśli poniższy znacznik czasowy wskazuje więcej niż "minutę temu",\nmoże to oznaczać potencjalne przeciążenie.\`\`\`\n'+`<t:${Math.floor(Date.now() / 1000)}:R>`});
}, 60000);