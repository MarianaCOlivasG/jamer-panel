import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error al guardar en Local Storage: ${error}`);
    }
  }


  getItem<T>(key: string): T | null {
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error al obtener de Local Storage: ${error}`);
      return null;
    }
  }


  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error al eliminar de Local Storage: ${error}`);
    }
  }


  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error al limpiar Local Storage: ${error}`);
    }
  }
}
