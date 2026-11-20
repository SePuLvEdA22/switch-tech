import { describe, it, expect } from 'vitest';
import { productSpecs } from '@/lib/product-specs';

// Nombres reales del catálogo seed.
describe('productSpecs', () => {
  it('cargador_con_potencia_y_conector', () => {
    expect(productSpecs('Cargador Rápido 20W USB-C')).toEqual(['20W', 'USB-C']);
  });

  it('batería_con_capacidad_formateada', () => {
    expect(productSpecs('Batería Portátil 10000mAh')).toEqual(['10.000 mAh']);
  });

  it('termo_con_volumen_y_material', () => {
    expect(productSpecs('Termo Acero Inoxidable 500ml')).toEqual(['500 ml', 'Acero']);
  });

  it('funda_con_material', () => {
    expect(productSpecs('Funda Silicona Transparente')).toEqual(['Silicona']);
    expect(productSpecs('Funda Piel Clásica')).toEqual(['Piel']);
  });

  it('cable_con_dos_conectores_prioriza_los_conectores', () => {
    expect(productSpecs('Cable Trenzado USB-C / Lightning')).toEqual(['USB-C', 'Lightning']);
  });

  it('cargador_inalámbrico', () => {
    expect(productSpecs('Cargador Inalámbrico Dual')).toEqual(['Inalámbrico']);
  });

  it('personalizado', () => {
    expect(productSpecs('Termo Personalizado')).toEqual(['Tu diseño']);
  });

  it('sin_especificaciones_reconocibles_devuelve_vacío', () => {
    expect(productSpecs('Funda Floral Rosa')).toEqual([]);
  });

  it('respeta_el_máximo', () => {
    expect(productSpecs('Cable Trenzado USB-C 60W', 2)).toEqual(['60W', 'USB-C']);
  });
});
