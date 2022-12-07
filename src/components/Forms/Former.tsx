import React, { useEffect, useState } from "react";
import { Form, FormProps } from "react-bootstrap";
import { FormManager } from "../../stores/FormManager";

export const FormContext = React.createContext<FormManager<any>>(
  undefined as any
);

export function useFormerContex<Value extends object>() {
  return React.useContext<FormManager<Value>>(FormContext);
}

export const FormContextProvider = FormContext.Provider;
export const FormContextConsumer = FormContext.Consumer;

interface IFormer<T> {
  defaultValue: T;
  children?: React.ReactNode;
  handleChange?: (data: T) => void;
  handleSubmit?: (e: T) => void;
}

export type IFormerProps<T> = IFormer<T> & Omit<FormProps, keyof IFormer<T>>;

export function Former<IForm extends object>({
  defaultValue,
  children,
  handleSubmit = () => {},
  handleChange = () => {},
  ...props
}: IFormerProps<IForm>) {
  const [formManager] = useState(() => new FormManager<IForm>(defaultValue));

  // useEffect(() => {
  //   formManager.subscribeToChange(handleChange);
  //   return formManager.unsubscribe.bind(formManager);
  // }, []);

  return (
    <Form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmit(formManager.storeData);
        props.onSubmit?.(e);
      }}
      onChange={(e: React.FormEvent<HTMLFormElement>) => {
        handleChange(formManager.storeData);
        props.onChange?.(e);
      }}
      {...props}
    >
      <FormContextProvider value={formManager}>
        {children || ""}
      </FormContextProvider>
    </Form>
  );
}
