declare module '@patch-technology/patch' {
  interface PatchOrder {
    amount: number
    currency: string
    id: string
    patch_fee: number
    price: number
    state: string
  }

  interface PatchProject {
    country: string
    description: string
    id: string
    mechanism: string
    name: string
    technology_type?: { name: string }
  }

  interface PatchResponse<T> {
    data: T
    error: unknown
    success: boolean
  }

  interface PatchListResponse<T> {
    data: T[]
    error: unknown
    success: boolean
  }

  interface OrdersApi {
    createOrder(request: Record<string, unknown>): Promise<PatchResponse<PatchOrder>>
    placeOrder(id: string, opts?: Record<string, unknown>): Promise<PatchResponse<PatchOrder>>
    retrieveOrder(id: string, opts?: Record<string, unknown>): Promise<PatchResponse<PatchOrder>>
    retrieveOrders(opts?: Record<string, unknown>): Promise<PatchListResponse<PatchOrder>>
  }

  interface ProjectsApi {
    retrieveProject(id: string, opts?: Record<string, unknown>): Promise<PatchResponse<PatchProject>>
    retrieveProjects(opts?: Record<string, unknown>): Promise<PatchListResponse<PatchProject>>
  }

  interface PatchInstance {
    orders: OrdersApi
    projects: ProjectsApi
  }

  function Patch(accessToken: string): PatchInstance;
  export default Patch;
}
