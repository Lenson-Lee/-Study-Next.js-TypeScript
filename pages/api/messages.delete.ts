import { NextApiRequest, NextApiResponse } from 'next';
import handleError from '@/controllers/error/handle_error';
import checkSupportMethod from '@/controllers/error/check_support_method';
import MessageCtrl from '@/controllers/message.ctrl';

// members.add.ts 복북
// DELETE 할 예정
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const supportMethod = ['DELETE'];
  try {
    checkSupportMethod(supportMethod, method);
    await MessageCtrl.deleteMessage(req, res);
  } catch (err) {
    console.error(err);
    //에러 처리
    handleError(err, res);
  }
}
