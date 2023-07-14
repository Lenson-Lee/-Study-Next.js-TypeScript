import { firestore } from 'firebase-admin';

/**
 * 회원 정보
 *
 */

//인터페이스 기본
interface InfoBase {
  uid: string;
  name: string;
  photoURL: string;
  intro?: string;
}
