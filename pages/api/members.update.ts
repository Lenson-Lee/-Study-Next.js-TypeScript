import { NextApiRequest, NextApiResponse } from 'next';
import MemberCtrl from '@/controllers/member.ctrl';
import handleError from '@/controllers/error/handle_error';
import checkSupportMethod from '@/controllers/error/check_support_method';

// 사용자 정보 (name, photoURL, 자기소개(null 가능)) 수정
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const supportMethod = ['POST'];
  try {
    checkSupportMethod(supportMethod, method);
    await MemberCtrl.update(req.body, res);
  } catch (err) {
    console.error(err);
    //에러 처리
    handleError(err, res);
  }
}
