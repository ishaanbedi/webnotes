import { NextApiRequest, NextApiResponse } from "next";
import { getXataClient } from "../../src/xata";
const xata = getXataClient();
var handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const record = await xata.db.shared_webnotes.create({
    note: JSON.stringify(req.query.note),
  });
  res.status(200).json(record.id.slice(4));
};
export default handler;
