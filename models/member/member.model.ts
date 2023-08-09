import FirebaseAdmin from '../firebase_admin';
import { InAuthUser, ScreenNameUser } from '../in_auth_user';

const MEMBER_COL = 'members';
const SCR_NAME_COL = 'screen_names';

type AddResult = { result: true; id: string } | { result: false; message: string };

async function add({ uid, displayName, email, photoURL }: InAuthUser): Promise<AddResult> {
  try {
    const screenName = (email as string).replace('@gmail.com', '');
    const addResult = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
      const memberRef = FirebaseAdmin.getInstance().Firestore.collection(MEMBER_COL).doc(uid);
      const screenNameRef = FirebaseAdmin.getInstance().Firestore.collection(SCR_NAME_COL).doc(screenName);
      const memberDoc = await transaction.get(memberRef);
      if (memberDoc.exists) {
        // 이미 추가된 상태
        return false;
      }
      const addData = {
        uid,
        email,
        displayName: displayName ?? '',
        photoURL: photoURL ?? '',
      };
      await transaction.set(memberRef, addData);
      await transaction.set(screenNameRef, addData);
      return true;
    });
    if (addResult === false) {
      return { result: true, id: uid };
    }
    return { result: true, id: uid };
  } catch (err) {
    console.error(err);
    /** server side쪽의 에러 */
    return { result: false, message: '서버에러' };
  }
}

/** 사용자 페이지를 위한 유저데이터 + intro(소개글) get */
async function findByScreenName(screenName: string): Promise<InAuthUser | null> {
  const memberRef = FirebaseAdmin.getInstance().Firestore.collection(SCR_NAME_COL).doc(screenName);
  const memberDoc = await memberRef.get();

  if (memberDoc.exists === false) {
    return null;
  }
  // InAuthUser 에는 구글 로그인 정보에도 사용하는 형이라 intro를 넣을 수 없어서 새로운 인터페이스 제작
  const data = memberDoc.data() as ScreenNameUser;

  return data;
}

/** 둘러보기 기능을 위해 모든 유저 스크린 네임 get */
async function findAllName() {
  const memberRef = FirebaseAdmin.getInstance().Firestore.collection(SCR_NAME_COL).get();

  const memberList: any = [];

  /** doc.id : 문서명(여기서는 스크린네임), doc.data() : 문서 속 컬렉션 */
  (await memberRef).docs.map((doc) => {
    memberList.push({
      screen_name: doc.id,
      name: doc.data().displayName,
      photoURL: doc.data().photoURL,
    });
    return memberList;
  });

  return memberList;
}

/** 유저 정보 수정하기 */
async function update({
  uid,
  email,
  displayName,
  introduce,
  photoURL,
}: {
  uid: string;
  email: string;
  displayName: string;
  introduce: string;
  photoURL: string;
}): Promise<AddResult> {
  try {
    const updateResult = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
      /** 일치하는 멤버 존재하는지 확인  */
      const memberRef = FirebaseAdmin.getInstance().Firestore.collection(MEMBER_COL).doc(uid);
      const memberDoc = await transaction.get(memberRef);

      const screenName = (email as string).replace('@gmail.com', '');
      const screenNameRef = FirebaseAdmin.getInstance().Firestore.collection(SCR_NAME_COL).doc(screenName);

      const updateDate = {
        uid,
        displayName,
        // email,
        introduce,
        photoURL,
      };
      await transaction.update(memberRef, updateDate);
      await transaction.update(screenNameRef, updateDate);

      if (memberDoc.exists === false) {
        console.log('🥺 member_model - memberRef 없어요');
        return { result: false, id: uid };
      }
      return true;
    });
    console.log('👀 정보 수정 결과 :', updateResult);
    return { result: true, id: uid };
  } catch (err) {
    console.error('👀 정보 수정 에러 : ', err);
    /** server side쪽의 에러 */
    return { result: false, message: '서버에러' };
  }
}

const MemberModel = {
  add,
  findByScreenName,
  findAllName,
  update,
};

export default MemberModel;
