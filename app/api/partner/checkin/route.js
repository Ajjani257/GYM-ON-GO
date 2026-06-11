import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Gym from '@/models/Gym';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'partner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Find gym owned by this partner
    const gym = await Gym.findOne({ ownerId: session.user.id });
    if (!gym) {
      return NextResponse.json({ error: 'No gym associated with this partner account' }, { status: 404 });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId).populate('userId', 'name email');
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Ensure booking belongs to partner's gym
    if (booking.gymId.toString() !== gym._id.toString()) {
      return NextResponse.json({ error: 'This booking belongs to another gym' }, { status: 403 });
    }

    if (booking.status === 'completed') {
      return NextResponse.json({ error: 'Booking is already checked-in' }, { status: 400 });
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'This booking has been cancelled' }, { status: 400 });
    }

    // Update booking status
    booking.status = 'completed';
    await booking.save();

    // Increment user workout metrics
    const user = await User.findById(booking.userId);
    if (user) {
      const isFirstWorkout = !user.totalWorkouts || user.totalWorkouts === 0;
      user.totalWorkouts = (user.totalWorkouts || 0) + 1;
      user.thisMonth = (user.thisMonth || 0) + 1;

      if (isFirstWorkout && user.referredBy && !user.referralClaimed) {
        const referrer = await User.findById(user.referredBy);
        if (referrer) {
          // Credit Referrer
          referrer.walletBalance = (referrer.walletBalance || 0) + 100;
          referrer.referralsCount = (referrer.referralsCount || 0) + 1;
          await referrer.save();

          await Transaction.create({
            userId: referrer._id,
            amount: 100,
            type: 'credit',
            description: `Referral reward: friend ${user.name} completed first workout`,
          });

          // Credit Referee
          user.walletBalance = (user.walletBalance || 0) + 50;
          user.referralClaimed = true;

          await Transaction.create({
            userId: user._id,
            amount: 50,
            type: 'credit',
            description: `Referral welcome bonus credit`,
          });
        }
      }
      // Award +5 bonus loyalty points on first check-in
      const BONUS_POINTS = 5;
      const POINTS_THRESHOLD = 100;
      const REWARD_AMOUNT = 50;
      user.loyaltyPoints = (user.loyaltyPoints || 0) + BONUS_POINTS;
      user.lifetimePoints = (user.lifetimePoints || 0) + BONUS_POINTS;
      const redeemable = Math.floor(user.loyaltyPoints / POINTS_THRESHOLD);
      if (redeemable > 0) {
        const rewardCredit = redeemable * REWARD_AMOUNT;
        user.walletBalance = (user.walletBalance || 0) + rewardCredit;
        user.loyaltyPoints -= redeemable * POINTS_THRESHOLD;
        await Transaction.create({
          userId: user._id,
          type: 'credit',
          amount: rewardCredit,
          description: `Loyalty reward: ${redeemable * POINTS_THRESHOLD} pts → ₹${rewardCredit} wallet credit`,
        });
      }
      await user.save();
    }

    // Record Partner Settlement Transaction (85% payout to partner, 15% platform commission)
    const payoutAmount = Math.round(booking.price * 0.85);
    await Transaction.create({
      userId: session.user.id,
      amount: payoutAmount,
      type: 'credit',
      description: `Payout for check-in: ${user?.name || 'User'} (${booking.timeSlot})`,
    });

    // Update partner wallet balance
    const partnerUser = await User.findById(session.user.id);
    if (partnerUser) {
      partnerUser.walletBalance = (partnerUser.walletBalance || 0) + payoutAmount;
      await partnerUser.save();
    }

    return NextResponse.json({
      message: `Check-in successful! ₹${payoutAmount} credited to ledger.`,
      booking
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
