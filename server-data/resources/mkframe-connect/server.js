// podpowiedzi
//import "../node_modules/@citizenfx/server";
//import "../node_modules/@citizenfx/client";
const Delay = (ms) => new Promise(res => setTimeout(res, ms));
on("playerDropped", (powod) => {
    console.log(`Gracz ${GetPlayerName(global.source)} wyszedł. (Powod: ${powod})`);
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
    for (let i = 0; i < GetNumPlayerIdentifiers(player); i++) {
        const identifier = GetPlayerIdentifier(player, i);
        if (identifier.includes('steam:')) {
            steamIdentifier = identifier;
        }
    }
    if (steamIdentifier === null) {
        console.log(`${name} nie ma Steama.`);
        deferrals.done("Nie masz włączonego Steama...")
    } else {
        const odp = await exports['oxmysql'].query_async("SELECT * FROM `whitelist` WHERE `steam` = ?", [steamIdentifier]);
        if(odp.length){
            if(odp[0].ban && (odp[0].ban > new Date())){
                console.log(`${name} ma bana a chce wbic lol`);
                deferrals.done(`\nNie możesz wejść na serwer, ponieważ jesteś zbanowany do:\n ${new Date(odp[0].ban).toLocaleString('pl')}`);
            } else {
                //zrobic update lastJoin
                console.log(`${name} wchodzi na serwer | ${steamIdentifier}`);
                deferrals.done();
            }
        } else {
            console.log(`${name} nie ma whitelisty | ${steamIdentifier}`);
            deferrals.done("Nie ma Cię na whitelist.");
        }
    }
});