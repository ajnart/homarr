import { createFormContext } from "@homarr/form";

export interface AccessFormType<TPermission extends string> {
  items: {
    principalId: string;
    permission: TPermission;
  }[];
}

export const [FormProvider, useFormContext, useForm] = createFormContext<AccessFormType<string>>();

export type HandleCountChange = (callback: (prev: number) => number) => void;
