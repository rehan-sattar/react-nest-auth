import { AxiosError } from "axios";
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
      throw (error as AxiosError).response?.data;
    }
  }

  async signIn(signInBody: SignInRequestBody): Promise<void> {
    try {
      await ApiClient.post(`${this.authApiBasePath}/sign-in`, signInBody);
    } catch (error) {
      throw (error as AxiosError).response?.data;
    }
  }

  async signOut(): Promise<void> {
    try {
      await ApiClient.post(`${this.authApiBasePath}/sign-out`);
    } catch (error) {
      throw (error as AxiosError).response?.data;
    }
  }

  async me(): Promise<MeResponse> {
    try {
      const response = await ApiClient.get<MeResponse>(`${this.authApiBasePath}/me`);

      return response.data;
    } catch (error) {
      throw (error as AxiosError).response?.data;
    }
  }

  refreshToken() {}
}

export const authService = new AuthenticationService();
