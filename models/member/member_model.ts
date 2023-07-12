import FirebaseAdmin from '../firebase_admin';
import { InAuthUser } from '../in_auth_user';

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

async function findByScreenName(screenName: string): Promise<InAuthUser | null> {
  const memberRef = FirebaseAdmin.getInstance().Firestore.collection(SCR_NAME_COL).doc(screenName);
  const memberDoc = await memberRef.get();
  if (memberDoc.exists === false) {
    return null;
  }
  const data = memberDoc.data() as InAuthUser; //이미 타입캐스트가 되어있음
  return data;
}

/** 둘러보기 기능을 위해 모든 유저 스크린 네임 get */
async function findAllName() {
  const memberRef = FirebaseAdmin.getInstance().Firestore.collection(SCR_NAME_COL).get();

  const memberList: any = [];

  /** doc.id : 문서명(여기서는 스크린네임), doc.data() : 문서 속 컬렉션 */
  const memberDoc = (await memberRef).docs.map((doc) => {
    memberList.push({
      screen_name: doc.id,
      name: doc.data().displayName,
      photoURL: doc.data().photoURL,
    });
    return memberList;
  });

  return memberList;
}

const MemberModel = {
  add,
  findByScreenName,
  findAllName,
};

export default MemberModel;
