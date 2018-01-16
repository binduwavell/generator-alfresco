// See http://docs.alfresco.com/5.1/references/dev-extension-points-webscripts.html
model.data = 'My dashboard data'.toLocaleLowerCase();

// See http://docs.alfresco.com/5.1/references/api-ws-obj-config.html
// for details on the config root scoped object
var cfg = new XML(config.script);
model.item = cfg.item[0].toString();
