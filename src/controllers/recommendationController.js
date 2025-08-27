import { recommendDoctors } from '../utils/recommendation.js';


export const recommend = async (req, res) => {
const { symptomsText, branchId } = req.body;
const results = await recommendDoctors({ symptomsText, branchId });
res.json(results);
};