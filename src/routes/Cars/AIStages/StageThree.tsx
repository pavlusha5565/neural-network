import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { AICars } from "../model/AICars";
import { Col, Row } from "react-bootstrap";
import * as tfvis from "@tensorflow/tfjs-vis";

export const StageThreeComponent = observer(
  ({ store }: { store: AICars }): JSX.Element => {
    const chartElementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // todo: setError
      if (!store.cache.model) return;
      const tenzorData = store.convertToTensor(store.cache.data);

      const drawChartsByLayerLearn = () => {
        if (!chartElementRef.current) return;
        return tfvis.show.fitCallbacks(
          chartElementRef.current,
          ["loss", "mse"],
          {
            height: 400,
            callbacks: ["onEpochEnd"],
          }
        );
      };

      store.trainModel(
        store.cache.model,
        tenzorData.inputs,
        tenzorData.labels,
        drawChartsByLayerLearn
      );
    }, [store.cache.data]);

    return (
      <>
        <Row>
          <Col>
            <p>Обучение</p>
            <div ref={chartElementRef} />
          </Col>
        </Row>
      </>
    );
  }
);
