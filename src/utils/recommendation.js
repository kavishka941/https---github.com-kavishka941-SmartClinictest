import { SymptomMap } from '../models/SymptomMap.js';
import { DoctorProfile } from '../models/DoctorProfile.js';
import { Feedback } from '../models/Feedback.js';


export const recommendDoctors = async ({ symptomsText, branchId, limit = 5 }) => {
// naive keyword split; can be replaced by NLP later
const tokens = symptomsText.toLowerCase().split(/[^a-z]+/).filter(Boolean);
const maps = await SymptomMap.find({ symptom: { $in: tokens } }).lean();
const specialties = new Set(maps.flatMap((m) => m.specialties));


const matchQuery = { };
if (specialties.size > 0) matchQuery.specialties = { $in: [...specialties] };
const docs = await DoctorProfile.find(matchQuery)
.populate({ path: 'user', select: 'name email phone branch role isActive', match: { isActive: true, role: 'doctor', ...(branchId ? { branch: branchId } : {}) } })
.lean();


const docIds = docs.map((d) => d.user?._id).filter(Boolean);
const ratings = await Feedback.aggregate([
{ $match: { doctor: { $in: docIds } } },
{ $group: { _id: '$doctor', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
]);
const ratingMap = new Map(ratings.map((r) => [String(r._id), r]));


const scored = docs
.filter((d) => d.user)
.map((d) => {
const r = ratingMap.get(String(d.user._id)) || { avgRating: 0, count: 0 };
const specialtyScore = specialties.size === 0 ? 0.5 : (d.specialties?.some((s) => specialties.has(s)) ? 1 : 0);
const score = specialtyScore * 0.6 + (r.avgRating / 5) * 0.4; // weighted
return { doctorProfile: d, score, rating: r.avgRating || 0, ratingCount: r.count || 0 };
})
.sort((a, b) => b.score - a.score)
.slice(0, limit);


return scored;
};