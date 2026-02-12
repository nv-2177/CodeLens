
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DiagramNode, DiagramLink } from '../types';

interface VisualFlowProps {
  data: {
    nodes: DiagramNode[];
    links: DiagramLink[];
  };
  isDarkMode?: boolean;
}

// Define internal interfaces to include D3's injected simulation properties (x, y, fx, fy)
interface SimulationNode extends d3.SimulationNodeDatum, DiagramNode {}

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  source: SimulationNode | string;
  target: SimulationNode | string;
  label?: string;
}

const VisualFlow: React.FC<VisualFlowProps> = ({ data, isDarkMode = false }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth || 800;
    const height = 400;

    // Theme values
    const nodeStroke = "#3b82f6";
    const nodeFill = isDarkMode ? "#1e293b" : "#ffffff";
    const textColor = isDarkMode ? "#e2e8f0" : "#1e293b";
    const linkColor = isDarkMode ? "#334155" : "#cbd5e1";
    const arrowColor = isDarkMode ? "#475569" : "#94a3b8";

    // Create a container for zoom/pan
    const g = svg.append("g");

    // Clone data for simulation to avoid mutating props and to add simulation properties
    const nodes: SimulationNode[] = data.nodes.map(n => ({ ...n }));
    const links: SimulationLink[] = data.links.map(l => ({ ...l }));

    const simulation = d3.forceSimulation<SimulationNode>(nodes)
      .force("link", d3.forceLink<SimulationNode, SimulationLink>(links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-600))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1));

    // Define arrow markers
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", arrowColor)
      .style("stroke", "none");

    const linkSelection = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", linkColor)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    const nodeSelection = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, SimulationNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    nodeSelection.append("rect")
      .attr("width", d => Math.max(80, (d.label.length * 8) + 40))
      .attr("height", 40)
      .attr("x", d => -Math.max(80, (d.label.length * 8) + 40) / 2)
      .attr("y", -20)
      .attr("rx", 10)
      .attr("fill", nodeFill)
      .attr("stroke", nodeStroke)
      .attr("stroke-width", 2);

    nodeSelection.append("text")
      .text(d => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", textColor)
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      // After simulation starts, D3 mutates link source/target from ID strings to node objects
      // We cast to any or SimulationNode to access injected coordinates x and y
      linkSelection
        .attr("x1", d => (d.source as any).x || 0)
        .attr("y1", d => (d.source as any).y || 0)
        .attr("x2", d => (d.target as any).x || 0)
        .attr("y2", d => (d.target as any).y || 0);

      // SimulationNode includes x and y from SimulationNodeDatum
      nodeSelection.attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
    svg.call(zoom);

    return () => {
      simulation.stop();
    };
  }, [data, isDarkMode]);

  return (
    <div className={`w-full ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-xl overflow-hidden relative transition-colors duration-300`}>
      <div className={`absolute top-4 left-4 text-xs font-semibold ${isDarkMode ? 'text-slate-500 bg-slate-800' : 'text-slate-400 bg-white'} uppercase tracking-wider px-2 py-1 rounded shadow-sm transition-colors`}>
        Logic Flow Diagram
      </div>
      <svg ref={svgRef} className="w-full h-[400px] cursor-move" />
    </div>
  );
};

export default VisualFlow;
