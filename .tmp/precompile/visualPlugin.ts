import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api"
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];

var mulitpie91275C762EF847969B236C51745DEF81: IVisualPlugin = {
    name: 'mulitpie91275C762EF847969B236C51745DEF81',
    displayName: 'mulitpie',
    class: 'Visual',
    apiVersion: '2.6.0',
    create: (options: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }

        throw 'Visual instance not found';
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["mulitpie91275C762EF847969B236C51745DEF81"] = mulitpie91275C762EF847969B236C51745DEF81;
}

export default mulitpie91275C762EF847969B236C51745DEF81;