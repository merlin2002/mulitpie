/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import IVisualHost = powerbi.extensibility.IVisualHost;
import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import { VisualSettings } from "./settings";
import * as echarts from 'echarts';

import DataViewCategorical = powerbi.DataViewCategorical;
import DataViewValueColumnGroup = powerbi.DataViewValueColumnGroup;
import PrimitiveValue = powerbi.PrimitiveValue;

export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private settings: VisualSettings;
    private textNode: Text;


    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
    }

    public update(options: VisualUpdateOptions) {
        const dataView: DataView = options.dataViews[0];
        const categoricalDataView: DataViewCategorical = dataView.categorical;
        debugger;
        if (!categoricalDataView ||
            !categoricalDataView.categories ||
            !categoricalDataView.categories[0] ||
            !categoricalDataView.values) {
            return;
        }

        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        this.target.innerHTML = `<div id='echarts' class='echarts' name='echarts' style='width: 100%;height: 100%;text-align: center;'></div>`;



        let width: number = options.viewport.width;
        let height: number = options.viewport.height;

        const categoryFieldIndex = 0;
        const measureFieldIndex = 0;
        let categories: PrimitiveValue[] = categoricalDataView.categories[categoryFieldIndex].values;
        let values: DataViewValueColumnGroup[] = categoricalDataView.values.grouped();

        let data = [];
        let legend = []


        categories.map((category: PrimitiveValue, categoryIndex: number) => {
            let group_values = [];
            values.map((years: DataViewValueColumnGroup) => {
                group_values.push({ "value": years.values[measureFieldIndex].values[categoryIndex], "name": years.name })
            });
            data.push(group_values);
            if (!legend.includes(category.toString())) {
                legend.push(category.toString())
            }
        });

        // this.target.innerText = JSON.stringify(data, null, 6);
        console.log(data);

        //绘制图表
        const ec = echarts as any;
        // try{

        //         $.getJSON('./../assets/vintage.project.json', function (themeJSON) {
        //             echarts.registerTheme('vintage', JSON.parse(themeJSON))
        //             console.log(themeJSON);
        //             this.target.innerHTML = themeJSON;
        //             // var chart = echarts.init(dom, 'vintage');
        //         });
        //     }
        //     catch(ex)
        //     { 
        //         this.target.innerHTML = ex;
        //     }

        let colorname = this.settings.myproperties.theme;
        if (colorname != "default") {
            echarts.registerTheme(colorname, JSON.parse(this.settings.myproperties.getthemecolor(colorname)))
        }

        var myChart = ec.init(document.getElementById('echarts'), colorname == "default" ? null : colorname, { renderer: this.settings.myproperties.renderer });
        // const singleDataView: DataViewSingle = dataView.single;
        // const dataViewcategorical:DataViewCategorical=dataView.categorical;
        let showlegend:boolean=this.settings.myproperties.showlegend;
        let showlable:boolean=this.settings.myproperties.showlable;
        let lableposition:string=this.settings.myproperties.lableposition;
        try {
            myChart.setOption(
                {
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)',
                        textStyle: {
                            align: "left"
                        }
                    },
                    legend: {
                        top: '5%',
                        left: 'right',
                        orient: 'vertical',
                        show:showlegend
                        // data: legend
                    },
                    series: function () {
                        let series = [];
                        let x = 65;
                        let y = 80;
                        data.forEach((element, index) => {

                            if (index <= 2) {
                                let _x =
                                    series.push(
                                        {
                                            name: legend[index],
                                            type: 'pie',
                                            radius: [(x - (20 * index)).toString() + '%', (y - (20 * index)).toString() + '%'],
                                            avoidLabelOverlap: false,
                                            itemStyle: {
                                                borderRadius: 10,
                                                borderColor: '#fff',
                                                borderWidth: 2
                                            },
                                            label: {
                                                show: showlable,
                                                formatter: '{d}%',
                                                position: lableposition
                                                // position: 'center'
                                            },
                                            emphasis: {
                                                label: {
                                                    show: true,
                                                    fontSize: '15',
                                                    fontWeight: 'bold'
                                                }
                                            },
                                            labelLine: {
                                                show: false
                                            },
                                            data: element,
                                        }
                                    )
                            }

                        });

                        return series;
                    }()
                }
            );
        }
        catch (ex) {
            // this.target.innerHTML = ex;
        }
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}