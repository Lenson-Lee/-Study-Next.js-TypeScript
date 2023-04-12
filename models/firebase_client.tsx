import { getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

//환경변수에 있는 값
const FirebaseCredentials = {
  apiKey: publicRuntimeConfig.apiKey,
  authDomain: publicRuntimeConfig.authDomain,
  projectId: publicRuntimeConfig.projectId,
};

export default class FirebaseClient {
  private static instance: FirebaseClient;

  private auth: Auth;

  public constructor() {
    const apps = getApps();
    //초기화가 안되어있는 경우 길이가 0
    if (apps.length === 0) {
      console.info('초기화가 안되어있네용 : firebase client init start');
      initializeApp(FirebaseCredentials);
    }
    this.auth = getAuth();
    console.info('firebase auth');
  }

  public static getInstance(): FirebaseClient {
    if (FirebaseClient.instance === undefined || FirebaseClient.instance === null) {
      FirebaseClient.instance = new FirebaseClient();
    }
    return FirebaseClient.instance;
  }

  public get Auth(): Auth {
    return this.auth;
  }
}
