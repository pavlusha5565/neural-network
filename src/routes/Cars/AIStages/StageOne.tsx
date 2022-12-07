import React, { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { AICars } from "../model/AICars";
import {
  Col,
  FormControl,
  FormGroup,
  FormLabel,
  FormSelect,
  Row,
} from "react-bootstrap";
import { FormManager } from "../../../stores/FormManager";
import { Scattetplot } from "../../../components/Charts/Scattetplot";

interface IStageOneForm {
  x: string;
  y: string;
  xLabel: string;
  yLabel: string;
}

const defaultFormData = {
  x: "x",
  y: "y",
  xLabel: "X Ось",
  yLabel: "Y Ось",
};

export const StageOneComponent = observer(
  ({ store }: { store: AICars }): JSX.Element => {
    const [formManager] = useState(
      () => new FormManager<IStageOneForm>(defaultFormData)
    );

    const dataField = useMemo(() => {
      if (!store.data) return [];
      const keys = Object.keys(store.data[0]).filter((i) =>
        Number.isInteger(store.data?.[0][i])
      );
      formManager.updateStore((store) => ({
        ...store,
        x: keys[0],
        y: keys[1],
      }));
      return keys;
    }, [formManager, store.data]);

    const data = useMemo(() => {
      if (!store.checkData()) return null;
      const values = store.formatData({
        ...formManager.store,
      });

      return { values, series: ["Данные"] };
    }, [formManager.store.x, formManager.store.y, store]);

    return (
      <>
        <Row>
          <Col>
            <FormGroup className="mb-4">
              <FormLabel>Веберите X ось</FormLabel>
              <FormSelect
                onChange={(event) =>
                  formManager.updateField("x", event.target.value)
                }
                value={formManager.store.x}
                className="mb-2"
              >
                <option>Select...</option>
                {dataField
                  .filter((el) => el !== formManager.store.y)
                  .map((item) => {
                    return (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    );
                  })}
              </FormSelect>
              <FormControl
                onChange={(event) =>
                  formManager.updateField("xLabel", event.target.value)
                }
                value={formManager.store.xLabel}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Веберите Y ось</FormLabel>
              <FormSelect
                onChange={(event) =>
                  formManager.updateField("y", event.target.value)
                }
                value={formManager.store.y}
                className="mb-2"
              >
                <option>Select...</option>
                {dataField
                  .filter((el) => el !== formManager.store.x)
                  .map((item) => {
                    return (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    );
                  })}
              </FormSelect>
              <FormControl
                onChange={(event) =>
                  formManager.updateField("yLabel", event.target.value)
                }
                value={formManager.store.yLabel}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row className="mt-4">
          <Scattetplot
            data={data}
            options={{
              xLabel: formManager.store.xLabel,
              yLabel: formManager.store.yLabel,
            }}
          />
        </Row>
      </>
    );
  }
);
