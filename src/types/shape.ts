export interface ShapeType {
  lg?: SizedShapeType;
  md?: SizedShapeType;
  sm?: SizedShapeType;
}

export interface SizedShapeType {
  location: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}
