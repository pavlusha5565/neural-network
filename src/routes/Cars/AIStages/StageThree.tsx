import React, { useCallback, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { AICars } from "../model/AICars";
import * as tfvis from "@tensorflow/tfjs-vis";
import { Former } from "../../../components/Forms/Former";
import {
  FieldInput,
  integerParser,
} from "../../../components/Forms/FieldInput";
import { FormManager } from "../../../stores/FormManager";
import { ITrainModelConfig } from "../model/AICars.types";
import { Button, Col, Row } from "react-bootstrap";
import { FieldCheck } from "../../../components/Forms/FieldCheck";

export const StageThreeComponent = observer(
  ({ store }: { store: AICars }): JSX.Element => {
    const chartElementRef = useRef<HTMLDivElement>(null);

    const handleStartTrain = useCallback(
      (settings: ITrainModelConfig) => {
        if (!store.cache.model) return;
        const tenzorData = store.convertToTensor(store.cache.data);

        const visCallback = () => {
          if (!chartElementRef.current) return;
          return tfvis.show.fitCallbacks(
            chartElementRef.current,
            ["acc", "loss", "mse"],
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
          visCallback,
          settings
        );
      },
      [store]
    );

    return (
      <>
        <Row>
          <Former<ITrainModelConfig>
            defaultValue={{ epochs: 50, batchSize: 25, shuffle: true }}
            handleSubmit={(setting) => {
              handleStartTrain(setting);
            }}
          >
            <FieldInput
              field={"epochs"}
              label={"Количество эпох обучений (повторов)"}
              parse={integerParser}
              anotation={
                "Повторение обучение по всем данным, но перемешанным(shaffle)"
              }
            />
            <FieldInput
              field={"batchSize"}
              label={"Количество пакетов за 1 интерацию"}
              parse={integerParser}
            />
            <FieldCheck field={"shuffle"} label={"Перемешивание"} />
            <Button type="submit">Начать обучение</Button>
          </Former>
        </Row>
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
