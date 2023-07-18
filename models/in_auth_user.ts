export interface InAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface ScreenNameUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  introduce: string | null; //소개글 -> 파이어베이스 제공 정보가 아님
}
