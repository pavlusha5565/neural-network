import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Container } from "react-bootstrap";
import { ASnake } from "../../modules/Snake/Snake";
import clsx from "clsx";
import s from "./SnakePage.module.scss";
import { observer } from "mobx-react-lite";
import { EHitEvent } from "../../modules/Snake/Snake.types";
import { cloneDeep } from "lodash";

export function SnakePage() {
  const width = 16;
  const height = 16;

  const [snake] = useState(
    () => new ASnake({ width, height, startSpeed: 4, logger: true })
  );

  snake.keyBind(document.body);
  const playground = useMemo(() => {
    const element2DMatrix: Array<Array<React.ReactElement>> = [];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (!element2DMatrix[x]) {
          element2DMatrix[x] = [];
        }

        const hit = snake.checkHit([x, y]);

        element2DMatrix[x][y] = (
          <div
            key={`${x}:${y}`}
            className={clsx(
              s.SnakePlayground__block,
              hit === EHitEvent.apple && s.apple,
              hit === EHitEvent.snake && s.snake
            )}
          />
        );
      }
    }
    return element2DMatrix;
  }, [snake.game.apple, snake.game.snake, snake]);

  // @ts-ignore
  window.snake = snake;
  return (
    <Container>
      <div className={s.SnakePlayground}>
        {playground.map((row, index) => {
          return (
            <div key={`row = ${index}`} className={s.SnakePlayground__row}>
              {row}
            </div>
          );
        })}
      </div>
      <Button onClick={() => snake.start()}>Start</Button>
    </Container>
  );
}

export default observer(SnakePage);
