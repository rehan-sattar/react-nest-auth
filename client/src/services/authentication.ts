import ApiClient from "../ApiClient";

export interface SignUpRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface SignInRequestBody {
  email: string;
  password: string;
}

export interface MeResponse {
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
class AuthenticationService {
  private readonly authApiBasePath = "/authentication";

  async signUp(signUpBody: SignUpRequestBody): Promise<void> {
    try {
      await ApiClient.post(`${this.authApiBasePath}/sign-up`, signUpBody);
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async signIn(signInBody: SignInRequestBody): Promise<void> {
    try {
      await ApiClient.post(`${this.authApiBasePath}/sign-in`, signInBody);
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async me(): Promise<MeResponse> {
    try {
      const response = await ApiClient.post<MeResponse>(`${this.authApiBasePath}/me`);

      return response.data;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  refreshToken() {}
}

export const authService = new AuthenticationService();
