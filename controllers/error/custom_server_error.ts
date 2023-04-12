export default class CustomServerError extends Error {
  public statusCode: number; //ex ) 200,201, 400, 500...

  public location?: string; //300번대 에러에서 리다이렌션할때 사용

  constructor({ statusCode = 500, message, location }: { statusCode?: number; message: string; location?: string }) {
    super(message);
    this.statusCode = statusCode;
    this.location = location;
  }

  serializeErrors(): { message: string } | string {
    return { message: this.message };
  }
}
