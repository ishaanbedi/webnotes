import { NextApiRequest, NextApiResponse } from "next";
import { getXataClient } from "../../src/xata";
const xata = getXataClient();
var handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (
    req.headers["user-agent"] !==
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
  ) {
    res.status(403).json("Forbidden");
    return;
  }
  var apiKeyServer = process.env.API_KEY_SERVER;
  if (req.query.apiKey !== apiKeyServer) {
    res.status(403).json("Forbidden");
    return;
  }
  const record = await xata.db.shared_webnotes.create({
    note: JSON.stringify(req.query.note),
  });
  res.status(200).json(record.id.slice(4));
};
export default handler;
