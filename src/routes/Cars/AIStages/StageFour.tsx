import React, { useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import { CarsStore } from "../CarsStore";
import { Col, Row } from "react-bootstrap";
import * as tfvis from "@tensorflow/tfjs-vis";

export const StageFourComponent = observer(
  ({ store }: { store: CarsStore }): JSX.Element => {
    const chartElementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (
        !store.cache.model ||
        !store.cache.tenzorData ||
        !chartElementRef.current
      ) {
        return;
      }

      const [originalPoints, predictedPoints] = store.drawPredictions(
        store.cache.model,
        store.cache.data,
        store.cache.tenzorData
      );

      tfvis.render.scatterplot(
        chartElementRef.current,
        {
          values: [originalPoints, predictedPoints],
          series: ["original", "predicted"],
        },
        {
          xLabel: "Horsepower",
          yLabel: "MPG",
          height: 400,
        }
      );
    }, [store.cache]);

    return (
      <>
        <Row>
          <Col>
            <p>Проверка модели</p>
            <div ref={chartElementRef} />
          </Col>
        </Row>
      </>
    );
  }
);
