import { ProductFilters } from "./database";

// Simple global filter store
let currentFilters: ProductFilters = {
  sortBy: "createdAt",
  sortOrder: "DESC",
};

export const getCurrentFilters = (): ProductFilters => {
  return { ...currentFilters };
};

export const setCurrentFilters = (filters: ProductFilters) => {
  currentFilters = { ...filters };
};

export const updateFilters = (updates: Partial<ProductFilters>) => {
  currentFilters = { ...currentFilters, ...updates };
};
