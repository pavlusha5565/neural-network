import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { AICars } from "../model/AICars";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { ModelSummary } from "../../../components/Charts/ModelSummary";
import {
  ELosses,
  EOptimizers,
  ICompileOptions as ICompilerOptions,
  IDenseLayerArgs,
} from "../model/AICars.types";
import { Former } from "../../../components/Forms/Former";
import {
  FieldInput,
  integerParser,
} from "../../../components/Forms/FieldInput";
import { FieldCheck } from "../../../components/Forms/FieldCheck";
import s from "../CarsPage.module.scss";
import { FormManager } from "../../../stores/FormManager";
import { FieldSelect } from "../../../components/Forms/FieldSelect";

const layerDefaultValue: IDenseLayerArgs = {
  units: 1,
  inputShape: [1],
  useBias: true,
  batchSize: 1,
};

export const StageTwoComponent = observer(
  ({ store }: { store: AICars }): JSX.Element => {
    const [formManager] = useState(
      () =>
        new FormManager<{
          layers: IDenseLayerArgs[];
          compilerOption: ICompilerOptions;
        }>({
          layers: [layerDefaultValue],
          compilerOption: {
            optimizer: EOptimizers.adam,
            losses: ELosses.meanSquaredError,
          },
        })
    );

    const add = (): void => {
      formManager.updateField("layers", [
        ...formManager.store.layers,
        {
          ...layerDefaultValue,
        },
      ]);
    };

    const remove = (index: number): void => {
      if (formManager.store.layers.length <= 1) return;
      const data = formManager.storeData.layers;
      data.splice(index, 1);
      formManager.updateField("layers", data);
    };

    const formData = formManager.storeData;
    store.AIGenerateModel(formData.layers, formData.compilerOption);

    return (
      <Container>
        <Row>
          <Former<{ optimizer: EOptimizers; losses: ELosses }>
            defaultValue={{
              optimizer: EOptimizers.adam,
              losses: ELosses.meanSquaredError,
            }}
            handleChange={(e) => {
              formManager.updateField("compilerOption", e);
            }}
          >
            <FieldSelect
              field={"optimizer"}
              label={"Оптимизатор обучения"}
              placeholder={"Выберите оптимизатор"}
              options={Object.keys(EOptimizers).map((i) => ({
                key: i,
                value: i,
              }))}
            />
            <FieldSelect
              field={"losses"}
              label={"Функция потерь точности"}
              placeholder={"Выберите стратегию потерь"}
              options={Object.keys(ELosses).map((i) => ({
                key: i,
                value: i,
              }))}
            />
          </Former>
        </Row>
        <br />
        <Row>
          {formManager.store.layers?.map((layer, index) => {
            return (
              <Col key={index} md={6} sm={12} className={s.FormBlock}>
                <Card>
                  <Card.Header>Слой {index + 1}</Card.Header>
                  <Card.Body>
                    <Former<IDenseLayerArgs>
                      defaultValue={layerDefaultValue}
                      handleChange={(e) => {
                        const layers = formManager.storeData.layers;
                        layers[index] = e;
                        formManager.updateField("layers", layers);
                      }}
                    >
                      <FieldInput
                        field="units"
                        label="Units"
                        parse={integerParser}
                      />
                      <FieldCheck field={"useBias"} label="useBias" />
                      <FieldInput
                        field="batchSize"
                        label="BatchSize"
                        type="number"
                        parse={(e) => {
                          let num = integerParser(e);
                          return num <= 0 ? 0 : num;
                        }}
                      />
                      <div className="d-flex justify-content-end mt-4">
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={formManager.store.layers.length <= 1}
                          onClick={() => {
                            remove(index);
                          }}
                        >
                          Удалить слой
                        </Button>
                      </div>
                    </Former>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
        <Row className="mb-5 justify-content-center">
          <Col sm={5}>
            <Button className="btn-block btn-lg" onClick={add}>
              Add New
            </Button>
          </Col>
        </Row>
        <Row>
          <ModelSummary model={store.cache.model} />
        </Row>
      </Container>
    );
  }
);
