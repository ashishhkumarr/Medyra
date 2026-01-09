import { useEffect, useId, useRef, useState } from "react";
import * as d3 from "d3";

import { usePrefersReducedMotion, useResizeObserver } from "./useResizeObserver";

type LinePoint = { date: string; count: number };
type LinePointParsed = LinePoint & { dateValue: Date };

interface LineChartD3Props {
  data: LinePoint[];
  height?: number;
  ariaLabel: string;
  tooltipFormatter?: (point: LinePoint) => string;
}

export const LineChartD3 = ({
  data,
  height = 220,
  ariaLabel,
  tooltipFormatter
}: LineChartD3Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gradientId = useId().replace(/:/g, "");
  const { width } = useResizeObserver(containerRef);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);

  useEffect(() => {
    if (!svgRef.current || width === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 16, right: 18, bottom: 30, left: 36 };
    const innerWidth = Math.max(width - margin.left - margin.right, 0);
    const innerHeight = Math.max(height - margin.top - margin.bottom, 0);

    const parsed: LinePointParsed[] = data.map((point) => ({
      ...point,
      dateValue: new Date(point.date)
    }));

    const xDomain = d3.extent(parsed, (d: LinePointParsed) => d.dateValue) as [Date, Date];
    const maxValue = d3.max(parsed, (d: LinePointParsed) => d.count) ?? 0;
    const yDomain: [number, number] = [0, Math.max(maxValue, 1)];

    const xScale = d3.scaleTime().domain(xDomain).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain(yDomain).range([innerHeight, 0]).nice();

    const root = svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const defs = root.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", `area-${gradientId}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "rgb(var(--color-primary) / 0.45)");
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "rgb(var(--color-primary) / 0.02)");

    const chart = root
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const grid = chart.append("g").attr("class", "grid");
    grid
      .selectAll("line")
      .data(yScale.ticks(4))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d: number) => yScale(d))
      .attr("y2", (d: number) => yScale(d))
      .attr("stroke", "rgb(var(--color-border) / 0.35)")
      .attr("stroke-dasharray", "2 4");

    const area = d3
      .area<LinePointParsed>()
      .x((d: LinePointParsed) => xScale(d.dateValue))
      .y0(innerHeight)
      .y1((d: LinePointParsed) => yScale(d.count))
      .curve(d3.curveMonotoneX);

    chart
      .append("path")
      .datum(parsed)
      .attr("fill", `url(#area-${gradientId})`)
      .attr("d", area);

    const line = d3
      .line<LinePointParsed>()
      .x((d: LinePointParsed) => xScale(d.dateValue))
      .y((d: LinePointParsed) => yScale(d.count))
      .curve(d3.curveMonotoneX);

    const linePath = chart
      .append("path")
      .datum(parsed)
      .attr("fill", "none")
      .attr("stroke", "rgb(var(--color-primary))")
      .attr("stroke-width", 2.6)
      .attr("d", line);

    if (!prefersReducedMotion) {
      const length = linePath.node()?.getTotalLength() ?? 0;
      linePath
        .attr("stroke-dasharray", `${length} ${length}`)
        .attr("stroke-dashoffset", length)
        .transition()
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);
    }

    const xAxis = d3.axisBottom<Date>(xScale).ticks(5).tickSizeOuter(0);
    chart
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((selection: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        selection
          .selectAll("text")
          .attr("fill", "rgb(var(--color-text-subtle))")
          .attr("font-size", 11)
      )
      .call((selection: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        selection
          .selectAll("line, path")
          .attr("stroke", "rgb(var(--color-border) / 0.5)")
      );

    const yAxis = d3.axisLeft<number>(yScale).ticks(4).tickSizeOuter(0);
    chart
      .append("g")
      .call(yAxis)
      .call((selection: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        selection
          .selectAll("text")
          .attr("fill", "rgb(var(--color-text-subtle))")
          .attr("font-size", 11)
      )
      .call((selection: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        selection
          .selectAll("line, path")
          .attr("stroke", "rgb(var(--color-border) / 0.5)")
      );

    const focusLine = chart
      .append("line")
      .attr("stroke", "rgb(var(--color-secondary) / 0.35)")
      .attr("stroke-dasharray", "2 4")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .style("opacity", 0)
      .style("transition", prefersReducedMotion ? "none" : "opacity 200ms ease");

    const focusDot = chart
      .append("circle")
      .attr("r", 4.5)
      .attr("fill", "rgb(var(--color-primary))")
      .attr("stroke", "rgb(var(--color-surface) / 0.9)")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .style(
        "transition",
        prefersReducedMotion ? "none" : "opacity 200ms ease, transform 200ms ease"
      );

    const bisectDate = d3.bisector<LinePointParsed, Date>((d: LinePointParsed) => d.dateValue)
      .center;

    const handleHover = (event: MouseEvent | FocusEvent, point?: LinePoint) => {
      if (!parsed.length) return;
      const [xPos] =
        "clientX" in event
          ? d3.pointer(event as MouseEvent, chart.node() as SVGGElement)
          : [0];
      const index =
        point !== undefined
          ? parsed.findIndex((entry) => entry.date === point.date)
          : bisectDate(parsed, xScale.invert(xPos));
      const safeIndex = Math.max(0, Math.min(parsed.length - 1, index));
      const current = parsed[safeIndex];
      const xValue = xScale(current.dateValue);
      const yValue = yScale(current.count);

      focusLine.attr("x1", xValue).attr("x2", xValue).style("opacity", 1);
      focusDot.attr("cx", xValue).attr("cy", yValue).style("opacity", 1);

      const formattedDate = new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric"
      }).format(current.dateValue);
      const label = tooltipFormatter
        ? tooltipFormatter(current)
        : `${formattedDate}: ${current.count}`;

      const tooltipX = "clientX" in event ? margin.left + xPos : margin.left + xValue;
      const safeX = Math.min(Math.max(tooltipX, 16), width - 16);
      const safeY = Math.min(Math.max(margin.top + yValue, 16), height - 16);

      setTooltip({
        x: safeX,
        y: safeY,
        label,
        value: current.count
      });
    };

    const hideTooltip = () => {
      focusLine.style("opacity", 0);
      focusDot.style("opacity", 0);
      setTooltip(null);
    };

    chart
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .attr("pointer-events", "all")
      .on("mousemove", (event: MouseEvent) => {
        handleHover(event);
      })
      .on("focus", (event: FocusEvent) => {
        handleHover(event);
      })
      .on("mouseleave", hideTooltip);

    chart
      .selectAll("circle.data-point")
      .data(parsed)
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", (d: LinePointParsed) => xScale(d.dateValue))
      .attr("cy", (d: LinePointParsed) => yScale(d.count))
      .attr("r", 10)
      .attr("fill", "transparent")
      .attr("tabindex", 0)
      .attr("aria-label", (d: LinePointParsed) => `${d.date}: ${d.count}`)
      .on("focus", (event: FocusEvent, d: LinePointParsed) => handleHover(event, d))
      .on("blur", hideTooltip);

    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, height, width, prefersReducedMotion, gradientId, tooltipFormatter]);

  return (
    <div ref={containerRef} className="relative">
      <svg
        ref={svgRef}
        role="img"
        aria-label={ariaLabel}
        className="h-[220px] w-full"
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-4 rounded-2xl border border-border/60 bg-surface/85 px-3 py-2 text-xs text-text shadow-card backdrop-blur"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
};
