import { NextApiRequest, NextApiResponse } from "next";
import { getXataClient } from "../../src/xata";
const xata = getXataClient();
var handler = async (req: NextApiRequest, res: NextApiResponse) => {
    var apiKeyServer = process.env.APP_SECRET;
    if (!apiKeyServer) {
        res.status(403).json("Forbidden");
        return;
    }
    const records = await xata.db.shared_webnotes.filter("slug", req.query.slug as string).getAll();
    if (records.length > 0) {
        return res.status(200).json(false);
    } else return res.status(200).json(true);
};
export default handler;
