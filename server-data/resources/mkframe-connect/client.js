let loadscreenAktywny = true;
//dc rich presence
SetDiscordAppId('1131894650974781470');
SetDiscordRichPresenceAsset('cowboy');
SetDiscordRichPresenceAssetSmallText("SuperGigaUltraWesternRP DEV");
SetDiscordRichPresenceAction(0,'Discord','https://www.youtube.com/watch?v=dQw4w9WgXcQ');
SetDiscordRichPresenceAction(1,'Website','https://www.youtube.com/watch?v=dQw4w9WgXcQ');

RegisterNuiCallbackType('wylaczLoadingScreen');
//import "../node_modules/@citizenfx/client";
on(`__cfx_nui:wylaczLoadingScreen`, (body, cb) => {
    try{
        ShutdownLoadingScreen();
        SetNuiFocus(false, false);
        SendNUIMessage(null);
        loadscreenAktywny = false;
    } catch(e) {
        console.error("Error podczas NUI callback mkframe-connect/wylaczLoadingScreen", e);
    }
});

onNet("ustawRichPresence", (liczba) => {
    SetRichPresence(`${liczba} na 32 graczy`);
});

setInterval( () => {
    emitNet("liczbaGraczy");
    if(!loadscreenAktywny) return;
    ShutdownLoadingScreen();
    HideLoadingOnFadeThisFrame();
    BusyspinnerOff();
    SetNuiFocus(true, true);
}, loadscreenAktywny ? 1000 : 15000);