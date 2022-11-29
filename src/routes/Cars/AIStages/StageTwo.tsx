import React, { useCallback, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { CarsStore } from "../CarsStore";
import * as tfvis from "@tensorflow/tfjs-vis";
import {
  Button,
  Card,
  Col,
  Form,
  FormCheck,
  FormControl,
  FormGroup,
  FormLabel,
  FormText,
  Row,
  ToggleButton,
} from "react-bootstrap";
import { IDenseLayerArgs } from "../CarsStore.types";
import { FormManager } from "../../../stores/FormManager";
import s from "../CarsPage.module.scss";

const layerDefaultValue: IDenseLayerArgs = {
  units: 1,
  inputShape: [1],
  useBias: true,
  batchSize: undefined,
};

type IDenseLayerTypes = IDenseLayerArgs[keyof IDenseLayerArgs];

export const StageTwoComponent = observer(
  ({ store }: { store: CarsStore }): JSX.Element => {
    const [formManager] = useState(
      () =>
        new FormManager<{ layers: IDenseLayerArgs[] }>({
          layers: [layerDefaultValue],
        })
    );
    const visualModelRef = useRef<HTMLDivElement>(null);

    const changeField = (
      index: number,
      field: keyof IDenseLayerArgs,
      value: IDenseLayerTypes
    ): void => {
      const layers = formManager.storeData.layers;
      layers[index] = {
        ...layers[index],
        [field]: value,
      };
      console.log(value, layers[index]);
      formManager.updateField("layers", layers);
    };

    const add = (): void => {
      formManager.updateField("layers", [
        ...formManager.store.layers,
        {
          ...layerDefaultValue,
        },
      ]);
    };

    const remove = (index: number): void => {
      const data = formManager.storeData.layers;
      data.splice(index, 1);
      formManager.updateField("layers", data);
    };

    useEffect(() => {
      const model = store.AIGenerateModel(formManager.storeData.layers);
      if (!visualModelRef.current || !model) return;
      tfvis.show.modelSummary(visualModelRef.current, model);
    }, [formManager.storeData.layers, store]);

    return (
      <>
        <Row>
          {formManager.store.layers?.map((layer, index) => {
            return (
              <Col key={index} md={6} sm={12} className={s.FormBlock}>
                <Card>
                  <Card.Header>Слой {index + 1}</Card.Header>
                  <Card.Body>
                    <Form>
                      <FormGroup className="mb-2">
                        <FormLabel>Units</FormLabel>
                        <FormControl
                          type="number"
                          onChange={(event) => {
                            const value = event.target.value;
                            const parsed = Number(value);
                            if (Number.isNaN(parsed) || parsed <= 0) {
                              changeField(index, "units", 1);
                              return;
                            }
                            changeField(index, "units", parsed);
                          }}
                          value={formManager.store.layers[index].units}
                        />
                      </FormGroup>
                      <FormGroup className="mb-2">
                        <FormLabel>UseBias</FormLabel>
                        <FormCheck
                          onChange={(event) => {
                            changeField(index, "useBias", event.target.checked);
                          }}
                          checked={formManager.store.layers[index].useBias}
                        />
                      </FormGroup>
                      <FormGroup className="mb-2">
                        <FormLabel>BatchSize</FormLabel>
                        <FormControl
                          type="number"
                          onChange={(event) => {
                            const value = event.target.value;
                            const parsed = Number(value);
                            if (Number.isNaN(parsed) || parsed <= 0) {
                              changeField(index, "batchSize", undefined);
                              return;
                            }
                            changeField(index, "batchSize", parsed);
                          }}
                          value={formManager.store.layers[index].batchSize || 0}
                        />
                        <FormText>0 mean unlimited</FormText>
                      </FormGroup>
                      <div className="d-flex justify-content-end">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </Form>
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
          <div ref={visualModelRef} />
        </Row>
      </>
    );
  }
);
