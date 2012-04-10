vichrome.NormalMode.prototype.reqPluginSample = function() {
    alert('hello, sample plugin command called!');
};

vichrome.CommandExecuter.prototype.commandTable.PluginSample = "triggerInsideContent";
