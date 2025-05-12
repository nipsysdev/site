export interface AppRoute {
  viewRoute: ViewRoute
  param?: string | number
  timeStamp: number
}

export enum ViewRoute {
  Terminal = '/',
  Whoami = '/whoami',
  Blog = '/blog',
  Contact = '/contact',
}

export interface RouteData {
  params: Promise<{ locale: string }>
}
