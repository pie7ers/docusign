import { Serializable } from "child_process";

export interface IPlaywrightRequest {
  url: string,
  headers: { [key: string]: string },
  method: string,
  payload?: Serializable,
}

export interface IPlaywrightResponse {
  status: number,
  headers: { [key: string]: string },
  body: Serializable
}

export interface IPlaywrightFullResponse {
  request: IPlaywrightRequest,
  response: IPlaywrightResponse
}