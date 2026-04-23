export interface User {}
export interface Product {}
export interface Cart {}
export interface Order {}
export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}
