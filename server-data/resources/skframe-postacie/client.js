//import "../node_modules/@citizenfx/client";
let wybranapostac = null;
let zespawnowany = false;

const Delay = (ms) => new Promise(res => setTimeout(res, ms));
onNet("otrzymajPostacie", async (postacie) => {
    SetEntityVisible(PlayerPedId(-1), false);
    FreezeEntityPosition(PlayerPedId(-1), true);
    SendNUIMessage({co: 'postacie', data: postacie});
});

RegisterNuiCallbackType('wybierzPostac');
on(`__cfx_nui:wybierzPostac`, (body, cb) => {
    try{
        wybierzPostac(body.postac);
    } catch(e) {
        console.error("Error podczas NUI callback mkframe-connect/wylaczLoadingScreen", e);
    }
});
RegisterNuiCallbackType('poprosStworzPostac');
on(`__cfx_nui:poprosStworzPostac`, (body, cb) => {
    try{
        console.log("Client poprosStworzPostac -> Server stworzPostac", body.dane.imie, body.dane.nazwisko);
        emitNet("stworzPostac", body.dane);
    } catch(e) {
        console.error("Error podczas NUI callback mkframe-connect/wylaczLoadingScreen", e);
    }
});

const wybierzPostac = async (postac) => {
    wybranaPostac = postac;
    const modelPostaci = GetHashKey(wybranaPostac.plec ? 'CS_AberdeenSister' : 'CS_MP_ALFREDO_MONTEZ');

    RequestModel(modelPostaci);
    while(!HasModelLoaded(modelPostaci)){
        console.log("Ładuję model postaci");
        await Delay(0);
    }
    SetPlayerModel(PlayerId(), modelPostaci);
    SetModelAsNoLongerNeeded(modelPostaci);

    //po chuj to?
    N_0x283978a15512b2fe && N_0x283978a15512b2fe(PlayerPedId(), true);

    RequestCollisionAtCoord(wybranaPostac.lastX, wybranaPostac.lastY, wybranaPostac.lastZ);

    const ped = PlayerPedId();

    await Delay(2000);
    console.log("Ustawiam lokalnie pozycje");
    SetEntityCoordsNoOffset(ped, wybranaPostac.lastX, wybranaPostac.lastY, wybranaPostac.lastZ, false, false, false, true);
    SetEntityHeading(ped, wybranaPostac.heading);
    NetworkResurrectLocalPlayer(wybranaPostac.lastX, wybranaPostac.lastY, wybranaPostac.lastZ, wybranaPostac.heading, true, true, false);

    ClearPedTasksImmediately(ped);
    ClearPlayerWantedLevel(PlayerId());
    SetEntityVisible(ped, true);
    
    //sprawdz czy zaladowal kolizje
    while(!HasCollisionLoadedAroundEntity(ped)){
        console.log("Ładuję kolizje wokół postaci");
        await Delay(0);
    }

    FreezeEntityPosition(ped, false);
    ShutdownLoadingScreen();
    SetNuiFocus(false, false);
    IsScreenFadedOut() && DoScreenFadeIn(400);
    zespawnowany = true;
};

const pozycja = setInterval(() => {
    if(!zespawnowany){
        SetNuiFocus(true, true);
        return;
    }
    const ped = PlayerPedId(-1);
    const koordy = GetEntityCoords(ped, false);
    const heading = GetEntityHeading(ped);
    console.log(`POS X: ${koordy[0]} Y: ${koordy[1]} Z: ${koordy[2]} H: ${heading}`);
    emitNet("nadpiszPozycjePostaci", wybranaPostac.idpostaci, koordy[0], koordy[1], koordy[2], heading);
}, 5000);

onNet("odswiezPostacie", () => {
    console.log("onNet odswiezPostacie");
    wybranapostac = null;
    zespawnowany = false;
    emitNet("wczytajPostacie");
    SendNUIMessage({co: 'tworzenie'});
});