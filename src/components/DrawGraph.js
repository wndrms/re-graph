import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { GraphChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// Register necessary components
echarts.use([
  GraphChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);


const DrawGraph = ({ data, onClick }) => {
  const chartRef = useRef(null);
  useEffect(() => {
    
    const layerGroups = new Map();
    data.nodes.forEach(node => {
      const layer = node.layer;
      if (!layerGroups.has(layer)) {
        layerGroups.set(layer, []);
      }
      layerGroups.get(layer).push(node);
    });
    layerGroups.forEach((nodes, layer) => {
      const totlaNodes = nodes.length;
      const nodeRadius = 500;
      const centerX = (totlaNodes - 1) * nodeRadius;
      nodes.forEach((node, index) => {
        node.zlevel = 10;
        node.y = centerX - index * 2 * nodeRadius;
        node.x = layer * 2000;
      });
    });
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);
      const options = {
        title: {
          text: 'Money Laundering',
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            if (params.dataType === 'edge') {
                return `Edge: ${params.value}`;
            } else {
                return `Node: ${params.name}`;
            }
          }
        },
        legend: {
          show: true,
        },
        series: [
          {
            type: 'graph',
            layout: 'none',
            force: {
              layoutAnimation: false,
              edgeLength: 120,
            },
            symbolSize: 20,
            roam: true,
            label: {
              show: false,
            },
            draggable: true,
            data: data.nodes,
            links: data.links,
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [2, 5],
            edgeLabel: {
              show: true,
              position: 'insideMiddle',
              formatter: '{@value}',
            },
            autoCurveness: 0.2,
          },
        ],
      };
      chart.setOption(options);
      chart.off('click');
      chart.on('click', (params) => {
        if (params.componentType === 'series') {
          if (params.dataType === 'node') {
            const nodeIndex = params.dataIndex;
            onClick(data.nodes[nodeIndex]);
          }
          
        }
      });
    }
  }, [data, onClick]);

  return <div ref={chartRef} style={{ height: '1000px' }} />;
};

export default DrawGraph;