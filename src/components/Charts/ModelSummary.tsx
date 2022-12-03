import React, { useEffect, useRef } from "react";
import { Sequential } from "@tensorflow/tfjs";
import { Container } from "react-bootstrap";
import { show } from "@tensorflow/tfjs-vis";

export function ModelSummary({ model }: { model: Sequential | null }) {
  const conteinerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conteinerRef.current || !model) return;
    show.modelSummary(conteinerRef.current, model);
  }, [model]);

  return (
    <Container>
      <div ref={conteinerRef} />
    </Container>
  );
}
