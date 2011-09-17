vichrome = {};

window.addEventListener("DOMContentLoaded", function() {
    vichrome.model   = new vichrome.Model();
    vichrome.view    = new vichrome.views.Surface();
    vichrome.handler = new vichrome.event.EventHandler();

    // TODO: onEnable should be triggered from background page.
    vichrome.handler.onEnabled();
});

