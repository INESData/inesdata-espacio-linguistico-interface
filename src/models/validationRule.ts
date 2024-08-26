/* eslint-disable @typescript-eslint/no-explicit-any */
export type ValidationResult = string | boolean;

export type ValidationRule = (value: any, targetValue?: any) => ValidationResult;
