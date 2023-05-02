import { NextApiRequest, NextApiResponse } from "next";
import { getXataClient } from "../../src/xata";
const xata = getXataClient();
var handler = async (req, res) => {
  var apiKeyServer = process.env.APP_SECRET;
  if (!apiKeyServer) {
    res.status(403).json("Forbidden");
    return;
  }
  const recID = `rec_${req.query.recordID}`
  const record = await xata.db.shared_webnotes.update(recID, {
    slug: req.query.slug,
  });
  res.status(200).json(true);
};
export default handler;
