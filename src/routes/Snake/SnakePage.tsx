import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Button, Col, Container, Row } from "react-bootstrap";
import { ASnake } from "../../modules/Snake/Snake";
import { observer } from "mobx-react-lite";
import { AISnake } from "./model/AISnake";
import { ModelSummary } from "../../components/Charts/ModelSummary";
import { EHitEvent } from "../../modules/Snake/Snake.types";
import s from "./SnakePage.module.scss";
import { json } from "stream/consumers";
import { step } from "@tensorflow/tfjs";

export function SnakePage() {
  const width = 16;
  const height = 16;

  const [snakeEngine] = useState(
    () => new ASnake({ width, height, startSpeed: 4, logger: false })
  );
  const [AISnakeInstance] = useState(
    () => new AISnake(snakeEngine, { size: { width, height } })
  );

  useEffect(() => {
    const removeListner = snakeEngine.keyBind(document.body);
    return removeListner;
  }, [snakeEngine]);

  useEffect(() => {
    AISnakeInstance.AIGenerateModel();
  }, [AISnakeInstance]);

  const train = useCallback(async () => {
    for (let i = 0; i < 100; i++) {
      const predictedBatch = AISnakeInstance.makeTrainBatch(100);
      await AISnakeInstance.trainBatch(predictedBatch);
    }
  }, [AISnakeInstance]);

  const startInteraction = useCallback(() => {
    const predictedBatch = AISnakeInstance.makeTrainBatch(1000);

    snakeEngine.setAutoplayData(predictedBatch.map((i) => i.moveTo));
    snakeEngine.startAI();
    AISnakeInstance.trainBatch(predictedBatch);
  }, [AISnakeInstance, snakeEngine]);

  return (
    <Container>
      <section>
        <div className={s.SnakePlayground}>
          {snakeEngine.playground.map((row, indexX) => (
            <div key={`${indexX}`} className={s.SnakePlayground__row}>
              {row.reverse().map((col, indexY) => {
                const hit = snakeEngine.checkHit([col[0], col[1]]);
                return (
                  <div
                    id={JSON.stringify(col)}
                    key={`${indexX}:${indexY}`}
                    className={clsx(
                      s.SnakePlayground__block,
                      hit === EHitEvent.apple && s.apple,
                      hit === EHitEvent.snake && s.snake
                    )}
                  >
                    {hit && (
                      <div
                        key={`${indexX}:${indexY} element`}
                        className={clsx(
                          s.SnakePlayground__element,
                          hit === EHitEvent.apple && s.apple,
                          hit === EHitEvent.snake && s.snake
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
      <section>
        <Row>
          <Col sm={3}>
            <Button onClick={() => startInteraction()}>startInteraction</Button>
          </Col>{" "}
          <Col sm={3}>
            <Button onClick={() => train()}>train</Button>
          </Col>
          <Col sm={3}>
            <Button onClick={() => snakeEngine.step()}>Start</Button>
          </Col>
        </Row>
      </section>
      <section>
        <Row>
          <ModelSummary model={AISnakeInstance.model} />
        </Row>
      </section>
    </Container>
  );
}

export default observer(SnakePage);
