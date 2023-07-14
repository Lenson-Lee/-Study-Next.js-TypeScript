export interface InAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  intro: string | null; //소개글

  // 수정하기 위한 데이터
  updateName: string | null;
  updateIntro: string | null;
}
