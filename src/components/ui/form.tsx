"use client";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  createContext,
  useContext,
  useId,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";

function Form({ ...props }: ComponentProps<typeof FormProvider>) {
  return <FormProvider data-slot="form" {...props} />;
}

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
}

const FormFieldContext = createContext<FormFieldContextValue>({} as FormFieldContextValue);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <span data-slot="form-field">
      <FormFieldContext.Provider value={{ name: props.name }}>
        <Controller {...props} />
      </FormFieldContext.Provider>
    </span>
  );
}

function useFormField() {
  const fieldContext = useContext(FormFieldContext);
  const { getFieldState, formState } = useFormContext();
  return getFieldState(fieldContext.name, formState);
}

function FormItem({ className, children }: { className?: string; children: ReactNode }) {
  const id = useId();
  return (
    <div className={cn("space-y-2", className)} data-slot="form-item">
      {children}
    </div>
  );
}

function FormLabel({ className, children, ...props }: ComponentProps<typeof Label>) {
  const { error } = useFormField();
  return (
    <Label
      data-slot="form-label"
      className={cn(error && "text-rose-400", className)}
      {...props}
    >
      {children}
    </Label>
  );
}

function FormControl({ children }: { children: ReactNode }) {
  return <div data-slot="form-control">{children}</div>;
}

function FormMessage({ className, children }: { className?: string; children?: ReactNode }) {
  const { error } = useFormField();
  const body = error ? String(error?.message ?? "") : children;
  if (!body) return null;
  return (
    <p className={cn("text-sm text-rose-400", className)} data-slot="form-message">
      {body}
    </p>
  );
}

export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, useFormField, useFormContext as useForm };
