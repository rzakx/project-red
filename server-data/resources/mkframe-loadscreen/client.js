let loadscreenAktywny = true;
RegisterNuiCallbackType('wylaczLoadingScreen');
//import "../node_modules/@citizenfx/client";
on(`__cfx_nui:wylaczLoadingScreen`, (body, cb) => {
    try{
        console.log("Wykonałem dupa()");
        ShutdownLoadingScreen();
        SetNuiFocus(false, false);
        SendNUIMessage({'allah': "akbar"});
        loadscreenAktywny = false;
    } catch(e) {
        console.error("Error podczas NUI callback ", nazwa, e);
    }
});
setTimeout(() => {
    loadscreenAktywny && SetNuiFocus(true, true);
    ShutdownLoadingScreen();
}, 1);
