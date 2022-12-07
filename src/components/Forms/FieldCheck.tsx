import React, { useCallback, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  FormCheck,
  FormCheckProps,
  FormGroup,
  FormGroupProps,
  FormLabel,
} from "react-bootstrap";
import { FormContext } from "./Former";

export interface IFieldCheckProps extends FormCheckProps {
  field: string;
  label?: string;
  formGroupProps?: FormGroupProps;
}

export const FieldCheck = observer(function FieldCheck({
  field,
  label,
  formGroupProps,
  ...props
}: IFieldCheckProps) {
  const formManager = useContext(FormContext);

  useEffect(() => {
    formManager.registerField(field);
  }, [field, formManager]);

  const onChangeCallback = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsedValue = e.target.checked;
      formManager.updateField(field, parsedValue);
    },
    [field, formManager]
  );

  return (
    <FormGroup {...formGroupProps}>
      {label && <FormLabel htmlFor={`${field}-checkbox`}>{label}</FormLabel>}
      <FormCheck
        id={`${field}-checkbox`}
        checked={formManager.storeData?.[field]}
        onChange={onChangeCallback}
        {...props}
      />
    </FormGroup>
  );
});
