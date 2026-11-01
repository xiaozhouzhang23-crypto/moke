export class ApiError extends Error {
  status: number;
  code: number;

  constructor(status: number, code: number, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }

  static badRequest(message = '参数校验失败') {
    return new ApiError(400, 1001, message);
  }

  static unauthorized(message = '未登录或登录已失效') {
    return new ApiError(401, 1002, message);
  }

  static forbidden(message = '没有操作权限') {
    return new ApiError(403, 1003, message);
  }

  static notFound(message = '资源不存在') {
    return new ApiError(404, 1004, message);
  }

  static conflict(message = '资源冲突') {
    return new ApiError(409, 1005, message);
  }
}
