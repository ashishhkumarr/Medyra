import { useEffect, useId, useRef, useState } from "react";
import * as d3 from "d3";

import { usePrefersReducedMotion, useResizeObserver } from "./useResizeObserver";

export type BarDatum = {
  key: string;
  label: string;
  count: number;
  color: string;
};

interface BarChartD3Props {
  data: BarDatum[];
  height?: number;
  ariaLabel: string;
}

export const BarChartD3 = ({ data, height = 280, ariaLabel }: BarChartD3Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { width } = useResizeObserver(containerRef);
  const prefersReducedMotion = usePrefersReducedMotion();
  const tooltipId = useId().replace(/:/g, "");
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (!svgRef.current || width === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 12, right: 24, bottom: 24, left: 120 };
    const innerWidth = Math.max(width - margin.left - margin.right, 0);
    const innerHeight = Math.max(height - margin.top - margin.bottom, 0);

    const maxValue = d3.max(data, (d: BarDatum) => d.count) ?? 0;
    const xScale = d3.scaleLinear().domain([0, Math.max(maxValue, 1)]).range([0, innerWidth]).nice();
    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.key))
      .range([0, innerHeight])
      .padding(0.3);

    const chart = svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    chart
      .append("g")
      .call(d3.axisBottom(xScale).ticks(4).tickSizeOuter(0))
      .attr("transform", `translate(0,${innerHeight})`)
      .call((selection: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        selection
          .selectAll("text")
          .attr("fill", "rgb(var(--color-text-subtle))")
          .attr("font-size", 10)
      )
      .call((selection: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        selection
          .selectAll("line, path")
          .attr("stroke", "rgb(var(--color-border) / 0.5)")
      );

    const bars = chart
      .selectAll("rect.bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d: BarDatum) => yScale(d.key) ?? 0)
      .attr("height", yScale.bandwidth())
      .attr("fill", (d: BarDatum) => d.color)
      .attr("rx", 8)
      .attr("tabindex", 0)
      .attr("aria-label", (d: BarDatum) => `${d.label}: ${d.count}`)
      .attr("width", 0);

    if (!prefersReducedMotion) {
      bars
        .transition()
        .duration(500)
        .ease(d3.easeCubicOut)
        .attr("width", (d: BarDatum) => xScale(d.count));
    } else {
      bars.attr("width", (d: BarDatum) => xScale(d.count));
    }

    bars.style(
      "transition",
      prefersReducedMotion ? "none" : "filter 200ms ease, opacity 200ms ease"
    );

    chart
      .selectAll("text.label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", -12)
      .attr("y", (d: BarDatum) => (yScale(d.key) ?? 0) + yScale.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", "rgb(var(--color-text))")
      .attr("font-size", 12)
      .text((d: BarDatum) => d.label);

    chart
      .selectAll("text.value")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value")
      .attr("x", (d: BarDatum) => xScale(d.count) + 8)
      .attr("y", (d: BarDatum) => (yScale(d.key) ?? 0) + yScale.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", "rgb(var(--color-text-subtle))")
      .attr("font-size", 11)
      .text((d: BarDatum) => d.count);

    const showTooltip = (event: MouseEvent | FocusEvent, d: BarDatum) => {
      const [x, y] =
        "clientX" in event
          ? d3.pointer(event as MouseEvent, chart.node() as SVGGElement)
          : [xScale(d.count), (yScale(d.key) ?? 0) + yScale.bandwidth() / 2];
      const total = data.reduce((sum, item) => sum + item.count, 0) || 1;
      const percentage = Math.round((d.count / total) * 100);
      setTooltip({
        x: margin.left + x + 8,
        y: margin.top + y,
        label: `${d.label}: ${d.count} (${percentage}%)`
      });
    };

    const hideTooltip = () => setTooltip(null);

    const highlight = (event: MouseEvent | FocusEvent, d: BarDatum) => {
      d3.select<SVGRectElement, BarDatum>(event.currentTarget as SVGRectElement)
        .attr("opacity", 0.92)
        .style(
          "filter",
          "drop-shadow(0 10px 18px rgb(var(--color-primary) / 0.25))"
        );
      showTooltip(event, d);
    };

    const unhighlight = (event: MouseEvent | FocusEvent) => {
      d3.select<SVGRectElement, BarDatum>(event.currentTarget as SVGRectElement)
        .attr("opacity", 1)
        .style("filter", "none");
      hideTooltip();
    };

    bars.on("mousemove", (event: MouseEvent, d: BarDatum) => highlight(event, d));
    bars.on("mouseleave", hideTooltip);
    bars.on("mouseenter", (event: MouseEvent, d: BarDatum) => highlight(event, d));
    bars.on("focus", (event: FocusEvent, d: BarDatum) => highlight(event, d));
    bars.on("blur", (event: FocusEvent) => unhighlight(event));
    bars.on("mouseleave", (event: MouseEvent) => unhighlight(event));

    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, height, width, prefersReducedMotion]);

  return (
    <div ref={containerRef} className="relative">
      <svg ref={svgRef} role="img" aria-label={ariaLabel} className="h-[280px] w-full" />
      {tooltip && (
        <div
          id={tooltipId}
          className="pointer-events-none absolute z-10 -translate-y-1/2 rounded-2xl border border-border/60 bg-surface/85 px-3 py-2 text-xs text-text shadow-card backdrop-blur"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
};
