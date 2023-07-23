/*onNet("wybranaPostac", (posX, posY, posZ, rot) => {
    const gracz = global.source;
    SetEntityCoordsAndHeading(PlayerPedId(gracz), posX, posY, posZ, rot, false, false, false);
    emitNet("zaladujPostac", gracz);
});*/

let defaultSpawn = [-189.93121337890625, 629.166, 114.032, 45.5];

onNet("nadpiszPozycjePostaci", async (idpostaci, posX, posY, posZ, rot) => {
    const gracz = global.source;
    let steamIdentifier;
    for (let i = 0; i < GetNumPlayerIdentifiers(gracz); i++) {
        const identifier = GetPlayerIdentifier(gracz, i);
        if(identifier.includes('steam:')) steamIdentifier = identifier;
    }
    await exports.oxmysql.query_async("UPDATE `postacie` SET `lastX` = ?, `lastY` = ?, `lastZ` = ?, `heading` = ? WHERE `idpostaci` = ? AND `steam` = ?", [posX, posY, posZ, rot, idpostaci, steamIdentifier]);
    //console.log("Nadpisano pozycje", steamIdentifier, "postac o id", idpostaci);
});

onNet("wczytajPostacie", async () => {
    const gracz = global.source;
    let steamIdentifier = null;
    for (let i = 0; i < GetNumPlayerIdentifiers(gracz); i++) {
        const identifier = GetPlayerIdentifier(gracz, i);
        if(identifier.includes('steam:')) steamIdentifier = identifier;
    }
    let postacie = await exports.oxmysql.query_async("SELECT * FROM `postacie` WHERE `steam` = ?", [steamIdentifier]);
    emitNet("otrzymajPostacie", gracz, postacie);
});

onNet("stworzPostac", async (dane) => {
    console.log("Tworzę postać", dane.imie);
    const gracz = global.source;
    let steamIdentifier = null;
    for (let i = 0; i < GetNumPlayerIdentifiers(gracz); i++) {
        const identifier = GetPlayerIdentifier(gracz, i);
        if(identifier.includes('steam:')) steamIdentifier = identifier;
    }
    await exports.oxmysql.query_async("INSERT INTO `postacie` (`steam`, `imie`, `nazwisko`, `plec`, `dataurodzenia`, `lastX`, `lastY`, `lastZ`, `heading`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [steamIdentifier, dane.imie, dane.nazwisko, dane.plec, dane.dataurodzenia, defaultSpawn[0], defaultSpawn[1], defaultSpawn[2], defaultSpawn[3]]);
    emitNet("odswiezPostacie", gracz);
});