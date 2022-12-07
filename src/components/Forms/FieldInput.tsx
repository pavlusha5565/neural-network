import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useCallback, useContext, useEffect } from "react";
import {
  FormControl,
  FormControlProps,
  FormGroup,
  FormGroupProps,
  FormLabel,
  FormText,
} from "react-bootstrap";
import { FormContext } from "./Former";

export interface IFieldInputProps extends FormControlProps {
  field: string;
  parse?: (x: any) => any;
  anotation?: string;
  label?: string;
  formGroupProps?: FormGroupProps;
}

export function integerParser(value: string): number {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return num;
}

export const FieldInput = observer(function FieldInput({
  field,
  parse = (x) => x,
  label,
  anotation,
  formGroupProps,
  ...props
}: IFieldInputProps) {
  const formManager = useContext(FormContext);
  const value = formManager.store[field];

  useEffect(() => {
    formManager.registerField(field);
  }, [field, formManager]);

  const onChangeCallback = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsedValue = parse(e.target.value);
      formManager.updateField(field, parsedValue);
    },
    [field, formManager, parse]
  );

  return (
    <FormGroup {...formGroupProps}>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl value={value} onChange={onChangeCallback} {...props} />
      {anotation && <FormText>{anotation}</FormText>}
    </FormGroup>
  );
});
