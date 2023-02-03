import * as admin from 'firebase-admin';

interface Config {
  credential: {
    privateKey: string;
    clientEmail: string;
    projectId: string;
  };
}

export default class FirebaseAdmin {
  public static instance: FirebaseAdmin;

  private init = false;

  public static getInstance(): FirebaseAdmin {
    if (FirebaseAdmin.instance === undefined || FirebaseAdmin.instance === null) {
      //초기화 진행
      FirebaseAdmin.instance = new FirebaseAdmin();
      //TODO:환경초기화
      FirebaseAdmin.instance.bootstrap();
    }
    return FirebaseAdmin.instance;
  }

  private bootstrap(): void {
    // apps에 등록되어있는 앱이 있을 때 (갯수가 0이 아닐 때)
    const haveApp = admin.apps.length !== 0;
    if (haveApp) {
      this.init = true;
      return;
    }

    //config 인터페이스로 config객체 할당(초기화)
    //.env에 접근해서 바로 사용, env에 없는 경우 ''로 처리
    //privateKey는 원래 개행문자가 포함된 여러줄 텍스트인데 반환할 때는
    //JSON에서 표현할 수 없어 개행문자를 넣어 한줄로 만들어서 이제 원래대로 만들어주는것.
    const config: Config = {
      credential: {
        projectId: process.env.projectId || '',
        clientEmail: process.env.clientEmail || '',
        privateKey: (process.env.privateKey || '').replace(/\\n/g, '\n'),
      },
    };

    //credential 타입의 객체를 받음.
    admin.initializeApp({ credential: admin.credential.cert(config.credential) });
    console.info('bootstrap firebase admin');
  }

  /** firsestore를 반환 */
  public get Firestore(): FirebaseFirestore.Firestore {
    if (this.init === false) {
      this.bootstrap();
    }
    return admin.firestore();
  }

  public get Auth(): admin.auth.Auth {
    if (this.init === false) {
      this.bootstrap();
    }
    return admin.auth();
  }
}
