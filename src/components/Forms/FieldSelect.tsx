import React, { useCallback, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  FormGroup,
  FormLabel,
  FormSelect,
  FormSelectProps,
  FormText,
} from "react-bootstrap";
import { FormContext } from "./Former";

export interface IFieldSelect extends FormSelectProps {
  field: string;
  options: { key: string; value: any }[];
  placeholder?: string;
  label?: string;
  anotation?: string;
}

export const FieldSelect = observer(function FieldSelect({
  label,
  field,
  anotation,
  placeholder = "Выберите...",
  options,
  ...props
}: IFieldSelect) {
  const formManager = useContext(FormContext);
  const value = formManager.store[field];

  useEffect(() => {
    formManager.registerField(field);
  }, [field, formManager]);

  const onChangeCallback = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      formManager.updateField(field, e.target.value);
    },
    [field, formManager]
  );

  return (
    <FormGroup>
      {label && <FormLabel>{label}</FormLabel>}
      <FormSelect value={value} onChange={onChangeCallback} {...props}>
        <option>{placeholder}</option>
        {options.map((option) => {
          return (
            <option key={option.key} value={option.value}>
              {option.key}
            </option>
          );
        })}
      </FormSelect>
      {anotation && <FormText>{anotation}</FormText>}
    </FormGroup>
  );
});
