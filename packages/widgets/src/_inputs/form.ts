"use client";

import { createFormContext } from "@homarr/form";

import type { WidgetEditModalState } from "../modals/widget-edit-modal";

export const [FormProvider, useFormContext, useForm] =
  createFormContext<Omit<WidgetEditModalState, "advancedOptions">>();
