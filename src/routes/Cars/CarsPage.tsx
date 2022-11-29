import React, { useCallback, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Col, Container, Row } from "react-bootstrap";
import { CarsStore } from "./CarsStore";
import { StageOneComponent } from "./AIStages/StageOne";
import { StageTwoComponent } from "./AIStages/StageTwo";
import { StageThreeComponent } from "./AIStages/StageThree";
import { StageFourComponent } from "./AIStages/StageFour";
import { useSearchParams } from "react-router-dom";
import { useSearchQuery } from "../../utils/useSearchQuery";

const carsStore = new CarsStore();

const stepInfo = [
  {
    step: 1,
    header: "Загрузка и подготовка данных",
    component: StageOneComponent,
  },
  {
    step: 2,
    header: "Создание модели обучения",
    component: StageTwoComponent,
  },
  {
    step: 3,
    header: "Обучение",
    component: StageThreeComponent,
  },
  {
    step: 4,
    header: "Проверка модели",
    component: StageFourComponent,
  },
];

function CarsPage(): JSX.Element {
  const [step, setStep] = useState(0);
  const [queries, setSearch] = useSearchQuery();

  useEffect(() => {
    async function fetchData() {
      if (!carsStore.checkData()) {
        carsStore.fetchCarsData();
      }
    }
    fetchData();
  }, []);

  const nextStep = useCallback(
    (stage?: number) => {
      if (stage !== undefined) {
        setStep(stage);
        carsStore.reset();
        return;
      }
      if (step < stepInfo.length - 1) {
        setStep(step + 1);
      }
    },
    [step]
  );

  const renderData = stepInfo[step];
  const Component = renderData.component;

  return (
    <Container className="content">
      <Row>
        <h2>{renderData.header}</h2>
        <Component store={carsStore} />
      </Row>
      <Row className="justify-content-md-center mt-4">
        {!!(step < stepInfo.length - 1) && (
          <Col md="auto">
            <Button onClick={() => nextStep()}>Следующий шаг</Button>
          </Col>
        )}
        <Col md="auto">
          <Button onClick={() => nextStep(0)}>Сбросить</Button>
        </Col>
      </Row>
    </Container>
  );
}

export default observer(CarsPage);
