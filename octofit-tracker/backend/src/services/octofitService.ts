import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const body = (input ?? {}) as Record<string, unknown>;
  const userId = typeof body.userId === 'string' ? body.userId : undefined;
  const teamId = typeof body.teamId === 'string' ? body.teamId : undefined;
  const type = typeof body.type === 'string' ? body.type.trim() : '';
  const minutes = Number(body.minutes);

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw httpError(400, 'A valid userId is required.');
  }
  if (!teamId || !mongoose.Types.ObjectId.isValid(teamId)) {
    throw httpError(400, 'A valid teamId is required.');
  }
  if (!type) {
    throw httpError(400, 'Activity type is required.');
  }
  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw httpError(400, 'Minutes must be a positive number.');
  }

  const user = await User.findById(userId);
  const team = await Team.findById(teamId);
  if (!user || !team) {
    throw httpError(400, 'The referenced user and team must exist.');
  }

  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });

  return activity.toObject ? activity.toObject() : activity;
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = (input ?? {}) as Record<string, unknown>;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const mascot = typeof body.mascot === 'string' ? body.mascot.trim() : '';
  const members = Array.isArray(body.members) ? body.members : [];

  if (!name) {
    throw httpError(400, 'Team name is required.');
  }
  if (!mascot) {
    throw httpError(400, 'Team mascot is required.');
  }

  const memberIds = members.map((member) => {
    const value = String(member);
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw httpError(400, 'Each team member must be a valid user id.');
    }
    return new mongoose.Types.ObjectId(value);
  });

  const team = await Team.create({ name, mascot, members: memberIds });
  return team.toObject ? team.toObject() : team;
}

export async function getLeaderboard() {
  const summary = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
  ]);

  const teamIds = summary.map((entry) => entry._id);
  const teams = await Team.find({ _id: { $in: teamIds } }).lean();
  const teamMap = new Map<string, string>(teams.map((team) => [team._id.toString(), team.name]));

  return summary.map((entry, index) => ({
    teamName: teamMap.get(entry._id.toString()) ?? 'Unknown team',
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const normalizedEmail = userEmail.trim();
  const user = await User.findOne({ email: normalizedEmail }).lean();
  if (!user) {
    throw httpError(404, 'No user matches that email address.');
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean();
  const recentType = recentActivities[0]?.type ?? user.fitnessGoal ?? 'endurance';
  const preferredFocus = user.fitnessGoal ?? recentType;

  const workouts = await Workout.find({}).lean();
  const ranked = workouts
    .map((workout) => {
      let score = 0;
      if (workout.focus === preferredFocus) score += 3;
      if (workout.focus === recentType) score += 2;
      if (workout.title.toLowerCase().includes(String(recentType).toLowerCase())) score += 1;
      return { workout, score };
    })
    .sort((left, right) => right.score - left.score || left.workout.title.localeCompare(right.workout.title));

  if (ranked.length === 0) {
    return [];
  }

  return ranked.map(({ workout, score }) => ({
    ...workout,
    reason: score > 0
      ? `Matches your ${preferredFocus} goal and recent ${recentType} activity.`
      : `Try a ${workout.focus} session to support your fitness plan.`,
  }));
}

export { User };
