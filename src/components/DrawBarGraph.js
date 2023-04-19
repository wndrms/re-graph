import React, { useRef } from "react";
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    TooltipComponent,
    GridComponent,
    LegendComponent,
    BarChart,
    CanvasRenderer
  ]);

const DrawBarGraph = ({title, data}) => {
    const chartRef = useRef(null);
    
    if (chartRef.current) {
        const chart = echarts.init(chartRef.current);
        const total = Object.values(data).reduce((acc, value) => acc + value, 0);
        const gdata = Object.entries(data).map(([key, value]) => ({name: key, data: [value/total*100]}));
        const option = {
            title: {
                text: title,
            },
            xAxis: {
                type: 'value',
                boundaryGap: false
            },
            yAxis: {
                type: 'category',
                show: false,
                data: ['Category 1']
            },
            series: gdata.map(series => ({
                type: 'bar',
                name: series.name,
                stack: 'stack',
                data: series.data,
                label: {
                    show: true,
                    position: 'insideRight'
                }
            }))
        };
        chart.setOption(option);
    }
    return <div ref={chartRef} style={{height: '200px'}}></div>;
}

export default DrawBarGraph;