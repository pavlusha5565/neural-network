import React, { useEffect, useRef } from "react";
import { render, XYPlotData, XYPlotOptions } from "@tensorflow/tfjs-vis";
import { Container } from "react-bootstrap";

export function Scattetplot({
  data,
  options,
}: {
  data: XYPlotData | null;
  options?: XYPlotOptions;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!data) return;
    render.scatterplot(containerRef.current, data, options);
  }, [options, data]);

  return (
    <Container>
      <div ref={containerRef} />
    </Container>
  );
}
