import React from "react";
import {
  Button,
  Col,
  Container,
  ListGroup,
  NavLink,
  Row,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { MyFormControl } from "../../components/Forms/Former";
import { FieldInput } from "../../components/Forms/FieldInput";
import { Routes } from "../index";

export default function IndexPage() {
  const routes = Routes.map((item) => {
    return item.path;
  });

  return (
    <Container>
      <Row>
        <Col md={4}>
          <ListGroup>
            {routes.map((path, key) => (
              <ListGroup.Item key={key}>
                <Link className="nav-link active" to={path}>
                  {path}
                </Link>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
}
